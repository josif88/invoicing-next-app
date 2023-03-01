import { Space, Typography } from 'antd'
import moment from 'moment'
import React from 'react'
import writtenNumber from 'written-number'

export class InvoiceSheet extends React.PureComponent {
  constructor(props) {
    super(props)

    this.props = {
      ...this.props,
      footer: true,
    }
    this.state = {
      invoice: null,
      invoiceTotalPrice: null,
      itemsTotal: 0,
    }
  }

  fetchUpdate() {
    fetch(`/api/invoice/${this.props.invoiceId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status) {
          this.setState({ invoice: res.data })

          let priceTotal = 0
          let itemsCount = 0
          for (let i = 0; i < this.state.invoice.invoiceItem.length; i++) {
            priceTotal =
              priceTotal +
              this.state.invoice.invoiceItem[i].price *
              this.state.invoice.invoiceItem[i].quantity
            itemsCount = itemsCount + this.state.invoice.invoiceItem[i].quantity
          }
          this.setState({
            ...this.state,
            invoiceTotalPrice: priceTotal,
            itemsTotal: itemsCount,
          })
        } else {
          console.log(res)
        }
      })
  }

  componentDidMount() {
    this.fetchUpdate()
  }

  // componentDidUpdate() {
  //   this.fetchUpdate()
  // }

  render() {
    return (
      this.state.invoice && (
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
              <Typography.Text>رقم القائمة:</Typography.Text>
              <Typography.Text strong>{this.state.invoice.id}</Typography.Text>
            </Space>
          </div>
          <div
            className="margin flex space-between"
            style={{
              padding: '8px 0 8px 0',
              borderBottom: '1px solid #000',
              width: '100%',
            }}
          >
            <Typography.Text>
              العنوان: حي النصر الطريق السياحي قرب مول شاكر
            </Typography.Text>
            <Typography.Text>هاتف: 07718508592</Typography.Text>
          </div>
          <div className="flex space-between" style={{ margin: '15mm 0 0 0 ' }}>
            <Space>
              <Typography.Paragraph>اسم الوكيل:</Typography.Paragraph>
              <Typography.Paragraph strong>
                {this.state.invoice.customer
                  ? this.state.invoice.customer.name
                  : 'عميل نقدي'}
              </Typography.Paragraph>
            </Space>

            <Space>
              <Typography.Paragraph>تاريخ الفاتورة:</Typography.Paragraph>
              <Typography.Paragraph strong>
                {moment(this.state.invoice.createdAt).format('YYYY/MM/DD')}
              </Typography.Paragraph>
            </Space>
          </div>
          <Space>
            <Typography.Text>التسديد:</Typography.Text>
            <Typography.Text strong>
              {this.state.invoice.onCredit ? 'آجل' : 'نقد'}
            </Typography.Text>
          </Space>
          <table
            style={{
              margin: '5mm 0 0 0',
              direction: 'rtl',
              textAlign: 'right',
              width: '100%',
              fontFamily: 'initial',
            }}
          >
            <tr>
              <th
                className="table-col-title"
                style={{
                  width: '3%',
                }}
              >
                ت
              </th>
              <th
                className="table-col-title"
                style={{
                  width: '47%',
                }}
              >
                المادة
              </th>
              <th
                className="table-col-title"
                style={{
                  width: '10%',
                }}
              >
                الكمية
              </th>
              <th
                className="table-col-title"
                style={{
                  width: '15%',
                }}
              >
                سعر المفرد
              </th>
              <th
                className="table-col-title"
                style={{
                  width: '25%',
                }}
              >
                المجموع
              </th>
            </tr>
            {this.state.invoice.invoiceItem.map((p, i) => (
              <tr>
                <td className="table-cell">{i + 1}</td>
                <td className="table-cell">{p.product.name}</td>
                <td className="table-cell">{p.quantity}</td>
                <td className="table-cell">{p.price}</td>
                <td className="table-cell">{p.price * p.quantity}</td>
              </tr>
            ))}
            <tr>
              <td />
              <td
                style={{
                  textAlign: 'left',
                  paddingInlineEnd: '5px',
                  fontWeight: 'bold',
                }}
              >
                مجموع الكراتين
              </td>
              <td className="table-col-title" style={{ fontWeight: 'bold' }}>
                {this.state.itemsTotal}
              </td>
              <td
                className="table-col-title"
                style={{
                  textAlign: 'left',
                  paddingInlineEnd: '5px',
                  fontWeight: 'bold',
                }}
              >
                اجمالي السعر
              </td>
              <td className="table-col-title" style={{ fontWeight: 'bold' }}>
                {this.state.invoiceTotalPrice}
              </td>
            </tr>
          </table>
          <div
            className="padding"
            style={{
              textAlign: 'left',
              paddingInlineEnd: '5px',
              fontWeight: 'bold',
              fontFamily: 'initial',
            }}
          >
            {`المجموع كتابة: ${writtenNumber(this.state.invoiceTotalPrice, {
              lang: 'ar',
            })} دينار عراقي`}
          </div>
          {this.props.footer && (
            <footer style={{ height: '100px' }}>توقيع المستلم</footer>
          )}
        </div>
      )
    )
  }
}
