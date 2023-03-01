import { Button, Divider, Drawer, message, Modal, Space } from "antd";
import Header from "../components/common/Header";
import { verifyAuth } from "../utils/valdations";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useCategories } from "../utils/hooks";
import { Table } from "antd";
import { useState } from "react";

import CategoryForm from "../components/category/categoryForm";

export default function Categories(props) {
  const { categories, isLoading } = useCategories();
  const [deleteConf, setDeleteConf] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const deleteCategory = (value) => {
    fetch(`/api/category/${value.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.status === "error") {
          result.message.map((m) => message.error(m));
        }

        if (result.status === "ok") {
          message.success("تم حذف التصنيف");
        }
      })
      .catch(console.log);
  };

  const columns = [
    {
      title: "اسم الصنف",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "الاجراء",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setShowDrawer(true);
              setSelectedCategory(record);
            }}
          />
          <Button
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedCategory(record);
              setDeleteConf(true);
            }}
          />
        </Space>
      ),
    },
  ];
  return (
    <div className="rtl container">
      <Header {...props} />
      <Divider />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setShowDrawer(true);
        }}
      >
        اضف تصنيف
      </Button>
      <Divider />
      <section>
        {!isLoading && (
          <Table
            columns={columns}
            dataSource={categories}
            scroll={{ x: 700 }}
            rowKey={(r) => r.id}
          />
        )}
      </section>
      <Drawer
        placement="top"
        height={"100%"}
        closable={true}
        destroyOnClose
        onClose={() => {
          setSelectedCategory(null);
          setShowDrawer(false);
        }}
        visible={showDrawer}
      >
        <CategoryForm {...props} category={selectedCategory} />
      </Drawer>

      <Modal
        title="حذف التصنيف"
        okText="نعم"
        cancelText="لا"
        visible={deleteConf}
        onOk={() => {
          deleteCategory(selectedCategory);
          setDeleteConf(false);
        }}
        onCancel={() => {
          setSelectedCategory(null);
          setDeleteConf(false);
        }}
      >
        <p>سيتم ازالة التصنيف من لوحة الادارة </p>
      </Modal>
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
