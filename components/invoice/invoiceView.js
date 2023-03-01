import { Space, Typography } from "antd";
import moment, { relativeTimeThreshold } from "moment";
import React from "react";
import writtenNumber from "written-number";

export class InvoiceView extends React.PureComponent {
  render() {
    return this.props.invoice ? (
      <div className="rtl page">
        <div
          className="table-col-title padding margin"
          style={{ textAlign: "center" }}
        >
          <strong>
            {this.props.invoice.isReturn
              ? "فاتورة ارجاع"
              : this.props.invoice.onCredit
              ? "فاتورة بيع بالآجل"
              : "فاتورة بيع نقدي"}
          </strong>
        </div>
        <div className="flex space-between">
          <Space>
            <Typography.Text>رقم القائمة:</Typography.Text>
            <Typography.Text strong>{this.props.invoice.id}</Typography.Text>
          </Space>

          <Space>
            <Typography.Text>التسديد:</Typography.Text>
            <Typography.Text strong>
              {this.props.invoice.onCredit ? "آجل" : "نقد"}
            </Typography.Text>
          </Space>
        </div>

        <div className="flex space-between" style={{ margin: "5mm 0 0 0 " }}>
          <Space>
            <Typography.Paragraph>اسم الوكيل:</Typography.Paragraph>
            <Typography.Paragraph strong>
              {this.props.invoice.customer
                ? this.props.invoice.customer.name
                : "عميل نقدي"}
            </Typography.Paragraph>
          </Space>

          <Space>
            <Typography.Paragraph>تاريخ الفاتورة:</Typography.Paragraph>
            <Typography.Paragraph strong>
              {moment(this.props.invoice.createdAt).format("YYYY / MM / DD")}
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
          {this.props.invoice.invoiceItem.map((p, i) => (
            <tr>
              <td className="table-cell">{i + 1}</td>
              <td className="table-cell">{p.product.name}</td>
              <td className="table-cell">{p.quantity}</td>
              <td className="table-cell">{p.price.toLocaleString()}</td>
              <td className="table-cell">
                {(p.price * p.quantity).toLocaleString()}
              </td>
            </tr>
          ))}
          <tr>
            <td />
            <td
              style={{
                textAlign: "left",
                paddingInlineEnd: "5px",
                fontWeight: "bold",
              }}
            ></td>
            <td className="table-col-title" style={{ fontWeight: "bold" }}></td>
            <td
              className="table-col-title"
              style={{
                textAlign: "left",
                paddingInlineEnd: "5px",
                fontWeight: "bold",
              }}
            >
              اجمالي السعر
            </td>
            <td className="table-col-title" style={{ fontWeight: "bold" }}>
              {this.props.invoice.total.toLocaleString()}
            </td>
          </tr>
        </table>
        <div
          className="padding"
          style={{
            textAlign: "left",
            paddingInlineEnd: "5px",
            fontWeight: "bold",
            fontFamily: "initial",
          }}
        >
          {`المجموع كتابة: ${writtenNumber(this.props.invoice.total, {
            lang: "ar",
          })} دينار عراقي`}
        </div>
        {this.props.invoice.note && <p>الملاحظات: {this.props.invoice.note}</p>}
      </div>
    ) : (
      "لا يوجد معلومات"
    );
  }
}
