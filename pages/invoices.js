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
  SearchOutlined,
  PrinterOutlined,
  SendOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useInvoices } from "../utils/hooks";
import { Table } from "antd";
import { useState } from "react";
import moment from "moment";
import InvoiceForm from "../components/invoice/invoiceForm";
import useInvoiceStore from "../stores/invoiceStore";
import { InvoiceView } from "../components/invoice/invoiceView";
import EditInvoice from "../components/invoice/editInvoice";

export default function invoices(props) {
  const [options, setOptions] = useState({
    current: 1,
    pageSize: 10,
    query: null,
  });
  const { count, invoices, isLoading } = useInvoices(options);
  const resetInvoice = useInvoiceStore((state) => state.resetInvoice);
  const [deleteConf, setDeleteConf] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [printConf, setPrintConf] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteInvoice = (value) => {
    fetch(`/api/invoice/${selectedInvoice.id}}`, {
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
          setSelectedInvoice(null);
          message.success("تم حذف الفاتورة");
        }
      })
      .catch(console.log);
  };

  const columns = [
    {
      title: "رقم الفاتورة",
      dataIndex: "id",
      key: "id",
      width: "100px",
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
      title: "التسديد",
      dataIndex: "onCredit",
      key: "onCredit",
      render: (text, record) => (record.onCredit ? "آجل" : "نقد"),
    },
    {
      title: "التاريخ",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text, record) => moment(text).format("YYYY/MM/DD"),
    },
    {
      title: "الوقت",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "100px",
      render: (text, record) => moment(text).format("hh:mm A"),
    },
    {
      title: "اجمالي القائمة",
      dataIndex: "total",
      key: "total",
      render: (t, r) => {
        let total = 0;
        for (let i = 0; i < r.invoiceItem.length; i++) {
          total = total + r.invoiceItem[i].price * r.invoiceItem[i].quantity;
        }
        return total.toLocaleString();
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
              setSelectedInvoice(record);
              setIsEdit(true);
            }}
          />

          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedInvoice(record);
              setDeleteConf(true);
            }}
          />

          <Button
            size="small"
            icon={<PrinterOutlined />}
            href={`/api/pdf/${record.id}/invoice`}
            target="_blank"
          />
          <Button
            size="small"
            icon={<SendOutlined />}
            onClick={() => {
              setSelectedInvoice(record);
              setPrintConf(true);
            }}
          />
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedInvoice(record);
              setViewInvoice(true);
            }}
          />
        </Space>
      ),
    },
  ];

  const sendToPrinter = (id) => {
    if (id) {
      setLoading(true);
      fetch(`/api/pdf/${id}/invoiceCPrint`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setLoading(false);
            message.success("تم ارسال الفاتورة الى الطابعة بنجاح");
          } else {
            setLoading(false);
            message.error("حصل خطأ اثناء ارسال الفاتورة الى الطابعة");
          }
        });
    }
  };

  const invoiceItemsTable = (data) => {
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
      { title: "السعر", dataIndex: "price", key: "price" },
      {
        title: "المجموع",
        dataIndex: "subTotal",
        key: "subTotal",
        render: (t, r) => r.price * r.quantity,
      },
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
          قائمة جديدة
        </Button>
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
              total: count,
              current: options.current,
            }}
            dataSource={invoices}
            rowKey={(record) => record.id}
            expandable={{
              expandedRowRender: (record) =>
                invoiceItemsTable(record.invoiceItem),
              rowExpandable: (record) => record.invoiceItem.length > 0,
            }}
          />
        )}
      </section>
      <Drawer
        placement="top"
        height={"100%"}
        closable={true}
        onClose={() => {
          setShowDrawer(false);
          resetInvoice();
        }}
        destroyOnClose
        visible={showDrawer}
      >
        <InvoiceForm {...props} />
      </Drawer>

      <Modal
        title="انتباه"
        okType="danger"
        visible={deleteConf}
        okText="نعم"
        cancelText="لا"
        onOk={() => {
          deleteInvoice(selectedInvoice);
          setDeleteConf(false);
        }}
        onCancel={() => {
          setSelectedInvoice(null);
          setDeleteConf(false);
        }}
      >
        <p>
          سيتم حذف القائمة المرقمة وتعاد المواد الى المخزن هل انت متأكد من هذا
          الاجراء؟
        </p>
      </Modal>

      <Modal
        title="انتباه"
        okType="primary"
        visible={printConf}
        okText="نعم"
        cancelText="لا"
        onOk={() => {
          sendToPrinter(selectedInvoice.id);
          setSelectedInvoice(null);
          setPrintConf(false);
        }}
        onCancel={() => {
          setSelectedInvoice(null);
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
              setSelectedInvoice(null);
              setViewInvoice(false);
            }}
          >
            اغلاق
          </Button>
        }
        onCancel={() => {
          setSelectedInvoice(null);
          setViewInvoice(false);
        }}
        destroyOnClose
        visible={viewInvoice}
      >
        <InvoiceView invoice={selectedInvoice} />
      </Modal>

      <Drawer
        placement="top"
        height={"100%"}
        onClose={() => {
          setIsEdit(false);
          setSelectedInvoice(null);
          resetInvoice();
        }}
        closable={true}
        destroyOnClose
        visible={isEdit}
      >
        <EditInvoice invoice={selectedInvoice} />
      </Drawer>

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
