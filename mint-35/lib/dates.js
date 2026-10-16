// Times render on the server (UTC), so pin them to the business's time zone.
const TZ = 'America/New_York'

// Orders placed at or after 5pm Eastern, or on a weekend, count as placed the next business day.
export const CUTOFF_HOUR = 17
export const LEAD_BUSINESS_DAYS = 3

const isWeekend = d => d.getUTCDay() === 0 || d.getUTCDay() === 6
const iso = d => d.toISOString().slice(0, 10)

// Adds business days (Mon–Fri) to a date. Holidays aren't skipped; adjust the due date by hand if needed.
export function addBusinessDays(from, days) {
  return iso(stepBusinessDays(new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())), days))
}

function stepBusinessDays(d, days) {
  const out = new Date(d)
  let left = days
  while (left > 0) {
    out.setUTCDate(out.getUTCDate() + 1)
    if (!isWeekend(out)) left--
  }
  return out
}

// The business day an order placed at `now` counts from, in Eastern time.
export function orderDay(now = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23'})
    .formatToParts(now).map(x => [x.type, x.value]))
  const d = new Date(Date.UTC(+p.year, +p.month - 1, +p.day))
  if (isWeekend(d) || +p.hour >= CUTOFF_HOUR) {
    do d.setUTCDate(d.getUTCDate() + 1); while (isWeekend(d))
  }
  return d
}

// Earliest delivery date a customer can pick (YYYY-MM-DD).
export function earliestDelivery(now = new Date()) {
  return iso(stepBusinessDays(orderDay(now), LEAD_BUSINESS_DAYS))
}


export function formatDate(value) {
  if (!value) return '—'
  const d = typeof value === 'string' && value.length === 10 ? new Date(value + 'T12:00:00') : new Date(value)
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: TZ})
}

export function formatDateTime(value) {
  return new Date(value).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: TZ})
}
