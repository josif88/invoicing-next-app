import { Space, Typography } from "antd";
import moment from "moment";
import React from "react";
import writtenNumber from "written-number";

export class ProductActivityToPrint extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { total: 0 };
  }

  render() {
    return this.props.product ? (
      <div className="rtl page">
        <p style={{ textAlign: "center" }}>مخزن فستقة</p>
        <Typography.Title level={2} style={{ textAlign: "center" }}>
          كشف بالحركة المخزنية للمادة : {this.props.product.name}
        </Typography.Title>

        <div style={{ textAlign: "center" }}>
          <Space>
            {this.props.startDate && <div>من تاريخ {this.props.startDate}</div>}
            {this.props.endDate && <div>الى تاريخ {this.props.endDate}</div>}
          </Space>
        </div>

        <br />
        <table
          style={{
            margin: "5mm 0 0 0",
            direction: "rtl",
            textAlign: "right",
            width: "100%",
            fontSize: "18px",
            fontFamily: "initial",
            textAlign: "center",
          }}
        >
          <tr>
            <th
              className="table-col-title"
              style={{
                width: "5%",
              }}
            >
              الحالة
            </th>
            <th
              className="table-col-title"
              style={{
                width: "5%",
              }}
            >
              التاريخ
            </th>
            <th
              className="table-col-title"
              style={{
                width: "10%",
              }}
            >
              الوقت
            </th>
            <th
              className="table-col-title"
              style={{
                width: "10%",
              }}
            >
              رقم الفاتورة
            </th>
            <th
              className="table-col-title"
              style={{
                width: "5%",
              }}
            >
              الكمية
            </th>
            <th
              className="table-col-title"
              style={{
                width: "20%",
              }}
            >
              المشتري
            </th>
          </tr>
          {this.props.productActivity
            ? this.props.productActivity.map((r, i) => {
                this.state.total = this.state.total + r.value;
                return (
                  <tr>
                    <td
                      className="table-cell"
                      style={
                        r.status == "ادخال"
                          ? { background: "#faa9892e" }
                          : { background: "#89fa8e45" }
                      }
                    >
                      {r.status}
                    </td>
                    <td className="table-cell">
                      {moment(r.date).format("YYYY/MM/DD")}
                    </td>
                    <td className="table-cell">
                      {moment(r.date).format("HH:mm")}
                    </td>
                    <td className="table-cell">{r.invoiceId}</td>
                    <td
                      className="table-cell"
                      style={
                        r.status == "ادخال"
                          ? { background: "#faa9892e" }
                          : { background: "#89fa8e45" }
                      }
                    >
                      {r.value.toLocaleString()}
                    </td>
                    <td className="table-cell">{r.customerName}</td>
                  </tr>
                );
              })
            : "لا يوجد بيانات"}

          <tr>
            <td
              className="table-cell"
              colSpan={4}
              style={{ textAlign: "left", padding: 10, background: "#e4e4e4" }}
            >
              المجموع
            </td>
            <td className="table-cell" style={{ background: "#e4e4e4" }}>
              {this.state.total.toLocaleString()}
            </td>
            <td className="table-cell" style={{ background: "#e4e4e4" }}>
              {writtenNumber(+this.state.total, { lang: "ar" })} قطعة
            </td>
          </tr>
        </table>
      </div>
    ) : (
      "حصل خطأ"
    );
  }
}
