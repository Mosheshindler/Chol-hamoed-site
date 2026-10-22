// Sales tax (owner, Oct 2026): New Jersey sales tax on every order, unless the client marks their
// organization tax-exempt at checkout. Orders placed before tax was added have no brief.tax and stay untaxed.
export const SALES_TAX_RATE = 0.06625
export const SALES_TAX_LABEL = 'NJ sales tax (6.625%)'

export const EXEMPT_REASONS = [
  {value: 'nonprofit', label: 'Nonprofit organization (501(c)(3))'},
  {value: 'religious', label: 'Religious organization'},
  {value: 'school', label: 'School or educational institution'},
  {value: 'government', label: 'Government agency'},
  {value: 'resale', label: 'Buying for resale'},
  {value: 'other', label: 'Other exemption'},
]
export const exemptLabel = v => EXEMPT_REASONS.find(r => r.value === v)?.label || 'Tax-exempt'

export const taxCents = (cents, rate) => Math.round((cents || 0) * (rate || 0))

// The rate that applies to a job's charges (0 when exempt or ordered before tax was added).
export const jobTaxRate = j => (j?.brief?.tax && !j.brief.tax.exempt ? Number(j.brief.tax.rate) || 0 : 0)
// What gets charged for a price on this job: the price plus any tax.
export const withTax = (j, cents) => (cents || 0) + taxCents(cents, jobTaxRate(j))
