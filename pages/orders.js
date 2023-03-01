import {
  Button,
  Checkbox,
  Divider,
  Drawer,
  Input,
  message,
  Modal,
  Space,
  Spin,
} from "antd";
import Header from "../components/common/Header";
import { verifyAuth } from "../utils/valdations";
import {
  DeleteOutlined,
  SearchOutlined,
  PrinterOutlined,
  SendOutlined,
  EyeOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useOrders } from "../utils/hooks";
import { Table } from "antd";
import { useState } from "react";
import moment from "moment";
import InvoiceFromOrder from "../components/invoice/invoiceFromOrder";
import useInvoiceStore from "../stores/invoiceStore";
import { OrderView } from "../components/order/orderView";
import { InvoiceView } from "../components/invoice/invoiceView";

export default function orders(props) {
  const [options, setOptions] = useState({
    current: 1,
    pageSize: 10,
    query: null,
  });

  const { data, isLoading } = useOrders(options);
  const [deleteConf, setDeleteConf] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewOrder, setViewOrder] = useState(false);
  const [printConf, setPrintConf] = useState(false);
  const resetInvoice = useInvoiceStore((state) => state.resetInvoice);
  const [viewInvoice, setViewInvoice] = useState(false);
  const [invoiceToDisplay, setInvoiceToDisplay] = useState(null);

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
      render: (text, record) => (
        <Checkbox
          checked={record.done}
          onChange={() => {
            setLoading(true);
            fetch(`/api/order/${record.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id: record.id, done: !record.done }),
            })
              .then((res) => res.json())
              .then((res) => {
                if (res.status === "ok") {
                  setLoading(false);
                  message.success("تم تغيير حالة الطلب");
                } else {
                  setLoading(false);
                  message.error("حصل خطأ ما");
                }
              });
          }}
        />
      ),
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
            onClick={() => {
              setSelectedOrder(record);
              setInvoice({
                adminId: props.adminId,
                customerId: record.customerId,
                onCredit: true,
                invoiceItem: record.orderItem.map((i) => {
                  return {
                    product: i.product,
                    productId: i.productId,
                    quantity: i.quantity,
                    price: i.product.price,
                  };
                }),
                createdAt: moment(record.createdAt),
                note: `${record.note} | رقم الهاتف: ${record.phoneNumber} | العنوان: ${record.location} | رقم الطلب: ${record.id}`,
              });
            }}
          >
            تجهيز
          </Button>
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
          <Button
            size="small"
            icon={<SendOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setPrintConf(true);
            }}
          />

          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setViewOrder(true);
            }}
          />

          {record.invoiceId && (
            <Button
              size="small"
              icon={<MenuOutlined />}
              onClick={() => {
                fetch(`/api/invoice/${record.invoiceId}`)
                  .then((res) => res.json())
                  .then((res) => {
                    if (res.status === "ok") {
                      setInvoiceToDisplay({
                        ...res.data,
                        createdAt: moment(res.data.createdAt),
                      });
                      setViewInvoice(true);
                    } else {
                      message.error("القائمة غير موجودة");
                    }
                  });
              }}
            />
          )}
        </Space>
      ),
    },
  ];

  const sendToPrinter = (id) => {
    if (id) {
      setLoading(true);
      fetch(`/api/pdf/${id}/orderCPrint`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setLoading(false);
            message.success("تم ارسال الطلب الى الطابعة بنجاح");
          } else {
            setLoading(false);
            message.error("حصل خطأ اثناء ارسال الطلب الى الطابعة");
          }
        });
    }
  };

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
    <div className="rtl container">
      <Header {...props} />

      <Divider />

      <div className="grid align-items">
        <Input
          placeholder="بحث باسم الوكيل"
          allowClear
          onChange={(e) => {
            setOptions({ ...options, query: e.target.value, current: 1 });
          }}
          value={options.query}
          addonAfter={<SearchOutlined />}
        />
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
              setOptions({ ...options, ...page });
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
        <p>هل انت متأكد من حذف الطلب</p>
      </Modal>

      <Modal
        title="انتباه"
        okType="primary"
        visible={printConf}
        okText="نعم"
        cancelText="لا"
        onOk={() => {
          sendToPrinter(selectedOrder.id);
          setSelectedOrder(null);
          setPrintConf(false);
        }}
        onCancel={() => {
          setSelectedOrder(null);
          setPrintConf(false);
        }}
      >
        <p>
          سيتم ارسال نسخة من الفاتورة الى الطابعة هل انت متأكد من هذا الاجراء؟
        </p>
      </Modal>

      {loading && (
        <div className="overlay">
          <Spin size="large" />
        </div>
      )}

      <Drawer
        placement="top"
        height={"100%"}
        closable={true}
        onClose={() => {
          setInvoice(null);
          resetInvoice();
        }}
        destroyOnClose
        visible={invoice}
      >
        <InvoiceFromOrder {...props} invoice={invoice} order={selectedOrder} />
      </Drawer>

      <Modal
        onCancel={() => {
          setSelectedOrder(null);
          setViewOrder(false);
        }}
        footer={
          <Button
            onClick={() => {
              setSelectedOrder(null);
              setViewOrder(false);
            }}
          >
            اغلاق
          </Button>
        }
        destroyOnClose
        visible={viewOrder}
      >
        <OrderView order={selectedOrder} />
      </Modal>

      <Modal
        onCancel={() => {
          setInvoiceToDisplay(null);
          setViewInvoice(false);
        }}
        footer={
          <Button
            onClick={() => {
              setInvoiceToDisplay(null);
              setViewInvoice(false);
            }}
          >
            اغلاق
          </Button>
        }
        destroyOnClose
        visible={viewInvoice}
      >
        {invoiceToDisplay && <InvoiceView invoice={invoiceToDisplay} />}
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
