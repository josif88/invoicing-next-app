import {
  Button,
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
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  PrinterOutlined,
  SendOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useExpenses } from "../utils/hooks";
import { Table } from "antd";
import { useState } from "react";

import { PaymentView } from "../components/payment/paymentView";
import ExpenseForm from "../components/expense/expenseForm";
import moment from "moment";
import { ExpenseView } from "../components/expense/expenseView";

export default function expenses(props) {
  const [options, setOptions] = useState({
    current: 1,
    pageSize: 10,
    query: null,
  });

  const { expenses, count, isLoading } = useExpenses(options);
  const [loading, setLoading] = useState(false);
  const [printConf, setPrintConf] = useState(false);
  const [deleteConf, setDeleteConf] = useState(false);
  const [viewExpense, setViewExpense] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const sendToPrinter = (id) => {
    if (id) {
      setLoading(true);
      fetch(`/api/pdf/${id}/expenseCPrint`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setLoading(false);
            message.success("تم ارسال سند الصرف الى الطابعة بنجاح");
          } else {
            setLoading(false);
            message.error("حصل خطأ اثناء ارسال سند الصرف الى الطابعة");
          }
        });
    }
  };

  const deleteItem = (value) => {
    fetch(`/api/expense/${value.id}`, {
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
          selectedExpense(null);
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
      title: "المستلم",
      dataIndex: "issuedTo",
      key: "issuedTo",
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
      key: "CreatedAt",
      render: (t) => moment(t).format("YYYY/MM/DD"),
    },
    {
      title: "الوقت",
      dataIndex: "createdAt",
      key: "CreatedAt",
      render: (t) => moment(t).format("HH:mm"),
    },
    {
      title: "الصنف",
      dataIndex: "category",
      key: "category",
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
              setSelectedExpense(record);
              setShowDrawer(true);
            }}
          />
          <Button
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedExpense(record);
              setDeleteConf(true);
            }}
          />
          <Button
            href={`/api/pdf/${record.id}/expense`}
            target="_blank"
            size="small"
            icon={<PrinterOutlined />}
          />
          <Button
            size="small"
            icon={<SendOutlined />}
            onClick={() => {
              setSelectedExpense(record);
              setPrintConf(true);
            }}
          />

          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedExpense(record);
              setViewExpense(true);
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
          placeholder="بحث عن سند بأسم المستلم او باب الصرف"
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
          اصدار سند صرف جديد
        </Button>
      </div>

      <Divider />
      <section>
        {!isLoading && (
          <Table
            columns={columns}
            dataSource={expenses}
            scroll={{ x: 700 }}
            rowKey={(r) => r.id}
            onChange={(page) => {
              setOptions({ ...options, ...page });
            }}
            pagination={{
              pageSize: options.pageSize,
              current: options.current,
              total: count,
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
          setSelectedExpense(null);
        }}
        visible={showDrawer}
      >
        <ExpenseForm {...props} expense={selectedExpense} />
      </Drawer>

      <Modal
        title="حذف المستند"
        visible={deleteConf}
        okText="نعم"
        cancelText="لا"
        destroyOnClose
        onOk={() => {
          deleteItem(selectedExpense);
          setDeleteConf(false);
        }}
        onCancel={() => {
          setSelectedExpense(null);
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
          sendToPrinter(selectedExpense.id);
          setSelectedExpense(null);
          setPrintConf(false);
        }}
        onCancel={() => {
          setSelectedExpense(null);
          setPrintConf(false);
        }}
      >
        <p>
          سيتم ارسال نسخة من سند الصرف الى الطابعة هل انت متأكد من هذا الاجراء؟
        </p>
      </Modal>

      <Modal
        closable
        footer={
          <Button
            onClick={() => {
              setSelectedExpense(null);
              setViewExpense(false);
            }}
          >
            اغلاق
          </Button>
        }
        destroyOnClose
        onCancel={() => {
          setSelectedExpense(null);
          setViewExpense(false);
        }}
        visible={viewExpense}
      >
        <ExpenseView expense={selectedExpense} />
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
