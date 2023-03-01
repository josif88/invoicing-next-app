import { Space, Select } from "antd";
import { useState } from "react";
import { useInvoices } from "../../utils/hooks";

const InvoiceListView = ({ onChange, nullable = true }) => {
  const [options, setOptions] = useState({
    current: 1,
    pageSize: 5,
    query: null,
  });

  const { invoices, isLoading } = useInvoices(options);

  return !isLoading ? (
    <Space direction="vertical">
      <label htmlFor="desc">القائمة</label>
      <Select
        style={{ width: "100%" }}
        placeholder="اضغط للاختيار"
        onChange={(e) => onChange(e)}
        showSearch
        onSearch={(e) => setOptions({ ...options, query: e })}
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        filterSort={(optionA, optionB) =>
          optionA.title
            .toLowerCase()
            .localeCompare(optionB.children.toLowerCase())
        }
      >
        {nullable && (
          <Select.Option title={"غير محدد"} value={null} key={"null"}>
            غير محدد
          </Select.Option>
        )}
        {invoices.map((e, i) => (
          <Select.Option title={e.id} value={e.id} key={i}>
            <span className="flex space-between">{e.id} </span>
          </Select.Option>
        ))}
      </Select>
    </Space>
  ) : (
    "تحميل الفواتير"
  );
};

export default InvoiceListView;
