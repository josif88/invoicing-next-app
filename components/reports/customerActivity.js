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
import { useCustomerActivity } from "../../utils/hooks";
import { CustomerActivityToPrint } from "./customerActivityPrint";

export function CustomerActivity(props) {
  const [options, setOptions] = useState(
    props.customer && { id: props.customer.id }
  );

  const { customerActivity, isLoading } = useCustomerActivity(options);

  let componentRef = useRef();

  const columns = [
    {
      title: "الحالة",
      dataIndex: "credit",
      key: "credit",
      render: (t, r) =>
        t ? (
          r.credit == "دائن" ? (
            <Tag color="green">{r.credit}</Tag>
          ) : (
            <Tag color="red">{r.credit}</Tag>
          )
        ) : (
          <Tag color="red">مديونية سابقة</Tag>
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
      render: (t) => (t ? moment(t).format("hh:mm A") : ""),
    },
    {
      title: "نوع المستند",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "رقمه",
      dataIndex: "documentId",
      key: "documentId",
    },
    {
      title: "المبلغ",
      dataIndex: "value",
      key: "value",
      render: (t, r) =>
        r.credit == "دائن" ? (
          <Tag color="green">{r.value.toLocaleString()}</Tag>
        ) : (
          <Tag color="red">{r.value.toLocaleString()}</Tag>
        ),
    },
    {
      title: "الملاحظات",
      dataIndex: "note",
      key: "note",
    },
  ];

  return props.customer ? (
    <div className="rtl page">
      <Typography.Title
        level={2}
        style={{ margin: "0 0 30px 0", textAlign: "center" }}
      >
        تقرير بالحركة المالية للوكيل {props.customer.name}
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
        dataSource={customerActivity}
        rowKey={(r) => r.id}
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
                  اجمالي الدين
                </Table.Summary.Cell>

                <Table.Summary.Cell colSpan={4}>
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
      <div style={{ display: "none" }}>
        {!isLoading && (
          <CustomerActivityToPrint
            startDate={options.start}
            endDate={options.end}
            customerActivity={customerActivity}
            customer={props.customer}
            ref={(el) => (componentRef = el)}
          />
        )}
      </div>
    </div>
  ) : (
    "حصل خطأ"
  );
}
