import { Button, Drawer, Modal, Space, Typography } from "antd";
import { useState } from "react";
import { MenuOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import { useRouter } from "next/dist/client/router";

export default function Header(props) {
  const router = useRouter();

  return (
    <footer className="rtl flex space-between align-items">
      فستقة
    </footer>
  );
}
