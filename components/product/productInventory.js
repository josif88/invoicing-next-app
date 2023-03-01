import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import {
  Button,
  Input,
  message,
  Space,
  Typography,
  Divider,
  Table,
  Modal,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { inventorySchema } from "../../utils/valdations";
import { useProductInventory, useProductSum } from "../../utils/hooks";
import moment from "moment";
export default function ProductInventory(props) {
  const [product] = useState(props.product);
  const [options, setOptions] = useState({
    current: 1,
    pageSize: 10,
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { inventoryRecords, count, isLoading } = useProductInventory(
    props.product.id
  );
  const [deleteConf, setDeleteConf] = useState(false);
  const { sum } = useProductSum(props.product.id);

  const formik = useFormik({
    initialValues: {
      productId: product.id,
      active: true,
      quantity: 0,
      price: 0,
      note: "",
    },
    validationSchema: inventorySchema,
    onSubmit: (values) => {
      save(values);
    },
  });

  const save = (value) => {
    fetch(`/api/inventory/add`, {
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
          message.success("تم اضافة الكمية بنجاح");
          formik.resetForm();
        }
      })
      .catch(console.log);
  };

  const deleteRecord = async (record) => {
    fetch(`/api/inventory/${record.id}`, {
      method: "DELETE",
    }).then(message.info("تم الحذف"));
  };

  const columns = [
    {
      title: "تاريخ الادخال",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("YYYY/MM/DD"),
    },

    {
      title: "الكمية",
      dataIndex: "quantity",
      key: "quantity",
      render: (t) => t.toLocaleString(),
    },
    {
      title: "السعر الشراء",
      dataIndex: "price",
      key: "price",
      render: (t) => t.toLocaleString(),
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
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedRecord(record);
              setDeleteConf(true);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="container">
      <Typography.Title>مخزن فستقة</Typography.Title>
      <Typography.Title level={3}>اضافة</Typography.Title>

      <Space align="center">
        {product.image && (
          <img src={product.image} height="45px" width="45px" />
        )}
        <Typography.Title>{product.name}</Typography.Title>
      </Space>
      <Typography.Paragraph>
        الوصف:
        {<strong>{product.desc ? product.desc : "لا يوجد وصف للمنتج"}</strong>}
      </Typography.Paragraph>

      <Typography.Paragraph>
        باقي المخزن: {<strong> {sum && sum.toLocaleString()} </strong>} كرتون
      </Typography.Paragraph>

      <Divider />

      <form autoComplete="off" onSubmit={formik.handleSubmit}>
        <div className="grid4col">
          <Space>
            <label htmlFor="quantity">الكمية</label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              pattern="\d*"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.quantity}
            />
            {formik.touched.quantity && formik.errors.quantity ? (
              <div>{formik.errors.quantity}</div>
            ) : null}
          </Space>
          <Space>
            <label htmlFor="price">سعر الشراء</label>
            <Input
              id="price"
              name="price"
              type="number"
              pattern="\d*"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.price}
            />
            {/* {formik.touched.price && formik.errors.price ? (
              <div>{formik.errors.price}</div>
            ) : null} */}
          </Space>

          <Space>
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
          <Button htmlType="submit" type="primary">
            ادخل
          </Button>
        </div>
      </form>
      <Divider />
      {!isLoading && (
        <Table
          columns={columns}
          dataSource={inventoryRecords}
          scroll={{ x: 700 }}
          onChange={(page) => {
            setOptions({ ...options, ...page });
          }}
          rowKey={(r) => r.id}
          pagination={{
            pageSize: options.pageSize,
            current: options.current,
            total: count,
          }}
        />
      )}
      <Modal
        title="حذف المادة"
        visible={deleteConf}
        destroyOnClose
        okText="نعم"
        cancelText="لا"
        onOk={() => {
          deleteRecord(selectedRecord);
          setDeleteConf(false);
        }}
        onCancel={() => {
          setSelectedRecord(null);
          setDeleteConf(false);
        }}
      >
        <p>سيتم ازالة المادة من لوحة الادارة </p>
      </Modal>
    </div>
  );
}
