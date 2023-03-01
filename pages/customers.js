import {
  Button,
  Divider,
  Drawer,
  InputNumber,
  Input,
  message,
  Modal,
  Space,
  Tag,
  Typography,
} from "antd";
import Header from "../components/common/Header";
import { verifyAuth } from "../utils/valdations";
import {
  PlusOutlined,
  DeleteOutlined,
  MessageOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useDebits } from "../utils/hooks";
import { Table } from "antd";
import { useState } from "react";
import CustomerForm from "../components/customer/customerForm";

export default function Customers(props) {
  //TODO find solution to get row counts
  const [options, setOptions] = useState({
    current: 1,
    pageSize: 10,
    query: null,
  });

  const { customers, count, isLoading } = useDebits(options);
  const [showSendCustomerLink, setShowSendCustomerLink] = useState(false);
  const [deleteConf, setDeleteConf] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const deleteCustomer = (value) => {
    fetch("/api/customer/delete", {
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
          message.success("تم حذف العميل");
        }
      })
      .catch(console.log);
  };

  const sendCustomerLink = (value) => {
    fetch("/api/login/sendLink", {
      method: "POST",
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
          message.success("تم ارسال الرابط");
        }
      })
      .catch(console.log);
  };

  const columns = [
    {
      title: "اسم الوكيل",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <a
          onClick={() => {
            setShowDrawer(true);
            setSelectedCustomer(record);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "رقم الهاتف",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "الاسم التجاري",
      dataIndex: "businessName",
      key: "businessName",
    },
    {
      title: "المديونية",
      dataIndex: "debit",
      key: "debit",
      render: (t) =>
        +t <= 0 ? (
          +t == 0 ? (
            <Tag color="green">{t.toLocaleString()}</Tag>
          ) : (
            <Tag color="cyan">{t.toLocaleString()}</Tag>
          )
        ) : (
          <Tag color="red">{t.toLocaleString()}</Tag>
        ),
    },
    {
      title: "الاجراء",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setShowDrawer(true);
              setSelectedCustomer(record);
            }}
          />
          <Button
            size="small"
            icon={<MessageOutlined />}
            onClick={() => {
              setSelectedCustomer(record);
              setShowSendCustomerLink(true);
            }}
          />
          <Button
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedCustomer(record);
              setDeleteConf(true);
            }}
          />
        </Space>
      ),
    },
  ];
  return (
    <div className="rtl container">
      <Header {...props} />

      <Divider />
      <div className="grid align-items">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setShowDrawer(true);
          }}
        >
          اضف وكيل
        </Button>
        <Input
          placeholder="بحث باسم الوكيل"
          allowClear
          onChange={(e) => {
            setOptions({ ...options, query: e.target.value, current: 1 });
          }}
          value={options.query}
          addonAfter={<SearchOutlined />}
        />
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
            onChange={(page) => {
              setOptions({ ...options, ...page });
            }}
            pagination={{
              pageSize: options.pageSize,
              current: options.current,
              total: count,
            }}
            columns={columns}
            dataSource={customers}
            scroll={{ x: 700 }}
            rowKey={(r) => r.id}
          />
        )}
      </section>
      <Drawer
        placement="top"
        height={"100%"}
        closable={true}
        onClose={() => {
          setShowDrawer(false);
          setSelectedCustomer(null);
        }}
        destroyOnClose
        visible={showDrawer}
      >
        <CustomerForm {...props} customer={selectedCustomer} />
      </Drawer>

      <Modal
        title="حذف الوكيل"
        okText="نعم"
        cancelText="لا"
        visible={deleteConf}
        onOk={() => {
          deleteCustomer(selectedCustomer);
          setDeleteConf(false);
        }}
        onCancel={() => {
          setSelectedCustomer(null);
          setDeleteConf(false);
        }}
      >
        <p>سيتم ازالة الوكيل من لوحة الادارة </p>
      </Modal>

      <Modal
        title="ارسال رابط"
        okText="نعم"
        cancelText="لا"
        visible={showSendCustomerLink}
        onOk={() => {
          sendCustomerLink(selectedCustomer);
          setShowSendCustomerLink(false);
        }}
        onCancel={() => {
          setSelectedCustomer(null);
          setShowSendCustomerLink(false);
        }}
      >
        {selectedCustomer && (
          <p>{`سيتم ارسال رسالة تتضمن رابط الطلبات الى الوكيل ${selectedCustomer.name}`}</p>
        )}
      </Modal>
    </div>
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
