import {
  Space,
  Select,
  Input,
  Button,
  Typography,
  Table,
  Image,
  message,
  InputNumber,
} from "antd";
import { useFormik } from "formik";
import { AppstoreAddOutlined, DeleteOutlined } from "@ant-design/icons";
import { useProductsSum } from "../../utils/hooks";
import { invoiceItemSchema } from "../../utils/valdations";
import writtenNumber from "written-number";
import useInvoiceStore from "../../stores/invoiceStore";

const ProductsListForm = (props) => {
  const { sum: inventory, isLoading: inventoryLoading } = useProductsSum();
  const addInvoiceItem = useInvoiceStore((state) => state.addInvoiceItem);
  const getInvoiceItem = useInvoiceStore((state) => state.getInvoiceItem);
  const setProductPrice = useInvoiceStore((state) => state.setProductPrice);
  const setProductQuantity = useInvoiceStore(
    (state) => state.setProductQuantity
  );
  const removeInvoiceItem = useInvoiceStore((state) => state.removeInvoiceItem);

  const formik = useFormik({
    initialValues: {
      productId: null,
      quantity: 1,
      price: 0,
      product: null,
    },
    validationSchema: invoiceItemSchema,

    onSubmit: (invoiceItem) => {
      if (
        getInvoiceItem().filter((i) => i.productId == invoiceItem.productId)
          .length > 0
      ) {
        return message.error("تم اضافة هذه المادة مسبقاً");
      }

      addInvoiceItem(invoiceItem);
      formik.resetForm();
    },
  });

  const columns = [
    {
      title: "المادة",
      dataIndex: "productId",
      key: "productId",
      render: (text, record) => {
        return (
          <span className="flex align-items">
            {record.product.image && (
              <Image src={record.product.image} height={35} width={35}></Image>
            )}
            {record.product.name}
          </span>
        );
      },
    },
    {
      title: "العدد",
      dataIndex: "quantity",
      key: "quantity",
      width: "150px",
      render: (t, r, i) => {
        return (
          <InputNumber
            pattern="\d*"
            value={r.quantity}
            onChange={(e) => {
              if (!e) {
                return;
              }
              setProductQuantity(i, e);
            }}
          />
        );
      },
    },
    {
      title: "سعر المفرد",
      dataIndex: "price",
      key: "price",
      width: "150px",
      render: (t, r, i) => {
        return (
          <InputNumber
            type="number"
            pattern="\d*"
            value={r.price}
            onChange={(e) => {
              if (e == null) {
                return;
              }
              setProductPrice(i, e);
            }}
          />
        );
      },
    },
    {
      title: "اجمالي السعر",
      dataIndex: "subTotal",
      key: "subTotal",
      width: "150px",
      render: (name, record) =>
        (record.price * record.quantity).toLocaleString(),
    },
    {
      title: "الاجراء",
      key: "action",
      width: "150px",
      render: (text, record) => (
        <Button
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => {
            removeInvoiceItem(record);
          }}
        />
      ),
    },
  ];

  return (
    <div>
      {!inventoryLoading && (
        <form
          autoComplete="off"
          onSubmit={formik.handleSubmit}
          autoComplete="off"
          className="margin padding"
          style={{
            background: "#fafafa",
            paddingLeft: 8,
            paddingRight: 8,
            border: "1px solid rgba(0, 0, 0, 0.06",
          }}
        >
          <div className="grid">
            <Space direction="vertical">
              <label>المادة</label>
              <Select
                id="productId"
                name="productId"
                value={formik.values.productId}
                style={{ width: "100%" }}
                placeholder="اضغط للاختيار"
                defaultValue={null}
                onChange={(e) => {
                  formik.setFieldValue("productId", e);
                  const selectedItem = inventory.filter(
                    (i) => i.productId === e
                  )[0];
                  formik.setFieldValue("price", selectedItem.price);
                  formik.setFieldValue("product", selectedItem);
                }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filterSort={(optionA, optionB) =>
                  optionA.title
                    .toLowerCase()
                    .localeCompare(optionB.title.toLowerCase())
                }
              >
                {inventory.map((e, i) => (
                  <Select.Option title={e.name} value={e.productId} key={i}>
                    <span className="flex space-between">
                      {e.name}
                      <span>
                        <AppstoreAddOutlined /> {e.quantity}
                      </span>
                    </span>
                  </Select.Option>
                ))}
              </Select>

              {formik.touched.productId && formik.errors.productId ? (
                <Typography.Text type="danger">
                  {formik.errors.productId}
                </Typography.Text>
              ) : null}
            </Space>
            <Space direction="vertical">
              <label htmlFor="price">الكمية</label>
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
                <Typography.Text type="danger">
                  {formik.errors.quantity}
                </Typography.Text>
              ) : null}
            </Space>
            <Space direction="vertical">
              <label htmlFor="price">سعر المفرد</label>
              <Input
                id="price"
                name="price"
                type="number"
                pattern="\d*"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.price}
              />
              {formik.touched.price && formik.errors.price ? (
                <Typography.Text type="danger">
                  {formik.errors.price}
                </Typography.Text>
              ) : null}
            </Space>
          </div>
          <Button className="margin" type="primary" htmlType="submit">
            اضف للقائمة
          </Button>
        </form>
      )}

      <Table
        rowKey={(record) => record.productId}
        scroll={{ x: 700 }}
        pagination={false}
        columns={columns}
        dataSource={getInvoiceItem()}
        summary={(currentData) => {
          let total = 0;
          for (let i = 0; i < currentData.length; i++) {
            total = total + currentData[i].price * currentData[i].quantity;
          }
          return (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={3} align="left">
                  مجموع القائمة
                </Table.Summary.Cell>

                <Table.Summary.Cell colSpan={2}>
                  <Typography.Text type="danger">
                    {total.toLocaleString()} |{" "}
                    {`${writtenNumber(total, { lang: "ar" })} دينار `}
                  </Typography.Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />
    </div>
  );
};

export default ProductsListForm;
