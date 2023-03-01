import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Button, Input, message, Space, Typography, Select } from "antd";
import { productSchema } from "../../utils/valdations";
import { useCategories } from "../../utils/hooks";
import UploadImage from "../common/uploadImage";

const ProductForm = (props) => {
  const { categories, isLoading } = useCategories();
  const [product, setProduct] = useState(props.product);

  const save = (value) => {
    fetch("/api/product/", {
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
          message.success("تم اضافة المادة بنجاح");
          formik.resetForm();
        }
      })
      .catch(console.log);
  };

  const edit = (value) => {
    delete value.category;

    fetch(`/api/product/${product.id}`, {
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
          message.success("تم تعديل معلومات المادة بنجاح");
        }
      })
      .catch(console.log);
  };

  const handleSubmit = (values) => {
    if (product) {
      edit(values);
    } else {
      save(values);
    }
  };

  const formik = useFormik({
    initialValues: product || {
      price: 0,
      active: true,
      image: null,
      mUnit: "KG",
      barcode: "",
      shortcode: 0,
      name: "",
      desc: "",
      categoryId: null,
    },
    validationSchema: productSchema,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });
  return (
    <div className="container">
      <Typography.Title>مخزن فستقة</Typography.Title>
      {product ? (
        <Typography.Title level={3}>
          تعديل المادة {product.name}
        </Typography.Title>
      ) : (
        <Typography.Title level={3}>اضافة مادة جديدة</Typography.Title>
      )}
      <form autoComplete="off" onSubmit={formik.handleSubmit}>
        <div className="grid">
          {!isLoading && (
            <Space direction="vertical">
              <label htmlFor="desc">الصنف</label>
              <Select
                style={{ width: "100%" }}
                placeholder="اضغط للاختيار"
                value={formik.values.categoryId}
                defaultValue={null}
                onChange={(e) => formik.setFieldValue("categoryId", e)}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filterSort={(optionA, optionB) =>
                  optionA.title
                    .toLowerCase()
                    .localeCompare(optionB.children.toLowerCase())
                }
              >
                <Select.Option value={null} title="غير مصنف">
                  غير مصنف
                </Select.Option>
                {categories.map((e, i) => (
                  <Select.Option title={e.name} value={e.id} key={i}>
                    {e.name}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          )}
          <Space direction="vertical">
            <label htmlFor="name">اسم المادة</label>
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
            <label htmlFor="price">سعر البيع</label>
            <Input
              id="price"
              name="price"
              type="number"
              pattern="\d*"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.price}
            />
            {formik.touched.price && formik.errors.price ? (
              <div>{formik.errors.price}</div>
            ) : null}
          </Space>

          <Space direction="vertical">
            <label htmlFor="shortcode">الرمز المختصر</label>
            <Input
              id="shortcode"
              name="shortcode"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.shortcode}
            />
          </Space>
          <Space direction="vertical">
            <label htmlFor="desc">وصف المنتج</label>
            <Input
              id="desc"
              name="desc"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.desc}
            />
          </Space>
          <Space direction="vertical">
            <label htmlFor="desc">باركود</label>
            <Input
              id="barcode"
              name="barcode"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.barcode}
            />
          </Space>
          <Space direction="vertical">
            <label htmlFor="image">الصورة</label>
            <UploadImage
              onUpdate={(e) => formik.setFieldValue("image", e)}
              image={formik.values.image}
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

export default ProductForm;
