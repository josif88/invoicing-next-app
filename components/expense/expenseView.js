import { Space, Typography } from "antd";
import moment from "moment";
import React from "react";
import writtenNumber from "written-number";

export class ExpenseView extends React.PureComponent {
  render() {
    return (
      this.props.expense && (
        <div className="rtl page">
          <div
            className="table-col-title padding margin"
            style={{ textAlign: "center" }}
          >
            <strong>سند صرف</strong>
          </div>

          <div className="flex space-between">
            <Space>
              <Typography.Text>رقم المستند:</Typography.Text>
              <Typography.Text strong>{this.props.expense.id}</Typography.Text>
            </Space>
          </div>

          <div>
            <Typography.Paragraph>
              يصرف للسيد:
              {this.props.expense.issuedTo
                ? this.props.expense.issuedTo
                : "غير محدد"}
            </Typography.Paragraph>
            <Typography.Text>مبلغ وقدره </Typography.Text>
            <Typography.Text>
              {writtenNumber(this.props.expense.value, { lang: "ar" })} دينار
            </Typography.Text>
            <br />
            <Typography.Text>
              رقماً {this.props.expense.value} دينار
            </Typography.Text>
            <br />
            <Space>
              <Typography.Paragraph>بتاريخ:</Typography.Paragraph>
              <Typography.Paragraph strong>
                {moment(this.props.expense.createdAt).format("YYYY/MM/DD")}
              </Typography.Paragraph>
            </Space>
            {this.props.expense.note && (
              <p>وذلك عن: {this.props.expense.note}</p>
            )}
            {this.props.expense.category && (
              <Space>
                <Typography.Paragraph>باب الصرف:</Typography.Paragraph>
                <Typography.Paragraph strong>
                  {this.props.expense.category}
                </Typography.Paragraph>
              </Space>
            )}
            <br />
            <Space>
              <Typography.Paragraph>اسم المسلم:</Typography.Paragraph>
              <Typography.Paragraph strong>
                {this.props.expense.admin.name}
              </Typography.Paragraph>
            </Space>
          </div>
        </div>
      )
    );
  }
}
