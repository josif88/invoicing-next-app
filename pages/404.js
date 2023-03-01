import { Button, Result, Space } from "antd";

export default function notFound(props) {
  return (
    <div className="center rtl">
      <Space direction="vertical" align="center">
        <img src="/assets/404.jpg" style={{ width: "300px" }} />

        <h4>الصفحة المطلوبة غير موجودة</h4>
        <Button href="/" type="primary">
          الرجوع الى الصفحة الرئيسية
        </Button>
      </Space>
    </div>
  );
}
