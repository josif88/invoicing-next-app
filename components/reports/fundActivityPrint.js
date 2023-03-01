import { Typography } from "antd";
import moment from "moment";
import React from "react";
import writtenNumber from "written-number";

export class FundActivityToPrint extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { total: 0 };
  }

  render() {
    return (
      <div className="rtl page">
        <p style={{ textAlign: "center" }}>مخزن فستقة</p>
        <Typography.Title level={3}>
          كشف بحركة الصندوق للفترة من {this.props.startDate} الى{" "}
          {this.props.endDate}
        </Typography.Title>

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
                width: "10%",
              }}
            >
              الحالة
            </th>
            <th
              className="table-col-title"
              style={{
                width: "10%",
              }}
            >
              التاريخ
            </th>
            <th
              className="table-col-title"
              style={{
                width: "15%",
              }}
            >
              الوقت
            </th>
            <th
              className="table-col-title"
              style={{
                width: "15%",
              }}
            >
              رقم السند
            </th>
            <th
              className="table-col-title"
              style={{
                width: "10%",
              }}
            >
              المبلغ
            </th>
            <th
              className="table-col-title"
              style={{
                width: "10%",
              }}
            >
              باب الصرف
            </th>
            <th
              className="table-col-title"
              style={{
                width: "30%",
              }}
            >
              الملاحظات
            </th>
          </tr>
          {this.props.fundActivity
            ? this.props.fundActivity.map((r, i) => {
                this.state.total = this.state.total + r.value;
                return (
                  <tr>
                    <td
                      className="table-cell"
                      style={
                        r.type == "قبض"
                          ? { background: "#faa9892e" }
                          : { background: "#89fa8e45" }
                      }
                    >
                      {r.type}
                    </td>
                    <td className="table-cell">
                      {moment(r.date).format("YYYY/MM/DD")}
                    </td>
                    <td className="table-cell">
                      {moment(r.date).format("HH:mm")}
                    </td>
                    <td className="table-cell">{r.documentId}</td>
                    <td className="table-cell">{r.value}</td>
                    <td className="table-cell">{r.category}</td>
                    <td className="table-cell">{r.note}</td>
                  </tr>
                );
              })
            : "لا يوجد بيانات"}

          <tr>
            <td
              className="table-cell"
              colSpan={5}
              style={{ textAlign: "left", padding: 10, background: "#e4e4e4" }}
            >
              المجموع
            </td>
            <td className="table-cell" style={{ background: "#e4e4e4" }}>
              {this.state.total.toLocaleString()}
            </td>
            <td className="table-cell" style={{ background: "#e4e4e4" }}>
              {writtenNumber(+this.state.total, { lang: "ar" })} دينار
            </td>
          </tr>
        </table>
      </div>
    );
  }
}
