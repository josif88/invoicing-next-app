import {
  Button,
  Divider,
  Drawer,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Typography,
} from "antd";
import Header from "../components/common/Header";
import { verifyAuth } from "../utils/valdations";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useProducts } from "../utils/hooks";
import { Table } from "antd";
import { useState } from "react";
import ProductForm from "../components/product/productForm";
import ProductInventory from "../components/product/productInventory";

export default function Products(props) {
  const [options, setOptions] = useState({
    current: 1,
    pageSize: 10,
    query: null,
  });

  const { products, isLoading } = useProducts(options);
  const [showInventory, setShowInventory] = useState(false);
  const [deleteConf, setDeleteConf] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const deleteItem = (value) => {
    fetch(`/api/product/${value.id}`, {
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
          message.success("تم حذف المادة");
          setSelectedProduct(null);
        }
      })
      .catch(console.log);
  };

  const columns = [
    {
      title: "اسم المادة",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <a
          onClick={() => {
            setSelectedProduct(record);
            setShowInventory(true);
          }}
        >
          {name}
        </a>
      ),
    },

    {
      title: "الصورة",
      dataIndex: "image",
      key: "image",
      render: (e) => (e ? <Image src={e} height="30px" width="30px" /> : null),
    },
    {
      title: "سعر البيع",
      dataIndex: "price",
      key: "price",
      render: (t) => t.toLocaleString(),
    },
    {
      title: "الصنف",
      dataIndex: "category",
      key: "category",
      render: (category) => (category ? category.name : "غير مصنف"),
    },
    {
      title: "الاجراء",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedProduct(record);
              setShowInventory(true);
            }}
          >
            اضافة مخزنية
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setShowDrawer(true);
              setSelectedProduct(record);
            }}
          />
          <Button
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedProduct(record);
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
      <div className="grid align-items">
        <Input
          placeholder="بحث عن المادة"
          allowClear
          onChange={(e) => {
            setOptions({ ...options, query: e.target.value, current: 1 });
          }}
          value={options.query}
          addonAfter={<SearchOutlined />}
        />
        <Input
          addonBefore="عدد النتائج"
          type="number"
          pattern="\d*"
          style={{ width: "100%" }}
          onChange={(e) => {
            if (!e.target.value) {
              return;
            }
            setOptions({ ...options, pageSize: e.target.value });
          }}
          value={options.pageSize}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setShowDrawer(true);
          }}
        >
          اضف مادة
        </Button>
      </div>
      <Divider />
      <section>
        {!isLoading && (
          <Table
            columns={columns}
            dataSource={products.products}
            scroll={{ x: 700 }}
            rowKey={(r) => r.id}
            onChange={(page) => {
              setOptions({ ...options, ...page });
            }}
            pagination={{
              pageSize: options.pageSize,
              current: options.current,
              total: products.count,
            }}
          />
        )}
      </section>
      <Drawer
        placement="top"
        height={"100%"}
        destroyOnClose
        closable={true}
        onClose={() => {
          setShowDrawer(false);
          setSelectedProduct(null);
        }}
        visible={showDrawer}
      >
        <ProductForm {...props} product={selectedProduct} />
      </Drawer>

      {/* delete customer alert */}

      <Modal
        title="حذف المادة"
        visible={deleteConf}
        destroyOnClose
        onOk={() => {
          deleteItem(selectedProduct);
          setSelectedProduct(null);
          setDeleteConf(false);
        }}
        onCancel={() => {
          setSelectedProduct(null);
          setDeleteConf(false);
        }}
      >
        <p>سيتم ازالة المادة من لوحة الادارة </p>
      </Modal>

      <Drawer
        placement="top"
        height={"100%"}
        closable={true}
        destroyOnClose
        onClose={() => {
          setShowInventory(false);
          setSelectedProduct(null);
        }}
        visible={showInventory}
      >
        {selectedProduct && <ProductInventory product={selectedProduct} />}
      </Drawer>
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
