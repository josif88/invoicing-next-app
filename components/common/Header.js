import { Button, Drawer, Modal, Space, Typography, Menu } from "antd";
import { useState } from "react";
import { MenuOutlined, LogoutOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import { useRouter } from "next/dist/client/router";
import { useAdmin } from "../../utils/hooks";
import Head from "next/head";
import {
  UserOutlined,
  AppstoreAddOutlined,
  CopyOutlined,
  DollarCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

export default function Header(props) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openSignOutModal, setOpenSignOutModal] = useState(false);

  const { admin, isLoading } = useAdmin(props.adminId);

  const router = useRouter();

  const signOut = () => {
    setOpenSignOutModal(true);
  };

  const showDrawer = () => {
    setOpenDrawer(true);
  };

  const onClose = () => {
    setOpenDrawer(false);
  };

  return (
    <>
      <Head>
        <title>فستقة</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </Head>
      <Modal
        title="لوحة تحكم فستقة"
        visible={openSignOutModal}
        onOk={() => {
          Cookies.remove("token");
          router.replace("/login");
        }}
        okText="نعم"
        cancelText="لا"
        onCancel={() => {
          setOpenSignOutModal(false);
        }}
      >
        هل انت متأكد من تسجيل الخروج؟
      </Modal>
      <Drawer
        style={{ fontFamily: "Gulf", fontWeight: "bold" }}
        placement={"right"}
        closable={false}
        onClose={onClose}
        visible={openDrawer}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            href="/invoices"
            block
            type="primary"
            size="large"
            icon={<CopyOutlined />}
          >
            القوائم
          </Button>

          <Button block href="/customers" size="large" icon={<UserOutlined />}>
            الوكلاء
          </Button>
          <Button block href="/categories" size="large">
            التصنيفات
          </Button>
          <Button
            block
            href="/products"
            size="large"
            icon={<AppstoreAddOutlined />}
          >
            المواد
          </Button>
          <Button
            block
            href="/payments"
            size="large"
            icon={<DollarCircleOutlined />}
          >
            المقبوضات
          </Button>
          <Button
            block
            href="/expenses"
            size="large"
            icon={<DollarCircleOutlined />}
          >
            المصروفات
          </Button>
          <Button
            block
            href="/orders"
            size="large"
            icon={<UnorderedListOutlined />}
          >
            الطلبات
          </Button>
        </Space>
      </Drawer>
      <header className="rtl flex space-between align-items">
        <Space>
          <MenuOutlined style={{ fontSize: "25px" }} onClick={showDrawer} />
          <a href="/">
            <Space align="baseline">
              <img src="/assets/logo.png" width="25px" height="25px" />
              <Typography.Title level={4}>مخزن فستقة</Typography.Title>
            </Space>
          </a>
        </Space>
        <Space align="baseline">
          {!isLoading && (
            <Typography.Paragraph>{`مرحباً ${admin.name}`}</Typography.Paragraph>
          )}
          <Button danger onClick={signOut} icon={<LogoutOutlined />} />
        </Space>
      </header>
    </>
  );
}
