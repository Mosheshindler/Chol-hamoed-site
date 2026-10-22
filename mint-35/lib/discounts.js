// Discount math shared by checkout (preview) and the order API (the real numbers).
// A rule is {code, kind: 'percent'|'amount', value, packages: [names] (empty = all)}.
// `lines` are [{package, cents}]; returns the cents off each line (never more than the line).

export const normalizeCode = c => String(c || '').trim().toUpperCase().replace(/\s+/g, '')

export const appliesTo = (rule, pkg) => !rule.packages?.length || rule.packages.includes(pkg)

export function discountLines(rule, lines) {
  const ok = lines.map(l => (appliesTo(rule, l.package) && l.cents > 0 ? l.cents : 0))
  const base = ok.reduce((s, c) => s + c, 0)
  if (!base) return lines.map(() => 0)
  if (rule.kind === 'percent') return ok.map(c => Math.round(c * Math.min(Number(rule.value), 100) / 100))
  // A dollar amount is spread across the lines it applies to, in proportion to their price.
  const off = Math.min(Math.round(Number(rule.value) * 100), base)
  let left = off
  return ok.map((c, i) => {
    if (!c) return 0
    const last = ok.slice(i + 1).every(x => !x)
    const share = last ? left : Math.round(off * c / base)
    left -= share
    return share
  })
}

// "20% off", "$500 off", "20% off Single 35"
export function describeDiscount(rule) {
  const amount = rule.kind === 'percent' ? `${Number(rule.value)}% off` : `$${Number(rule.value).toLocaleString('en-US')} off`
  return rule.packages?.length ? `${amount} ${rule.packages.join(' or ')}` : amount
}
