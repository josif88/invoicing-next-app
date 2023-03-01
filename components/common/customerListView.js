import { Space, Select } from "antd";
import { useCustomers, useCustomersToListView } from "../../utils/hooks";

const CustomerListView = ({
  onChange,
  nullable = true,
  defaultValue = null,
  value = null,
}) => {
  const { customers, isLoading } = useCustomersToListView();

  return !isLoading ? (
    <Space direction="vertical">
      <label htmlFor="desc">الوكيل</label>
      <Select
        style={{ width: "100%" }}
        placeholder="اضغط للاختيار"
        defaultValue={defaultValue}
        value={value}
        onChange={(e) => onChange(e)}
        showSearch
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
        {customers.map((e, i) => (
          <Select.Option title={e.name} value={e.id} key={i}>
            {e.name}
          </Select.Option>
        ))}
      </Select>
    </Space>
  ) : (
    "تحميل الوكلاء"
  );
};

export default CustomerListView;
