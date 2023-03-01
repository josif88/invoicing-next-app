import { useCategories } from "../../../../utils/hooks";
import { Select } from "antd";

export default function CategoryListView(props) {
  const { categories, isLoading: categoriesLoading } = useCategories();

  return (
    <Select
      style={{ minWidth: "100px" }}
      placeholder="جميع التصنيفات"
      defaultValue={null}
      onChange={(e) => props.onChange(e)}
    >
      <Select.Option title={"غير محدد"} value={null} key={"null"}>
        الكل
      </Select.Option>

      {!categoriesLoading &&
        categories.map((e, i) => (
          <Select.Option title={e.name} value={e.id} key={i}>
            {e.name}
          </Select.Option>
        ))}
    </Select>
  );
}
