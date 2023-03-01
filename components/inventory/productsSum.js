import { Table } from "antd";
import { useState } from "react";
import { useProductsSum } from "../../utils/hooks";
import { ProductActivity } from "../reports/productActivity";
import { Button, Drawer } from "antd";

export default function ProductsSum(props) {
  const { sum, isLoading } = useProductsSum();

  const [showReport, setShowReport] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const columns = [
    {
      title: "التقارير",
      dataIndex: "report",
      key: "report",
      width: "50px",
      render: (text, record) => (
        <Button
          size="small"
          type="link"
          onClick={() => {
            console.log(record);
            setShowReport(true);
            setSelectedProduct(record);
          }}
        >
          كشف مخزني
        </Button>
      ),
    },
    {
      title: "المادة",
      dataIndex: "name",
      key: "name",
    },

    {
      title: "الصورة",
      dataIndex: "image",
      key: "image",
      render: (e) => (e ? <img src={e} height="30px" width="30px" /> : null),
    },
    {
      title: "السعر",
      dataIndex: "price",
      key: "price",
      render: (t, r) => t.toLocaleString(),
    },
    {
      title: "وصف المنتج",
      dataIndex: "desc",
      key: "desc",
    },
    {
      title: "المخزن",
      dataIndex: "quantity",
      key: "quantity",
      render: (t, r) => t.toLocaleString(),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={sum}
        scroll={{ x: 700 }}
        rowKey={(record) => {
          return record.productId;
        }}
      />
      <Drawer
        placement="bottom"
        height={"100%"}
        destroyOnClose
        closable
        onClose={() => {
          setShowReport(false);
          setSelectedProduct(null);
        }}
        visible={showReport}
      >
        <ProductActivity product={selectedProduct} />
      </Drawer>
    </>
  );
}
