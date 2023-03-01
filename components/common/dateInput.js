import { DatePicker, Space } from 'antd'

const DateInput = (props) => {
  return (
    <Space direction="vertical">
      <label htmlFor="createdAt">التاريخ</label>
      <DatePicker
        format={'DD / MM / YYYY'}
        onChange={(e) => props.onChange(e)}
        value={props.value}
      />
    </Space>
  )
}

export default DateInput
