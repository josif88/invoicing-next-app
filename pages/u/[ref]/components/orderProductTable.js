import { Image, Button, Table, Typography, Empty, InputNumber } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import writtenNumber from "written-number";
import useProductListStore from "../../../../stores/productListStore";

export default function OrderProductTable(props) {
  const products = useProductListStore((state) => state.products);
  const increaseQuantity = useProductListStore(
    (state) => state.increaseQuantity
  );
  const decreaseQuantity = useProductListStore(
    (state) => state.decreaseQuantity
  );
  const setProductQuantity = useProductListStore(
    (state) => state.setProductQuantity
  );
  const removeProduct = useProductListStore((state) => state.removeProduct);

  const columns = [
    {
      title: "المادة",
      dataIndex: "productId",
      key: "productId",
      width: "175px",
      render: (text, record) => {
        return (
          <span className="flex align-items">
            {record.image && (
              <Image src={record.image} height={35} width={35}></Image>
            )}
            {record.name}
          </span>
        );
      },
    },
    {
      title: "العدد",
      dataIndex: "quantity",
      key: "quantity",
      width: "100px",
      render: (text, record, index) => (
        <div
        // className="flex align-items"
        // style={{
        //   // background: "red",
        //   width: "fit-content",
        //   border: "1px solid #ccc",
        //   borderRadius: "21px",
        //   padding: "1px",
        // }}
        >
          {/* <Button
            icon={<PlusOutlined />}
            type="primary"
            shape="circle"
            onClick={() => {
              increaseQuantity(record, index);
            }}
          /> */}
          <InputNumber
            type="number"
            pattern="\d*"
            style={{ width: "75px" }}
            onChange={(e) => {
              if (!e) return;
              setProductQuantity(record, index, e);
            }}
            value={record.quantity}
          />
          {/* <Button
            icon={<MinusOutlined />}
            type="primary"
            shape="circle"
            danger
            onClick={() => {
              decreaseQuantity(record, index);
            }}
          /> */}
        </div>
      ),
    },
    {
      title: "سعر المفرد",
      width: "100px",
      dataIndex: "price",
      key: "price",
      responsive: ["md"],
      render: (t) => t.toLocaleString(),
    },
    {
      title: "اجمالي السعر",
      dataIndex: "subTotal",
      key: "subTotal",
      responsive: ["md"],
      render: (name, record) =>
        (record.price * record.quantity).toLocaleString(),
    },
    {
      title: "الاجراء",
      key: "action",
      width: "75px",
      fixed: "right",
      render: (text, record) => (
        <Button
          size="small"
          onClick={() => {
            removeProduct(record);
          }}
          danger
        >
          ازالة
        </Button>
      ),
    },
  ];

  return (
    <Table
      rowKey={(record) => record.productId}
      // scroll={{ x: 700 }}
      pagination={false}
      columns={columns}
      dataSource={products}
      locale={{
        emptyText: (
          <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{
              height: 60,
            }}
            description={
              <span>
                القائمة فارغة, اضغط الزر ادناه لاضافة بعض المواد الى الطلبية
              </span>
            }
          >
            <Button
              icon={<PlusOutlined />}
              onClick={() => props.onEmptyClick(true)}
              type="primary"
            >
              اضافة مواد للقائمة
            </Button>
          </Empty>
        ),
      }}
      summary={(currentData) => {
        let total = 0;
        for (let i = 0; i < currentData.length; i++) {
          total = total + currentData[i].price * currentData[i].quantity;
        }
        return (
          currentData.length > 0 && (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={5}>
                  <Typography.Text>مجموع الطلبية:- </Typography.Text>
                  <Typography.Text type="danger">
                    {total.toLocaleString()} -{" "}
                    {`${writtenNumber(total, { lang: "ar" })} دينار `}
                  </Typography.Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          )
        );
      }}
    />
  );
}
