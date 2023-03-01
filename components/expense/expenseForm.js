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
import { useState } from "react";
import moment from "moment";
import DateInput from "../common/dateInput";
import writtenNumber from "written-number";

export default function ExpenseForm(props) {
  const [expense, setExpense] = useState(props.expense);
  const [printConf, setPrintConf] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: expense
      ? { ...expense }
      : {
          adminId: Number.parseInt(props.adminId),
          category: null,
          issuedTo: null,
          value: 0,
          note: null,
          createdAt: moment().format(),
        },
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  const newExpense = () => {
    formik.resetForm();
    setExpense(null);
  };

  const handleSubmit = (values) => {
    if (expense) {
      edit(values);
    } else {
      save(values);
    }
  };

  const save = (value) => {
    fetch("/api/expense/create", {
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
          setExpense(result.data);
        }
      })
      .catch(console.log);
  };

  const edit = (value) => {
    fetch(`/api/expense/${expense.id}`, {
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
          setExpense(result.data);
          message.success("تم حفظ تعديلات المستند بنجاح");
        }
      })
      .catch(console.log);
  };

  const sendToPrinter = (id) => {
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
  };

  return (
    <div className="container rtl">
      {expense ? (
        <Typography.Title level={3}>تعديل سند الصرف</Typography.Title>
      ) : (
        <Typography.Title level={3}>اصدار سند صرف مالي</Typography.Title>
      )}
      <Divider />
      <div>
        <form autoComplete="off" onSubmit={formik.handleSubmit}>
          <div className="grid">
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
              <Typography.Text>المستلم</Typography.Text>
              <Input
                type="text"
                onChange={(e) =>
                  formik.setFieldValue("issuedTo", e.target.value)
                }
                value={formik.values.issuedTo}
              />
            </Space>
            <Space direction="vertical">
              <Typography.Text>باب الصرف</Typography.Text>
              <Input
                type="text"
                onChange={(e) =>
                  formik.setFieldValue("category", e.target.value)
                }
                value={formik.values.category}
              />
            </Space>
            <Space direction="vertical">
              <Typography.Text>الملاحظات</Typography.Text>
              <Input.TextArea
                type="text"
                onChange={(e) => formik.setFieldValue("note", e.target.value)}
                value={formik.values.note}
              />
            </Space>
          </div>
          <Divider />
        </form>

        <div className="grid4col margin">
          <Button
            onClick={() => formik.submitForm()}
            type={props.expense ? "default" : "primary"}
          >
            {expense ? "حفظ التعديلات" : "حفظ السند"}
          </Button>
          <Button disabled={!expense} onClick={newExpense}>
            سند جديد
          </Button>

          {expense && (
            <Button
              disabled={!expense}
              href={`/api/pdf/${expense.id}/expense`}
              target="_blank"
            >
              طباعة
            </Button>
          )}
          {expense && (
            <Button disabled={!expense} onClick={() => setPrintConf(true)}>
              ارسال الى الطابعة
            </Button>
          )}
        </div>
      </div>

      {expense && (
        <Modal
          title="انتباه"
          okType="primary"
          visible={printConf}
          okText="نعم"
          cancelText="لا"
          onOk={() => {
            sendToPrinter(expense.id);
            setPrintConf(false);
          }}
          onCancel={() => {
            setPrintConf(false);
          }}
        >
          <p>
            سيتم ارسال نسخة من سند الصرف الى الطابعة هل انت متأكد من هذا
            الاجراء؟
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
