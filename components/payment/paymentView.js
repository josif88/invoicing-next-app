import { Space, Typography } from "antd";
import moment from "moment";
import React from "react";
import writtenNumber from "written-number";

export class PaymentView extends React.PureComponent {
  render() {
    return (
      this.props.payment && (
        <div className="rtl page">
          <div
            className="table-col-title padding margin"
            style={{ textAlign: "center" }}
          >
            <strong>سند قبض</strong>
          </div>

          <div className="flex space-between">
            <Space>
              <Typography.Text>رقم المستند:</Typography.Text>
              <Typography.Text strong>{this.props.payment.id}</Typography.Text>
            </Space>
          </div>

          <div>
            <Typography.Paragraph>
              استملنا من السيد:
              {this.props.payment.customer
                ? this.props.payment.customer.name
                : "عميل نقدي"}
            </Typography.Paragraph>
            <Typography.Text>مبلغ وقدرة</Typography.Text>
            <Typography.Text>
              {writtenNumber(this.props.payment.value, { lang: "ar" })} دينار
            </Typography.Text>
            <br />
            <Typography.Text>
              رقماً {this.props.payment.value} دينار
            </Typography.Text>
            <br />
            <Space>
              <Typography.Paragraph>بتاريخ:</Typography.Paragraph>
              <Typography.Paragraph strong>
                {moment(this.props.payment.createdAt).format("YYYY/MM/DD")}
              </Typography.Paragraph>
            </Space>
            {this.props.payment.note && (
              <p>الملاحظات: {this.props.payment.note}</p>
            )}
          </div>
        </div>
      )
    );
  }
}
