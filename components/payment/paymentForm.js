import {
  Button,
  Divider,
  Space,
  Typography,
  message,
  Input,
  Modal,
  Spin,
  Tag,
} from "antd";
import { useFormik } from "formik";
import { verifyAuth } from "../../utils/valdations";
import { useEffect, useState } from "react";
import moment from "moment";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import CustomerListView from "../common/customerListView";
import DateInput from "../common/dateInput";
import { InvoiceSheet } from "../invoice/invoiceSheet";
import writtenNumber from "written-number";

export default function PaymentForm(props) {
  const [invoice, setInvoice] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [disable, setDisable] = useState(true);
  const [payment, setPayment] = useState(props.payment);
  const [printConf, setPrintConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerDebt, setCustomerDebt] = useState(0);

  const formik = useFormik({
    initialValues: payment
      ? { ...payment }
      : {
          adminId: Number.parseInt(props.adminId),
          invoiceId: null,
          customerId: null,
          value: 0,
          note: null,
          createdAt: moment().format(),
        },
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  useEffect(() => {
    if (!formik.values.customerId) {
      setDisable(true);
      return;
    }

    if (formik.values.invoiceId)
      fetch(`/api/invoice/${formik.values.invoiceId}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.status === "ok") {
            setInvoice(result.data);
            setDisable(false);
          } else {
            setInvoice(null);
            setDisable(true);
          }
        });
    else {
      setInvoice(null);
      setDisable(false);
    }
  }, [formik.values.invoiceId, formik.values.customerId]);

  useEffect(() => {
    if (formik.values.customerId)
      fetch(`/api/customer/debt?id=${formik.values.customerId}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.status === "ok") {
            setCustomerDebt(res.data);
          }
        });
  }, [formik.values.customerId, customerDebt]);

  const newPayment = () => {
    formik.resetForm();
    setPayment(null);
  };

  const handleSubmit = (values) => {
    if (payment) {
      edit(values);
    } else {
      save(values);
    }
  };

  const save = (value) => {
    fetch("/api/payment/create", {
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
          message.success("تم اصدار سند قبض بنجاح");
          setPayment(result.data);
        }
      })
      .catch(console.log);
  };

  const edit = (value) => {
    fetch(`/api/payment/${payment.id}`, {
      method: "PUT",
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
          setPayment(result.data);
          message.success("تم حفظ تعديلات المستند بنجاح");
        }
      })
      .catch(console.log);
  };

  const sendToPrinter = (id) => {
    setLoading(true);
    fetch(`/api/pdf/${id}/paymentCPrint`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setLoading(false);
          message.success("تم ارسال سند القبض الى الطابعة بنجاح");
        } else {
          setLoading(false);
          message.error("حصل خطأ اثناء ارسال سند القبض الى الطابعة");
        }
      });
  };

  return (
    <div className="container rtl">
      {payment ? (
        <Typography.Title level={3}>تعديل سند القبض</Typography.Title>
      ) : (
        <Typography.Title level={3}>اصدار سند قبض مالي</Typography.Title>
      )}
      <Divider />
      <div>
        <form autoComplete="off" onSubmit={formik.handleSubmit}>
          <div className="grid">
            <CustomerListView
              nullable={false}
              onChange={(e) => formik.setFieldValue("customerId", e)}
              value={formik.values.customerId}
            />
            <Space direction="vertical">
              <Typography.Text>عن القائمة المرقمة</Typography.Text>
              <Input
                addonAfter={
                  invoice ? (
                    <a onClick={() => setShowInvoice(true)}>
                      <EyeOutlined style={{ color: "#25ff25" }} />
                    </a>
                  ) : (
                    <EyeInvisibleOutlined style={{ color: "red" }} />
                  )
                }
                placeholder="غير محدد"
                value={formik.values.invoiceId}
                onChange={(e) =>
                  formik.setFieldValue(
                    "invoiceId",
                    isNaN(Number.parseInt(e.target.value))
                      ? null
                      : Number.parseInt(e.target.value)
                  )
                }
              />
            </Space>
            <DateInput
              onChange={(e) => formik.setFieldValue("createdAt", e)}
              value={moment(formik.values.createdAt)}
            />
            <Space direction="vertical">
              <Typography.Text>القيمة</Typography.Text>
              <Input
                type="number"
                pattern="\d*"
                value={formik.values.value}
                onChange={(e) =>
                  formik.setFieldValue(
                    "value",
                    Number.parseFloat(e.target.value)
                  )
                }
              />
              <Typography.Text>
                {writtenNumber(formik.values.value, { lang: "ar" })} دينار
              </Typography.Text>
            </Space>
            <Space direction="vertical">
              <Typography.Text>الملاحظات</Typography.Text>
              <Input
                type="text"
                onChange={(e) => formik.setFieldValue("note", e.target.value)}
                value={formik.values.note}
              />
            </Space>
          </div>
          <Divider />
          <div className="grid">
            <Tag color="red">{`المديونية السابقة: ${customerDebt.toLocaleString()} دينار`}</Tag>
            <Tag color="green">{`المقبوض: ${formik.values.value.toLocaleString()} دينار`}</Tag>
            <Tag color="gold">
              {`الباقي: ${(customerDebt - formik.values.value).toLocaleString()}
              دينار
              `}
            </Tag>
          </div>
        </form>

        <div className="grid4col margin">
          <Button
            disabled={disable}
            onClick={() => formik.submitForm()}
            type={props.Payment ? "default" : "primary"}
          >
            {payment ? "حفظ التعديلات" : "حفظ السند"}
          </Button>
          <Button disabled={!payment} onClick={newPayment}>
            سند جديد
          </Button>

          {payment && (
            <Button
              disabled={!payment}
              href={`/api/pdf/${payment.id}/payment`}
              target="_blank"
            >
              طباعة
            </Button>
          )}
          {payment && (
            <Button disabled={!payment} onClick={() => setPrintConf(true)}>
              ارسال الى الطابعة
            </Button>
          )}
        </div>
      </div>

      <Modal
        visible={showInvoice}
        destroyOnClose
        closable
        footer={false}
        onCancel={() => setShowInvoice(false)}
      >
        {invoice && <InvoiceSheet footer={false} invoiceId={invoice.id} />}
      </Modal>

      {payment && (
        <Modal
          title="انتباه"
          okType="primary"
          visible={printConf}
          okText="نعم"
          cancelText="لا"
          onOk={() => {
            sendToPrinter(payment.id);
            setPrintConf(false);
          }}
          onCancel={() => {
            setPrintConf(false);
          }}
        >
          <p>
            سيتم ارسال نسخة من الفاتورة الى الطابعة هل انت متأكد من هذا الاجراء؟
          </p>
        </Modal>
      )}

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
