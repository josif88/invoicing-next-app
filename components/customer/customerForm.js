import React from "react";
import { useFormik } from "formik";
import { Button, Input, message, Space, Typography } from "antd";
import { customerSchema } from "../../utils/valdations";

const CustomerForm = (props) => {
  const save = (value) => {
    fetch("/api/customer/", {
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
          message.success("تم اضافة الوكيل بنجاح");
          formik.resetForm();
        }
      })
      .catch(console.log);
  };

  const edit = (value) => {
    fetch("/api/customer/edit", {
      method: "put",
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
          message.success("تم تعديل معلومات الوكيل بنجاح");
        }
      })
      .catch(console.log);
  };

  const handleSubmit = (values) => {
    if (props.customer) {
      edit(values);
    } else {
      save(values);
    }
  };

  const formik = useFormik({
    initialValues: props.customer
      ? { ...props.customer, phone: "0" + props.customer.phone.substr(4) }
      : {
          name: "",
          phone: "",
          businessName: "",
          note: "لا توجد",
          initialDebt: 0,
          location: "",
          adminId: props.adminId,
        },
    validationSchema: customerSchema,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });
  return (
    <div className="container">
      <Typography.Title>مخزن فستقة</Typography.Title>
      {props.customer ? (
        <Typography.Title level={3}>
          تعديل معلومات الوكيل {props.customer.name}
        </Typography.Title>
      ) : (
        <Typography.Title level={3}>اضافة وكيل جديد</Typography.Title>
      )}
      <form autoComplete="off" onSubmit={formik.handleSubmit}>
        <div className="grid">
          <Space direction="vertical">
            <label htmlFor="name">اسم الوكيل</label>
            <Input
              id="name"
              name="name"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            {formik.touched.name && formik.errors.name ? (
              <div>{formik.errors.name}</div>
            ) : null}
          </Space>
          <Space direction="vertical">
            <label htmlFor="phone">رقم الهاتف</label>
            <Input
              id="phone"
              name="phone"
              type="text"
              pattern="\d*"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone}
            />
            {formik.touched.phone && formik.errors.phone ? (
              <div>{formik.errors.phone}</div>
            ) : null}
          </Space>
          <Space direction="vertical">
            <label htmlFor="businessName">اسم العمل</label>
            <Input
              id="businessName"
              name="businessName"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.businessName}
            />
          </Space>
          <Space direction="vertical">
            <label htmlFor="initialDebt">مجموع الديون السابقة</label>
            <Input
              id="initialDebt"
              name="initialDebt"
              pattern="\d*"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.initialDebt}
            />
            {formik.touched.initialDebt && formik.errors.initialDebt ? (
              <div>{formik.errors.initialDebt}</div>
            ) : null}
          </Space>
          <Space direction="vertical">
            <label htmlFor="location">العنوان</label>
            <Input
              id="location"
              name="location"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.location}
            />
          </Space>
          <Space direction="vertical">
            <label htmlFor="note">الملاحظات</label>
            <Input
              id="note"
              name="note"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.note}
            />
          </Space>
        </div>
        <div className="margin">
          <Button htmlType="submit" type="primary">
            حفظ
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
