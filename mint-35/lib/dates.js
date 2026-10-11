// Adds business days (Mon–Fri) to a date. Holidays aren't skipped; adjust the due date by hand if needed.
export function addBusinessDays(from, days) {
  const d = new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate()))
  let left = days
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1)
    const wd = d.getUTCDay()
    if (wd !== 0 && wd !== 6) left--
  }
  return d.toISOString().slice(0, 10)
}

export function formatDate(value) {
  if (!value) return '—'
  const d = typeof value === 'string' && value.length === 10 ? new Date(value + 'T12:00:00') : new Date(value)
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})
}

export function formatDateTime(value) {
  return new Date(value).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})
}
