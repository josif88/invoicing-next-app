import React from "react";
import { useFormik } from "formik";
import { Button, Input, message, Space, Typography } from "antd";
import { categorySchema } from "../../utils/valdations";

const CategoryForm = (props) => {
  const save = (value) => {
    fetch("/api/category", {
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
          message.success("تم اضافة التصنيف بنجاح");
          formik.resetForm();
        }
      })
      .catch(console.log);
  };

  const edit = (value) => {
    fetch(`/api/category/${value.id}`, {
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
          message.success("تم تعديل معلومات الصنف بنجاح");
        }
      })
      .catch(console.log);
  };

  const formik = useFormik({
    initialValues: props.category
      ? { ...props.category }
      : {
          name: "",
        },
    validationSchema: categorySchema,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  const handleSubmit = (values) => {
    if (props.category) {
      edit(values);
    } else {
      save(values);
    }
  };
  return (
    <div className="container">
      <Typography.Title>مخزن فستقة</Typography.Title>
      {props.category ? (
        <Typography.Title level={3}>
          تعديل {props.category.name}
        </Typography.Title>
      ) : (
        <Typography.Title level={3}>اضافة صنف جديد</Typography.Title>
      )}
      <form autoComplete="off" onSubmit={formik.handleSubmit}>
        <div className="grid">
          <Space direction="vertical">
            <label htmlFor="name">اسم التصنيف</label>
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

export default CategoryForm;
