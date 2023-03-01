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
import { useFundActivity } from "../../utils/hooks";
import { FundActivityToPrint } from "./fundActivityPrint";

export function FundActivity(props) {
  const [options, setOptions] = useState({
    start: moment().format("YYYY-MM-DD 00:00:00"),
    end: moment().format("YYYY-MM-DD 23:59:59"),
  });
  const { fundActivity, isLoading } = useFundActivity(options);

  let componentRef = useRef();

  const columns = [
    {
      title: "الصنف",
      dataIndex: "type",
      key: "type",
      render: (t, r) =>
        t == "قبض" ? (
          <Tag color="green">{r.type}</Tag>
        ) : (
          <Tag color="red">{r.type}</Tag>
        ),
    },
    {
      title: "التاريخ",
      dataIndex: "date",
      key: "date",
      render: (t) => moment(t).format("YYYY/MM/DD"),
    },
    {
      title: "الوقت",
      dataIndex: "date",
      key: "date",
      render: (t) => moment(t).format("HH:mm"),
    },
    {
      title: "رقم السند",
      dataIndex: "documentId",
      key: "documentId",
    },
    {
      title: "المبلغ",
      dataIndex: "value",
      key: "value",
      render: (t, r) =>
        r.type == "قبض" ? (
          <Tag color="green">{r.value.toLocaleString()}</Tag>
        ) : (
          <Tag color="red">{r.value.toLocaleString()}</Tag>
        ),
    },
    {
      title: "باب الصرف",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "الملاحظات",
      dataIndex: "note",
      key: "note",
    },
  ];

  return (
    <div className="rtl page">
      <Space>
        <Typography.Title level={4}>
          حركة الصندوق ليوم: {moment(options.start).format("YYYY/MM/DD")}
        </Typography.Title>
        {options.end && (
          <Typography.Title level={4}>
            الى يوم {moment(options.end).format("YYYY/MM/DD")}
          </Typography.Title>
        )}
      </Space>
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
              setOptions({ ...options, end: e.format("YYYY-MM-DD 23:59:59") });
            }}
          />
        </Space>
        <Space>
          <Switch
            onChange={(e) => {
              if (e) {
                setOptions({ ...options, order: "ASC" });
              } else {
                setOptions({ ...options, order: "DESC" });
              }
            }}
          />
          من الاقدم الى الاحدث
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
        dataSource={fundActivity}
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
                <Table.Summary.Cell colSpan={4} align="left">
                  الصندوق
                </Table.Summary.Cell>

                <Table.Summary.Cell colSpan={1}>
                  <Typography.Text type="success">
                    {total.toLocaleString()}
                  </Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell colSpan={2}>
                  <Typography.Text type="success">
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
          <FundActivityToPrint
            startDate={options.start}
            endDate={options.end}
            fundActivity={fundActivity}
            ref={(el) => (componentRef = el)}
          />
        )}
      </div>
    </div>
  );
}
