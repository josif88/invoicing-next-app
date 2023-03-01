import { useProductsByCategory } from "../../../../utils/hooks";
import {
  Button,
  Card,
  Input,
  InputNumber,
  message,
  Modal,
  Tag,
  Typography,
} from "antd";
import Fade from "react-reveal/Fade";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import useProductListStore from "../../../../stores/productListStore";
import { useState } from "react";

export default function ProductsGridView({ category, onSelect }) {
  const { sum: inventorySum, isLoading: inventoryLoading } =
    useProductsByCategory(category);

  const products = useProductListStore((state) => state.products);
  const addProduct = useProductListStore((state) => state.addProduct);
  const removeProduct = useProductListStore((state) => state.removeProduct);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(false);

  return !inventoryLoading && inventorySum.length ? (
    <div
      className="flex"
      style={{
        justifyContent: "space-around",
        padding: "10px 0px",
        flexWrap: "wrap",
        gap: "10px",
      }}
    >
      {inventorySum.map((p, i) => {
        return (
          <Fade left key={i}>
            <Card
              key={i}
              className="noselect"
              style={
                p.quantity > 0
                  ? { width: 150, padding: "2px" }
                  : { width: 150, padding: "2px", background: "#d9d9d9" }
              }
              cover={
                p.image ? (
                  <img
                    alt={p.name}
                    src={p.image}
                    style={{ height: "150px", objectFit: "cover" }}
                  />
                ) : (
                  <img src="https://via.placeholder.com/150" />
                )
              }
            >
              <div>
                {p.quantity > 0 ? (
                  <Tag color="green" style={{ margin: "0 0 5px 0" }}>
                    <strong>{p.price.toLocaleString()} دينار</strong>
                  </Tag>
                ) : (
                  <Tag color="red" style={{ margin: "0 0 5px 0" }}>
                    غير متوفر
                  </Tag>
                )}
                <Typography.Text strong>{p.name}</Typography.Text>
              </div>
              <div style={{ paddingTop: "5px" }} className="center-element">
                {products.some((c) => c.productId == p.productId) ? (
                  <Button
                    size="small"
                    icon={<MinusCircleOutlined />}
                    key="remove"
                    type="primary"
                    block
                    danger
                    onClick={() => {
                      removeProduct(p);
                    }}
                  >
                    ازالة
                  </Button>
                ) : (
                  <Button
                    icon={<PlusCircleOutlined />}
                    disabled={p.quantity <= 0}
                    key="add"
                    size="small"
                    block
                    type="primary"
                    onClick={() => {
                      p.quantity = 1;
                      setSelectedProduct(p);
                      setViewProduct(true);
                    }}
                  >
                    اضافة
                  </Button>
                )}
              </div>
            </Card>
          </Fade>
        );
      })}

      <Modal
        closable
        destroyOnClose
        onCancel={() => {
          setSelectedProduct(null);
          setViewProduct(false);
        }}
        onOk={() => {
          addProduct(selectedProduct);
          message.success(`تم اضافة ${selectedProduct.name}`);
          setSelectedProduct(null);
          setViewProduct(false);
        }}
        okText="اضف الى الطلب"
        cancelText="تجاهل"
        visible={viewProduct}
      >
        {selectedProduct && (
          <div key={selectedProduct.id} className="noselect padding">
            {selectedProduct.image ? (
              <img
                style={{ width: "100%", height: "300px", objectFit: "cover" }}
                alt={selectedProduct.name}
                src={selectedProduct.image}
              />
            ) : (
              <img
                style={{ width: "100%", height: "300px", objectFit: "cover" }}
                src="https://via.placeholder.com/300"
              />
            )}
            <span style={{ display: "inline-flex" }} className="gap margin">
              <p>السعر</p>
              <strong>{selectedProduct.price} دينار</strong>
            </span>
            <Typography.Title level={5}>
              {selectedProduct.name}
            </Typography.Title>
            <Typography.Paragraph style={{ display: "block" }}>
              {selectedProduct.desc ? selectedProduct.desc : "لا يوجد وصف"}
            </Typography.Paragraph>
            <div className="flex gap align-items">
              العدد
              <InputNumber
                type="number"
                value={selectedProduct.quantity}
                size="large"
                pattern="\d*"
                onChange={(e) => {
                  setSelectedProduct({
                    ...selectedProduct,
                    quantity: !isNaN(e) ? (e <= 0 ? 1 : e) : 1,
                  });
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  ) : (
    `لا يوجد مواد في هذا التصنيف`
  );
}
