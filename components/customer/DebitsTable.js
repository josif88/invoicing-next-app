import { Divider, Input, Tag, Button, Drawer } from "antd";
import { verifyAuth } from "../../utils/valdations";
import { SearchOutlined } from "@ant-design/icons";
import { useDebits } from "../../utils/hooks";
import { Table } from "antd";
import { useState } from "react";
import { CustomerActivity } from "../reports/customerActivity";

export default function DebitsTable(props) {
  const [showReport, setShowReport] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [options, setOptions] = useState({
    current: 1,
    pageSize: 10,
    query: null,
  });

  const { customers, count, isLoading } = useDebits(options);

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
            setShowReport(true);
            setSelectedCustomer(record);
          }}
        >
          المالية
        </Button>
      ),
    },
    {
      title: "اسم الوكيل",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "رقم الهاتف",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "الاسم التجاري",
      dataIndex: "businessName",
      key: "businessName",
    },
    {
      title: "المديونية",
      dataIndex: "debit",
      key: "debit",
      render: (t) =>
        +t <= 0 ? (
          +t == 0 ? (
            <Tag color="green">{t.toLocaleString()}</Tag>
          ) : (
            <Tag color="cyan">{t.toLocaleString()}</Tag>
          )
        ) : (
          <Tag color="red">{t.toLocaleString()}</Tag>
        ),
    },
  ];
  return (
    <>
      <div className="grid align-items">
        <Input
          placeholder="بحث باسم الوكيل"
          allowClear
          onChange={(e) => {
            setOptions({ ...options, query: e.target.value });
          }}
          value={options.query}
          addonAfter={<SearchOutlined />}
        />
        <div />

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
      </div>
      <Divider />
      <section>
        {!isLoading && (
          <Table
            onChange={(page) => {
              setOptions(page);
            }}
            pagination={{
              pageSize: options.pageSize,
              total: count,
              current: options.current,
            }}
            columns={columns}
            dataSource={customers}
            scroll={{ x: 700 }}
            rowKey={(r) => r.id}
          />
        )}
      </section>
      <Drawer
        placement="bottom"
        height={"100%"}
        destroyOnClose
        closable
        onClose={() => {
          setShowReport(false);
          setSelectedCustomer(null);
        }}
        visible={showReport}
      >
        <CustomerActivity customer={selectedCustomer} />
      </Drawer>
    </>
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
