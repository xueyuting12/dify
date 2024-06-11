import React, { useState } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { zhCN } from 'date-fns/locale/zh-CN'
import s from './index.module.css'
import 'react-datepicker/dist/react-datepicker.css'
import './index.css'

const CustomDatePicker = () => {
  registerLocale('zhCN', zhCN)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  return (
    <div>
      <DatePicker
        locale="zhCN"
        timeInputLabel="时间: "
        dateFormat="yyyy-MM-dd h:mm aa"
        showTimeInput
        placeholderText="开始时间"
        className={`${s.customDatePicker}`}
        selected={startDate}
        onChange={date => date && setStartDate(date)} />
      <span>-</span>
      <DatePicker
        locale="zhCN"
        timeInputLabel="时间: "
        dateFormat="yyyy-MM-dd h:mm aa"
        showTimeInput
        placeholderText="截止时间"
        className={`${s.customDatePicker}`}
        selected={endDate}
        onChange={date => date && setEndDate(date)} />
    </div>

  )
}

export default CustomDatePicker
