import {
  Table,
  DatePicker,
  Space,
  Typography,
  Switch,
  Tag,
  Divider,
  Button,
} from "antd";
import moment from "moment";
import ReactToPrint from "react-to-print";
import React, { useRef, useState } from "react";
import writtenNumber from "written-number";
import { useProductActivity } from "../../utils/hooks";
import { ProductActivityToPrint } from "./productActivityPrint";

export function ProductActivity(props) {
  const [options, setOptions] = useState(
    props.product && { id: props.product.productId }
  );

  const { productActivity, isLoading } = useProductActivity(options);

  let componentRef = useRef();

  const columns = [
    {
      title: "الحالة",
      dataIndex: "status",
      key: "status",
      render: (t, r) =>
        r.status == "ادخال" ? (
          <Tag color="green">{r.status}</Tag>
        ) : (
          <Tag color="red">{r.status}</Tag>
        ),
    },

    {
      title: "التاريخ",
      dataIndex: "date",
      key: "date",
      render: (t) => (t ? moment(t).format("YYYY/MM/DD") : "قبل المدة"),
    },

    {
      title: "الوقت",
      dataIndex: "date",
      key: "date",
      render: (t) => (t ? moment(t).format("HH:mm") : ""),
    },
    {
      title: "رقم الفاتورة",
      dataIndex: "invoiceId",
      key: "invoiceId",
    },
    {
      title: "الكمية",
      dataIndex: "value",
      key: "value",
      render: (t, r) =>
        r.status == "ادخال" ? (
          <Tag color="green">{r.value.toLocaleString()}</Tag>
        ) : (
          <Tag color="red">{r.value.toLocaleString()}</Tag>
        ),
    },
    {
      title: "المشتري",
      dataIndex: "customerName",
      key: "customerName",
    },
  ];

  return props.product ? (
    <div className="rtl page">
      <Typography.Title
        level={2}
        style={{ margin: "0 0 30px 0", textAlign: "center" }}
      >
        تقرير بالحركة المخزنية للمادة {props.product.name}
      </Typography.Title>
      <div className="grid4col margin align-items">
        <Space>
          من الفترة
          <DatePicker
            clearIcon={false}
            placeholder="غير محدد"
            onChange={(e) => {
              setOptions({
                ...options,
                start: e.format("YYYY-MM-DD 00:00:00"),
              });
            }}
          />
        </Space>
        <Space>
          الى الفترة
          <DatePicker
            clearIcon={false}
            placeholder="غير محدد"
            onChange={(e) => {
              setOptions({
                ...options,
                end: e.format("YYYY-MM-DD 23:59:59"),
              });
            }}
          />
        </Space>
        <Space>
          <Switch
            onChange={(e) => {
              if (e) {
                setOptions({ ...options, order: "DESC" });
              } else {
                setOptions({ ...options, order: "ASC" });
              }
            }}
          />
          من الاحدث الى الاقدم
        </Space>
        <ReactToPrint
          trigger={() => <Button>طباعة النتائج</Button>}
          content={() => componentRef}
        />
      </div>
      <Divider />
      <Table
        pagination={false}
        columns={columns}
        dataSource={productActivity}
        rowKey={(r) => r.productId}
        scroll={{ x: 500 }}
        summary={(currentData) => {
          let total = 0;
          for (let i = 0; i < currentData.length; i++) {
            total = total + currentData[i].value;
          }
          return (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={1} align="left">
                  المخزن
                </Table.Summary.Cell>

                <Table.Summary.Cell colSpan={4}>
                  <Typography.Text type="danger">
                    {total.toLocaleString()} |{" "}
                    {`${writtenNumber(total, { lang: "ar" })} قطعة`}
                  </Typography.Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />
      <div style={{ display: "none" }}>
        {!isLoading && (
          <ProductActivityToPrint
            startDate={options.start}
            endDate={options.end}
            productActivity={productActivity}
            product={props.product}
            ref={(el) => (componentRef = el)}
          />
        )}
      </div>
    </div>
  ) : (
    "حصل خطأ"
  );
}
