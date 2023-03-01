import { Space, Typography } from "antd";
import moment from "moment";
import React from "react";

export class OrderView extends React.PureComponent {
  render() {
    return this.props.order ? (
      <div className="rtl page">
        <div className="flex space-between">
          <Space align="center">
            <img
              src="/assets/logo.png"
              alt="fustuqa logo"
              width={25}
              height={25}
            />
            <Typography.Title level={3}>مخزن فستقة</Typography.Title>
          </Space>
          <Space>
            <Typography.Text>رقم الطلب:</Typography.Text>
            <Typography.Text strong>{this.props.order.id}</Typography.Text>
          </Space>
        </div>

        <div className="flex space-between" style={{ margin: "15mm 0 0 0 " }}>
          <Space>
            <Typography.Paragraph>اسم الوكيل:</Typography.Paragraph>
            <Typography.Paragraph strong>
              {this.props.order.customer
                ? this.props.order.customer.name
                : "عميل نقدي"}
            </Typography.Paragraph>
          </Space>

          <Space>
            <Typography.Paragraph>تاريخ الطلب:</Typography.Paragraph>
            <Typography.Paragraph strong>
              {moment(this.props.order.createdAt).format("YYYY / MM / DD")}
            </Typography.Paragraph>
          </Space>
        </div>

        <table
          style={{
            margin: "5mm 0 0 0",
            direction: "rtl",
            textAlign: "right",
            width: "100%",
            fontFamily: "initial",
          }}
        >
          <tr>
            <th
              className="table-col-title"
              style={{
                width: "3%",
              }}
            >
              ت
            </th>
            <th
              className="table-col-title"
              style={{
                width: "47%",
              }}
            >
              المادة
            </th>
            <th
              className="table-col-title"
              style={{
                width: "10%",
              }}
            >
              الكمية
            </th>
            <th
              className="table-col-title"
              style={{
                width: "15%",
              }}
            >
              سعر المفرد
            </th>
            <th
              className="table-col-title"
              style={{
                width: "25%",
              }}
            >
              المجموع
            </th>
          </tr>
          {this.props.order.orderItem.map((p, i) => (
            <tr>
              <td className="table-cell">{i + 1}</td>
              <td className="table-cell">{p.product.name}</td>
              <td className="table-cell">{p.quantity}</td>
              <td className="table-cell">{p.price}</td>
              <td className="table-cell">{p.subtotal}</td>
            </tr>
          ))}
        </table>
        <br />
        <Typography>{`الملاحظات: ${this.props.order.note}`}</Typography>
        <Typography>{`رقم الهاتف: ${this.props.order.phoneNumber}`}</Typography>
        <Typography>{`عنوان التوصيل: ${this.props.order.location}`}</Typography>
      </div>
    ) : (
      "لا يوجد معلومات"
    );
  }
}
