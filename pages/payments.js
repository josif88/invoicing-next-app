import {
  Button,
  Divider,
  Drawer,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Spin,
  Typography,
} from "antd";
import Header from "../components/common/Header";
import { verifyAuth } from "../utils/valdations";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  PrinterOutlined,
  SendOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { usePayments } from "../utils/hooks";
import { Table } from "antd";
import { useState } from "react";
import PaymentForm from "../components/payment/paymentForm";
import { PaymentView } from "../components/payment/paymentView";
import moment from "moment";

export default function Payments(props) {
  const [options, setOptions] = useState({
    current: 1,
    pageSize: 10,
    query: null,
  });

  const { payments, isLoading } = usePayments(options);
  const [loading, setLoading] = useState(false);
  const [printConf, setPrintConf] = useState(false);
  const [deleteConf, setDeleteConf] = useState(false);
  const [viewPayment, setViewPayment] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const sendToPrinter = (id) => {
    if (id) {
      setLoading(true);
      fetch(`/api/pdf/${id}/paymentCPrint`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setLoading(false);
            message.success("تم ارسال سند المقبوضات الى الطابعة بنجاح");
          } else {
            setLoading(false);
            message.error("حصل خطأ اثناء ارسال سند المقبوضات الى الطابعة");
          }
        });
    }
  };

  const deleteItem = (value) => {
    fetch(`/api/payment/${value.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.status === "error") {
          result.message.map((m) => message.error(m));
        }

        if (result.status === "ok") {
          message.success("تم حذف المستند");
          setSelectedPayment(null);
        }
      })
      .catch(console.log);
  };

  const columns = [
    {
      title: "رقم المستند",
      dataIndex: "id",
      key: "id",
    },

    {
      title: "الوكيل",
      dataIndex: "customer",
      key: "customer",
      render: (t, r) => r.customer.name,
    },
    {
      title: "القيمة",
      dataIndex: "value",
      key: "value",
      render: (t) => t.toLocaleString(),
    },
    {
      title: "التاريخ",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (t) => moment(t).format("YYYY/MM/DD"),
    },

    {
      title: "عن  القائمة",
      dataIndex: "invoiceId",
      key: "invoiceId",
      render: (t, r) => {
        return r.invoice ? (
          <a href={`/invoice/${r.invoice.id}`}>{r.invoice.id}</a>
        ) : (
          "غير محدد"
        );
      },
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
              setSelectedPayment(record);
              setShowDrawer(true);
            }}
          />
          <Button
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedPayment(record);
              setDeleteConf(true);
            }}
          />
          <Button
            href={`/api/pdf/${record.id}/payment`}
            target="_blank"
            size="small"
            icon={<PrinterOutlined />}
          />
          <Button
            size="small"
            icon={<SendOutlined />}
            onClick={() => {
              setSelectedPayment(record);
              setPrintConf(true);
            }}
          />

          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedPayment(record);
              setViewPayment(true);
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
        <Input
          placeholder="بحث عن سند بأسم الوكيل"
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

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setShowDrawer(true);
          }}
        >
          اصدار سند جديد
        </Button>
      </div>

      <Divider />
      <section>
        {!isLoading && (
          <Table
            columns={columns}
            dataSource={payments.payments}
            scroll={{ x: 700 }}
            rowKey={(r) => r.id}
            onChange={(page) => {
              setOptions({ ...options, ...page });
            }}
            pagination={{
              pageSize: options.pageSize,
              current: options.current,
              total: payments.count,
            }}
          />
        )}
      </section>
      <Drawer
        placement="top"
        height={"100%"}
        destroyOnClose
        closable={true}
        onClose={() => {
          setShowDrawer(false);
          setSelectedPayment(null);
        }}
        visible={showDrawer}
      >
        <PaymentForm {...props} payment={selectedPayment} />
      </Drawer>

      <Modal
        title="حذف المستند"
        visible={deleteConf}
        okText="نعم"
        cancelText="لا"
        destroyOnClose
        onOk={() => {
          deleteItem(selectedPayment);
          setDeleteConf(false);
        }}
        onCancel={() => {
          setSelectedPayment(null);
          setDeleteConf(false);
        }}
      >
        <p>سيتم ازالة المستند من لوحة الادارة </p>
      </Modal>

      <Modal
        title="انتباه"
        okType="primary"
        visible={printConf}
        okText="نعم"
        cancelText="لا"
        onOk={() => {
          sendToPrinter(selectedPayment.id);
          setSelectedPayment(null);
          setPrintConf(false);
        }}
        onCancel={() => {
          setSelectedPayment(null);
          setPrintConf(false);
        }}
      >
        <p>
          سيتم ارسال نسخة من الفاتورة الى الطابعة هل انت متأكد من هذا الاجراء؟
        </p>
      </Modal>

      <Modal
        closable
        footer={
          <Button
            onClick={() => {
              setSelectedPayment(null);
              setViewPayment(false);
            }}
          >
            اغلاق
          </Button>
        }
        destroyOnClose
        onCancel={() => {
          setSelectedPayment(null);
          setViewPayment(false);
        }}
        visible={viewPayment}
      >
        <PaymentView payment={selectedPayment} />
      </Modal>

      {loading && (
        <div className="overlay">
          <Spin size="large" />
        </div>
      )}
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
