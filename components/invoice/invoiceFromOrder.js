import {
  Button,
  Divider,
  Space,
  Typography,
  Select,
  Checkbox,
  message,
  DatePicker,
  Input,
  Spin,
  Modal,
} from "antd";
import { useFormik } from "formik";
import { useCustomers } from "../../utils/hooks";
import { verifyAuth } from "../../utils/valdations";
import ProductsListForm from "../common/productsListForm";
import { useEffect, useState } from "react";
import useInvoiceStore from "../../stores/invoiceStore";

export default function InvoiceFromOrder(props) {
  const invoice = useInvoiceStore((state) => state.invoice);
  const setInvoice = useInvoiceStore((state) => state.set);
  const setAdminId = useInvoiceStore((state) => state.setAdminId);
  const setCustomerId = useInvoiceStore((state) => state.setCustomerId);
  const setIsReturn = useInvoiceStore((state) => state.setIsReturn);
  const setOnCredit = useInvoiceStore((state) => state.setOnCredit);
  const setCreatedAt = useInvoiceStore((state) => state.setCreatedAt);
  const setNote = useInvoiceStore((state) => state.setNote);

  const [printConf, setPrintConf] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.adminId) setAdminId(props.adminId);
  }, [props.adminId]);

  const [isEdit, setIsEdit] = useState(null);
  const { customers, isLoading } = useCustomers();
  const [isDone, setIsDone] = useState(props.order.done);

  useEffect(() => {
    setInvoice(props.invoice);
  }, []);

  const formik = useFormik({
    initialValues: {
      ...props.invoice,
    },
    onSubmit: (values) => {
      save(values);
    },
  });

  const sendToPrinter = () => {
    if (isEdit) {
      setLoading(true);
      fetch(`/api/pdf/${isEdit}/invoiceCPrint`)
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

  const save = (value) => {
    setCustomerId(Number.parseInt(value.customerId));
    setCreatedAt(value.createdAt);
    setOnCredit(value.onCredit);
    setIsReturn(value.isReturn);

    if (isEdit) {
      fetch(`/api/invoice/${isEdit}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoice),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.status === "error") {
            result.message.map((m) => message.error(m));
          }
          if (result.status === "ok") {
            message.success("تم حفظ تعديلات القائمة بنجاح");
            setIsEdit(result.data.id);
          }
        })
        .catch(console.log);
    } else {
      fetch("/api/invoice/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoice),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.status === "error") {
            result.message.map((m) => message.error(m));
          }
          if (result.status === "ok") {
            message.success("تم اضافة القائمة بنجاح");
            setIsEdit(result.data.id);

            fetch(`/api/order/${props.order.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: props.order.id,
                invoiceId: result.data.id,
              }),
            });
          }
        })
        .catch(console.log);
    }
  };

  return (
    <div className="container rtl">
      <Typography.Title level={3}>
        انشاء قائمة حساب من الطلب # {props.order.id}
      </Typography.Title>
      <Divider />

      <form autoComplete="off" onSubmit={formik.handleSubmit}>
        <div className="grid">
          {!isLoading && (
            <Space direction="vertical">
              <label htmlFor="desc">الوكيل</label>
              <Select
                style={{ width: "100%" }}
                disabled={true}
                placeholder="اضغط للاختيار"
                value={formik.values.customerId}
              >
                {customers.map((e, i) => (
                  <Select.Option title={e.name} value={e.id} key={i}>
                    {e.name}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          )}
          <Space direction="vertical">
            <label htmlFor="createdAt">تاريخ الفاتورة</label>
            <DatePicker
              style={{ width: "100%" }}
              format={"DD / MM / YYYY"}
              clearIcon={false}
              onChange={(e) => formik.setFieldValue("createdAt", e)}
              value={formik.values.createdAt}
            />

            {formik.touched.createdAt && formik.errors.createdAt ? (
              <div>{formik.errors.createdAt}</div>
            ) : null}
          </Space>
          <Space direction="vertical">
            <label htmlFor="note">الملاحظات</label>
            <Input
              id="note"
              name="note"
              onChange={(e) => {
                formik.setFieldValue("note", e.target.value);
                setNote(e.target.value);
              }}
              value={formik.values.note}
            />
          </Space>
        </div>
        <Checkbox
          disabled={!formik.values.customerId}
          className="margin"
          type="checkbox"
          name="onCredit"
          onChange={formik.handleChange}
          checked={formik.values.onCredit}
        >
          دفع بالآجل
        </Checkbox>

        <div />
      </form>
      <ProductsListForm />

      <Space>
        <Button
          className="margin"
          onClick={() => formik.submitForm()}
          type={isEdit ? "default" : "primary"}
        >
          {isEdit ? "حفظ التعديلات" : "حفظ القائمة"}
        </Button>

        <Button
          disabled={!isEdit}
          href={`/api/pdf/${isEdit}/invoice`}
          target="_blank"
        >
          طباعة
        </Button>
        <Button disabled={!isEdit} onClick={() => setPrintConf(true)}>
          ارسال الى الطابعة
        </Button>
      </Space>

      {isEdit && (
        <div className="margin">
          <Checkbox
            checked={isDone}
            onChange={(e) => {
              setLoading(true);
              fetch(`/api/order/${props.order.id}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id: props.order.id,
                  done: e.target.checked,
                }),
              })
                .then((res) => res.json())
                .then((res) => {
                  if (res.status === "ok") {
                    setLoading(false);
                    setIsDone(e.target.checked);
                    message.success("تم تغيير حالة الطلب");
                  } else {
                    setLoading(false);
                    message.error("حصل خطأ ما");
                  }
                });
            }}
          >
            مكتملة
          </Checkbox>
        </div>
      )}
      <Modal
        title="انتباه"
        okType="primary"
        visible={printConf}
        okText="نعم"
        cancelText="لا"
        onOk={() => {
          sendToPrinter();
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
