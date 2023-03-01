import {
  Button,
  Checkbox,
  Divider,
  Input,
  message,
  Modal,
  Space,
  Tag,
} from "antd";

import {
  DeleteOutlined,
  SearchOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useOrders, useOrdersByUserRef } from "../../utils/hooks";
import { Table } from "antd";
import { useState } from "react";
import moment from "moment";

export default function OrdersTable(props) {
  const [options, setOptions] = useState({
    current: 1,
    pageSize: 10,
    query: null,
  });

  const { data, isLoading } = props.customerRef
    ? useOrdersByUserRef(options, props.customerRef)
    : useOrders(options);
  const [deleteConf, setDeleteConf] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const deleteOrder = (value) => {
    fetch(`/api/order/${selectedOrder.id}}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(value),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.status === "error") {
          result.message.map((m) => message.error(m));
        }

        if (result.status === "ok") {
          setSelectedOrder(null);
          message.success("تم ازالة الطلب");
        }
      })
      .catch(console.log);
  };

  const columns = [
    {
      title: "مكتمل",
      dataIndex: "done",
      key: "done",
      render: (text, record) =>
        record.done ? <Tag color="green">نعم</Tag> : <Tag color="red">لا</Tag>,
    },
    {
      title: "رقم الطلب",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "اسم الوكيل",
      dataIndex: "customer.name",
      key: "customer.name",
      width: "150px",
      render: (text, record) =>
        record.customer ? <a>{record.customer.name}</a> : "عميل نقدي",
    },
    {
      title: "التاريخ",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text, record) => moment(record.createdAt).format("YYYY/MM/DD"),
    },
    {
      title: "الوقت",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text, record) => moment(record.createdAt).format("HH:mm"),
    },
    {
      title: "الملاحظات",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "الاجراء",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setDeleteConf(true);
            }}
          />

          <Button
            size="small"
            icon={<PrinterOutlined />}
            href={`/api/pdf/${record.id}/order`}
            target="_blank"
          />
        </Space>
      ),
    },
  ];

  const orderItemsTable = (data) => {
    const columns = [
      {
        title: "اسم المادة",
        dataIndex: "name",
        key: "name",
        render: (t, r) => (
          <Space>
            {r.product.image && (
              <img src={r.product.image} height={25} width={25} />
            )}
            {r.product.name}
          </Space>
        ),
      },
      { title: "العدد", dataIndex: "quantity", key: "quantity" },
    ];

    return (
      <Table
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={data}
        pagination={false}
        size="small"
      />
    );
  };

  return (
    <>
      <div className="grid align-items">
        {!props.customerName && (
          <Input
            placeholder="بحث باسم الوكيل"
            allowClear
            onChange={(e) => {
              setOptions({ ...options, query: e.target.value });
            }}
            value={options.query}
            addonAfter={<SearchOutlined />}
          />
        )}
        <div />
        <Input
          addonBefore="عدد النتائج"
          type="number"
          pattern="\d*"
          style={{ width: "100%" }}
          onChange={(e) => {
            if (!e.target.value) {
              return;
            }
            setOptions({ ...options, pageSize: e.target.value });
          }}
          value={options.pageSize}
        />
      </div>

      <Divider />

      <section>
        {!isLoading && (
          <Table
            scroll={{ x: 700 }}
            columns={columns}
            onChange={(page) => {
              setOptions(page);
            }}
            pagination={{
              pageSize: options.pageSize,
              total: data.count,
              current: options.current,
            }}
            dataSource={data.orders}
            rowKey={(record) => record.id}
            expandable={{
              expandedRowRender: (record) => orderItemsTable(record.orderItem),
              rowExpandable: (record) => record.orderItem.length > 0,
            }}
          />
        )}
      </section>

      <Modal
        title="انتباه"
        okType="danger"
        visible={deleteConf}
        okText="نعم"
        cancelText="لا"
        onOk={() => {
          deleteOrder(selectedOrder);
          setDeleteConf(false);
        }}
        onCancel={() => {
          setSelectedOrder(null);
          setDeleteConf(false);
        }}
      >
        <p>سيتم حذف الطلب هل انت متأكد؟</p>
      </Modal>

      <div style={{ display: "none" }}></div>
    </>
  );
}

export const getServerSideProps = async ({ req, res }) => {
  let payload = verifyAuth(req.cookies.token);
  if (!payload) {
    res.writeHead(302, {
      Location: "/login",
    });
    res.end();
  }

  return { props: { token: req.cookies.token || null, adminId: payload.id } };
};
