import {
  Button,
  Divider,
  Drawer,
  Input,
  Space,
  Typography,
  Modal,
  message,
  Tag,
  Result,
  Tabs,
} from "antd";
import { useRouter } from "next/dist/client/router";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { PlusOutlined } from "@ant-design/icons";
import ProductsGridView from "./components/productsGridView";
import OrderProductTable from "./components/orderProductTable";
import useProductListStore from "../../../stores/productListStore";
import OrdersTable from "../../../components/order/ordersTable";
import Head from "next/head";
import { useCategories } from "../../../utils/hooks";

export default function UserProfile(props) {
  const router = useRouter();
  const { ref } = router.query;
  const [customer, setCustomer] = useState(null);
  const [customerDebt, setCustomerDebt] = useState(0);
  const [showOrder, setShowOrder] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const products = useProductListStore((state) => state.products);
  const resetProducts = useProductListStore((state) => state.resetProducts);
  const { categories, isLoading: categoryLoading } = useCategories();
  const [showPreviousOrders, setShowPreviousOrders] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    if (ref)
      fetch(`/api/customer/ref/${ref}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setCustomer(data.data);
            setIsLoading(false);
          } else router.push("/404");
        });
  }, [ref]);

  useEffect(() => {
    if (customer) {
      formik.setValues({
        ...formik.values,
        customerId: customer.id,
        phoneNumber: customer.phone,
      });
    }

    //get customer current debt
    if (customer)
      fetch(`/api/customer/debt?id=${customer.id}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.status === "ok") {
            setCustomerDebt(res.data);
          }
        });
  }, [customer]);

  const formik = useFormik({
    initialValues: {
      customerId: null,
      note: "",
      phoneNumber: null,
      address: null,
      orderItem: [],
    },

    onSubmit: (values) => {
      save(values);
    },
  });

  const save = (value) => {
    if (products.length == 0) {
      message.error("اضف بعض المواد لطفاً");
      return;
    }
    value.orderItem = [];
    for (let i = 0; i < products.length; i++) {
      value.orderItem.push({
        productId: products[i].productId,
        quantity: products[i].quantity,
      });
    }

    fetch("/api/order/create", {
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
          message.success("تم ارسال الطلبية بنجاح");
          resetProducts();
          setShowConfirm(false);
        }
      })
      .catch(console.log);
  };

  function getLinkWhastapp() {
    var url =
      "https://api.whatsapp.com/send?phone=" +
      "+9647702992001" +
      "&text=" +
      encodeURIComponent("السلام عليكم يوسف");
    return url;
  }

  return (
    <>
      <Head>
        <title>فستقة</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </Head>
      <div className="container rtl">
        <header className="flex space-between align-items">
          <a href={`/u/${ref}`}>
            <Space align="baseline">
              <img src="/assets/logo.png" width="25px" height="25px" />
              <Typography.Title level={4}>مخزن فستقة</Typography.Title>
            </Space>
          </a>
        </header>
        <div
          className="margin padding"
          style={{
            background: "#fafafa",
            border: "1px solid #f0f0f0",
            paddingRight: "8px",
          }}
        >
          {!isLoading && (
            <Space align="baseline">
              <Typography.Paragraph>{`حساب السيد:`}</Typography.Paragraph>
              <Typography.Title level={4}> {customer.name}</Typography.Title>
            </Space>
          )}
          {customer && (
            <div className="flex space-between">
              <Button
                type="default"
                size="small"
                onClick={() => setShowPreviousOrders(true)}
              >
                كشف بالطلبات السابقة
              </Button>

              <Tag
                color={customerDebt < 0 ? "green" : "red"}
              >{`المديونية: ${customerDebt.toLocaleString()}`}</Tag>
            </div>
          )}
        </div>

        <div>
          <Divider>انشاء طلبية جديدة</Divider>
          <div>
            <OrderProductTable
              {...props}
              products={products}
              onEmptyClick={setShowOrder}
            />
            {products.length > 0 && (
              <Space>
                <Button
                  className="margin"
                  icon={<PlusOutlined />}
                  onClick={() => setShowOrder(true)}
                >
                  اضافة مواد للقائمة
                </Button>
                <Button
                  type="primary"
                  className="margin"
                  onClick={() => setShowConfirm(true)}
                >
                  ارسال
                </Button>
              </Space>
            )}
          </div>
          <Modal
            visible={showConfirm}
            className="rtl"
            onCancel={() => {
              setShowConfirm(false);
            }}
            okText={"ارسال"}
            cancelText={"تراجع"}
            onOk={() => {
              formik.submitForm().then(() => setSuccessMessage(true));
            }}
          >
            {products.length > 0 && (
              <div>
                <Typography.Title level={4} className="margin">
                  المواد المطلوبة
                </Typography.Title>
                <Divider />
                <ul>
                  {products.map((product) => {
                    return (
                      <li>
                        {product.name} عدد {product.quantity}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <Divider />
            <form autoComplete="off" onSubmit={formik.handleSubmit}>
              <div className="grid">
                <Space direction="vertical">
                  <label htmlFor="phone">رقم الهاتف</label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.phoneNumber}
                  />
                </Space>
                <Space direction="vertical">
                  <label htmlFor="location">عنوان التوصيل</label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.address}
                  />
                </Space>
                <Space direction="vertical">
                  <label htmlFor="note">الملاحظات ان وجدت</label>
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
            </form>
          </Modal>
          <Drawer
            width={"100%"}
            visible={showOrder}
            onClose={() => setShowOrder(false)}
            footer={
              <div className="container">
                <Button
                  type="primary"
                  block
                  onClick={() => setShowOrder(false)}
                >
                  موافق
                </Button>
              </div>
            }
          >
            <div className="container rtl">
              <Typography.Title level={5}>
                اختر المواد ليتم اضافتها الى الطلبية
              </Typography.Title>
              <Divider />

              <Tabs defaultActiveKey="0" size="small" centered type="card">
                <Tabs.TabPane tab={`كل المواد`} key={0}>
                  <ProductsGridView />
                </Tabs.TabPane>
                {!categoryLoading &&
                  categories.map((c, i) => (
                    <Tabs.TabPane tab={c.name} key={i + 1}>
                      <ProductsGridView category={c.id} />
                    </Tabs.TabPane>
                  ))}
              </Tabs>
            </div>
          </Drawer>
        </div>
        <Drawer
          height={"100%"}
          visible={showPreviousOrders}
          placement="bottom"
          footer={
            <div className="container">
              <Button onClick={() => setShowPreviousOrders(false)}>رجوع</Button>
            </div>
          }
          onClose={() => setShowPreviousOrders(false)}
        >
          <div className="container rtl">
            {customer && <OrdersTable {...props} customerRef={ref} />}
          </div>
        </Drawer>
      </div>
      {successMessage && (
        <div className="full-overlay">
          <Result
            status="success"
            title="تم الارسال"
            subTitle="تم ارسال الطلبية الى ادارة مخزن فستقة بنجاح"
            extra={[
              <Button
                type="primary"
                key="console"
                onClick={() => setSuccessMessage(false)}
              >
                اغلاق
              </Button>,
            ]}
          />
        </div>
      )}
      <footer className="rtl">
        تصميم وبرمجة يوسف باسم: واتس اب{" "}
        <a href={getLinkWhastapp()}>07702992001</a>
      </footer>
    </>
  );
}
