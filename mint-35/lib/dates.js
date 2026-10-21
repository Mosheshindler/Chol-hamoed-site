// Times render on the server (UTC), so pin them to the business's time zone.
const TZ = 'America/New_York'

// Orders placed at or after 5pm Eastern, or on a weekend or holiday, count as placed the next
// business day. `closed` is a list/Set of 'YYYY-MM-DD' holidays (see lib/holidays.js).
export const CUTOFF_HOUR = 17
// First cut takes 3 business days; with the revision round, the final is in hand about 6 business days out.
export const LEAD_BUSINESS_DAYS = 3
export const FINAL_LEAD_BUSINESS_DAYS = 6

const iso = d => d.toISOString().slice(0, 10)
const asSet = closed => closed instanceof Set ? closed : new Set(Array.isArray(closed) ? closed : Object.keys(closed || {}))

// True if the day (YYYY-MM-DD) is a weekend or a closed holiday.
export function isClosedDay(day, closed) {
  const wd = new Date(day + 'T00:00:00Z').getUTCDay()
  return wd === 0 || wd === 6 || asSet(closed).has(day)
}

function nextOpenDay(d, closed) {
  do d.setUTCDate(d.getUTCDate() + 1); while (isClosedDay(iso(d), closed))
  return d
}

function stepBusinessDays(d, days, closed) {
  const out = new Date(d)
  for (let i = 0; i < days; i++) nextOpenDay(out, closed)
  return out
}

// Eastern date and hour for a moment, as {day: Date at UTC midnight, hour}.
function eastern(now) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23'})
    .formatToParts(now).map(x => [x.type, x.value]))
  return {day: new Date(Date.UTC(+p.year, +p.month - 1, +p.day)), hour: +p.hour}
}

// Adds business days to today's Eastern date, skipping weekends and closed holidays.
export function addBusinessDays(from, days, closed) {
  return iso(stepBusinessDays(eastern(from).day, days, asSet(closed)))
}

// The business day an order placed at `now` counts from.
export function orderDay(now = new Date(), closed) {
  const set = asSet(closed)
  const {day, hour} = eastern(now)
  if (isClosedDay(iso(day), set) || hour >= CUTOFF_HOUR) nextOpenDay(day, set)
  return day
}

// Earliest date a customer can pick to have the final video in hand (YYYY-MM-DD).
export function earliestDelivery(now = new Date(), closed) {
  const set = asSet(closed)
  return iso(stepBusinessDays(orderDay(now, set), FINAL_LEAD_BUSINESS_DAYS, set))
}

export function formatDate(value) {
  if (!value) return '—'
  const d = typeof value === 'string' && value.length === 10 ? new Date(value + 'T12:00:00') : new Date(value)
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: TZ})
}

export function formatDateTime(value) {
  return new Date(value).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: TZ})
}

// Business days from today (Eastern) to `target` (YYYY-MM-DD): 0 = today, negative = that many business days late.
export function businessDaysUntil(target, closed, now = new Date()) {
  if (!target) return null
  const set = asSet(closed)
  const today = iso(eastern(now).day)
  if (target === today) return 0
  const [from, to, sign] = target > today ? [today, target, 1] : [target, today, -1]
  let n = 0
  for (const d = new Date(from + 'T00:00:00Z'); iso(d) < to;) {
    d.setUTCDate(d.getUTCDate() + 1)
    if (!isClosedDay(iso(d), set)) n++
  }
  return sign * n
}
