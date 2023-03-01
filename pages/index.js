import { Button, Divider, Drawer, Tabs } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  UserOutlined,
  AppstoreAddOutlined,
  CopyOutlined,
  DollarCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import Header from "../components/common/Header";
import { verifyAuth } from "../utils/valdations";
import ProductsSum from "../components/inventory/productsSum";
import DebitsTable from "../components/customer/DebitsTable";
import OrdersTable from "../components/order/ordersTable";
import NotificationsHandler from "../components/common/notificationsHandler";
import { FundActivity } from "../components/reports/fundActivity";

export default function Home(props) {
  const router = useRouter();

  useEffect(() => {
    if (!props.token) {
      router.replace("/login");
    }
  }, []);

  return (
    <div className="rtl container">
      <Header {...props} />
      <NotificationsHandler {...props} />
      <Divider />
      <section className="grid4col">
        <Button
          href="/invoices"
          type="primary"
          size="large"
          icon={<CopyOutlined />}
        >
          القوائم
        </Button>

        <Button href="/customers" size="large" icon={<UserOutlined />}>
          الوكلاء
        </Button>
        <Button href="/categories" size="large">
          التصنيفات
        </Button>
        <Button href="/products" size="large" icon={<AppstoreAddOutlined />}>
          المواد
        </Button>
        <Button href="/payments" size="large" icon={<DollarCircleOutlined />}>
          المقبوضات
        </Button>
        <Button href="/expenses" size="large" icon={<DollarCircleOutlined />}>
          المصروفات
        </Button>
        <Button href="/orders" size="large" icon={<UnorderedListOutlined />}>
          الطلبات
        </Button>
      </section>
      <Divider>التقارير</Divider>

      <Tabs type="card">
        <Tabs.TabPane tab="الوكلاء" key="2">
          <DebitsTable {...props} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="الطلبات" key="1">
          <OrdersTable {...props} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="المخزن" key="3">
          <ProductsSum />
        </Tabs.TabPane>
        <Tabs.TabPane tab={"الصندوق"} key="4">
          <FundActivity {...props} />
        </Tabs.TabPane>
      </Tabs>
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
