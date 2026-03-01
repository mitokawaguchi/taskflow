import { useState, useMemo } from 'react'
import { today } from './utils'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function toYMD(d) {
  if (!d) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseYMD(str) {
  if (!str) return null
  const [y, m, day] = str.split('-').map(Number)
  if (!y || !m || !day) return null
  const d = new Date(y, m - 1, day)
  return Number.isNaN(d.getTime()) ? null : d
}

export default function CalendarPicker({ value, onChange, min, max, onClear }) {
  const valueDate = parseYMD(value)
  const [viewDate, setViewDate] = useState(() => valueDate || new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const { daysInMonth, padding } = useMemo(() => {
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    return {
      daysInMonth: last.getDate(),
      padding: first.getDay(),
    }
  }, [year, month])

  const minDate = min ? parseYMD(min) : null
  const maxDate = max ? parseYMD(max) : null

  const days = useMemo(() => {
    const list = []
    for (let i = 0; i < padding; i++) list.push(null)
    for (let d = 1; d <= daysInMonth; d++) list.push(new Date(year, month, d))
    return list
  }, [year, month, daysInMonth, padding])

  const isDisabled = (d) => {
    if (!d) return true
    if (minDate && d < minDate) return true
    if (maxDate && d > maxDate) return true
    return false
  }

  const handleSelect = (d) => {
    if (!d || isDisabled(d)) return
    onChange(toYMD(d))
  }

  const thisYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 8 }, (_, i) => thisYear - 2 + i)
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))
  const setYearMonth = (y, m) => setViewDate(new Date(y, m, 1))
  const goToToday = () => {
    const d = new Date()
    setViewDate(d)
    onChange(toYMD(d))
  }

  const todayStr = today()
  const selectedStr = value || ''

  return (
    <div className="calendar-picker" role="application" aria-label="期限日を選択するカレンダー">
      <div className="calendar-picker-header">
        <button type="button" className="calendar-picker-nav" onClick={prevMonth} aria-label="前月">
          ‹
        </button>
        <div className="calendar-picker-year-month">
          <select
            className="calendar-picker-select"
            value={year}
            onChange={(e) => setYearMonth(Number(e.target.value), month)}
            aria-label="年を選択"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <select
            className="calendar-picker-select"
            value={month + 1}
            onChange={(e) => setYearMonth(year, Number(e.target.value) - 1)}
            aria-label="月を選択"
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
        </div>
        <button type="button" className="calendar-picker-nav" onClick={nextMonth} aria-label="翌月">
          ›
        </button>
      </div>
      <div className="calendar-picker-weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w} className="calendar-picker-weekday">
            {w}
          </span>
        ))}
      </div>
      <div className="calendar-picker-grid">
        {days.map((d, i) => {
          if (!d) return <div key={`pad-${year}-${month}-${i}`} className="calendar-picker-day calendar-picker-day-pad" />
          const ymd = toYMD(d)
          const isSelected = ymd === selectedStr
          const isToday = ymd === todayStr
          const disabled = isDisabled(d)
          return (
            <button
              key={ymd}
              type="button"
              className={`calendar-picker-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => handleSelect(d)}
              disabled={disabled}
              aria-label={`${year}年${month + 1}月${d.getDate()}日`}
              aria-pressed={isSelected}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
      <div className="calendar-picker-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={goToToday}>
          今日
        </button>
        {onClear && value && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>
            クリア
          </button>
        )}
      </div>
    </div>
  )
}
