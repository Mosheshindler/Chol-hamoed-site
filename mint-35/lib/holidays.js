import 'server-only'
import {HebrewCalendar, flags} from '@hebcal/core'

// Days Mint 35 is closed besides weekends: they are skipped when counting business days and can't
// be picked as a delivery date. Jewish holidays follow the diaspora calendar (two-day Yom Tov).
// Erev Yom Tov is closed too. Chanukah and fast days other than Tisha B'Av are working days.
const JEWISH_CLOSED = flags.CHAG | flags.CHOL_HAMOED
const JEWISH_EXTRA = new Set(['Purim', "Tish'a B'Av"])
const EREV_YOM_TOV = /^Erev (Rosh Hashana|Yom Kippur|Sukkot|Pesach|Shavuot)\b/

const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const ymd = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

// nth weekday (0=Sun) of a month; n = -1 for the last one.
function nthWeekday(y, m, wd, n) {
  if (n > 0) {
    const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay()
    return ymd(y, m, 1 + ((wd - first + 7) % 7) + (n - 1) * 7)
  }
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const last = new Date(Date.UTC(y, m - 1, lastDay)).getUTCDay()
  return ymd(y, m, lastDay - ((last - wd + 7) % 7))
}

function usHolidays(y) {
  return [
    [ymd(y, 1, 1), 'New Year’s Day'],
    [nthWeekday(y, 5, 1, -1), 'Memorial Day'],
    [ymd(y, 7, 4), 'Independence Day'],
    [nthWeekday(y, 9, 1, 1), 'Labor Day'],
    [nthWeekday(y, 11, 4, 4), 'Thanksgiving'],
    [ymd(y, 12, 25), 'Christmas'],
  ]
}

// "Pesach V (CH’’M)" → "Chol Hamoed Pesach", "Sukkot VII (Hoshana Raba)" → "Hoshana Raba".
const niceName = n => n.includes('Hoshana Raba') ? 'Hoshana Raba'
  : /CH[’']{2}M/.test(n) ? `Chol Hamoed ${n.split(' ')[0]}` : n

const cache = new Map()

// Map of 'YYYY-MM-DD' → holiday name for the given years.
export function closedDays(fromYear, toYear) {
  const key = `${fromYear}-${toYear}`
  if (cache.has(key)) return cache.get(key)
  const out = new Map()
  const events = HebrewCalendar.calendar({start: new Date(fromYear, 0, 1), end: new Date(toYear, 11, 31), il: false, noModern: true, noRoshChodesh: true, noSpecialShabbat: true})
  for (const e of events) {
    if ((e.getFlags() & JEWISH_CLOSED) || JEWISH_EXTRA.has(e.getDesc()) || EREV_YOM_TOV.test(e.getDesc())) {
      const day = iso(e.getDate().greg())
      if (!out.has(day)) out.set(day, niceName(e.render('en')))
    }
  }
  for (let y = fromYear; y <= toYear; y++) for (const [day, name] of usHolidays(y)) if (!out.has(day)) out.set(day, name)
  cache.set(key, out)
  return out
}

// Closed days around now (last year through next), as a plain {'YYYY-MM-DD': name} object the
// browser can use.
export function upcomingClosedDays(now = new Date()) {
  const y = now.getUTCFullYear()
  return Object.fromEntries(closedDays(y - 1, y + 1))
}
