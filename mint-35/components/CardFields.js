'use client'

// Card inputs for checkout. They have no `name`, so the numbers are never part of the order
// form data; ProjectForm reads them and sends them only to Intuit's tokenization endpoint.
export default function CardFields() {
  return (
    <fieldset className="form-section card-section">
      <legend className="section-title">Payment</legend>
      <p className="hint">Your card is saved securely with QuickBooks Payments when you place your order and charged in full once your order moves to production.</p>
      <label>Name on card<input id="cc-name" autoComplete="cc-name" required /></label>
      <label>Card number<input id="cc-number" inputMode="numeric" autoComplete="cc-number" placeholder="1234 1234 1234 1234" maxLength={23} onInput={formatNumber} required /></label>
      <div className="form-row card-row">
        <label>Expiry<input id="cc-exp" inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" maxLength={9} onInput={formatExpiry} required /></label>
        <label>CVC<input id="cc-cvc" inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} onInput={formatCvc} required /></label>
        <label>Billing ZIP<input id="cc-zip" inputMode="numeric" autoComplete="postal-code" placeholder="08701" required /></label>
      </div>
      <p className="secure-note">🔒 Payments are processed by Intuit Payments Inc. (QuickBooks Payments). Card details go straight to Intuit; Mint 35 never sees or stores your card number.</p>
    </fieldset>
  )
}

const digits = s => String(s || '').replace(/\D/g, '')

// Card number length and grouping by brand: Amex 15 digits as 4-6-5, Diners 14 as 4-6-4,
// Visa / Mastercard / Discover 16 as 4-4-4-4 (other cards up to 19).
function cardShape(d) {
  if (/^3[47]/.test(d)) return {max: 15, groups: [4, 6, 5]}
  if (/^3(0[0-5]|[68])/.test(d)) return {max: 14, groups: [4, 6, 4]}
  if (/^(4|5[1-5]|2[2-7]|6)/.test(d)) return {max: 16, groups: [4, 4, 4, 4]}
  return {max: 19, groups: [4, 4, 4, 4, 3]}
}

// Spaces the number as people type, stops at the brand's length, then moves on to the expiry.
function formatNumber(e) {
  const el = e.currentTarget
  const {max, groups} = cardShape(digits(el.value))
  const d = digits(el.value).slice(0, max)
  const out = []
  let i = 0
  for (const g of groups) { if (i >= d.length) break; out.push(d.slice(i, i + g)); i += g }
  el.value = out.join(' ')
  if (!e.nativeEvent?.inputType?.startsWith('delete') && d.length === max && luhn(d)) document.getElementById('cc-exp')?.focus()
}

// CVC is 4 digits on Amex, 3 on other cards.
function formatCvc(e) {
  const amex = /^3[47]/.test(digits(document.getElementById('cc-number')?.value))
  e.currentTarget.value = digits(e.currentTarget.value).slice(0, amex ? 4 : 3)
}

// Phone number pads have no "/" key, so add it as people type: "1230" shows as "12 / 30".
function formatExpiry(e) {
  const el = e.currentTarget
  if (e.nativeEvent?.inputType?.startsWith('delete')) { el.value = el.value.replace(/\s*\/\s*$/, ''); return }
  let d = digits(el.value)
  if (d.length === 1 && Number(d) > 1) d = '0' + d
  el.value = d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2, 6)}` : d
  if (d.length === 4 && parseExpiry(el.value)) document.getElementById('cc-cvc')?.focus()
}

// Accepts "12/30", "12 / 2030", "1230", "122030", "1/30"; returns {mm, yyyy} or null.
export function parseExpiry(raw) {
  const parts = String(raw || '').split(/[^0-9]+/).filter(Boolean)
  let mm, yy
  if (parts.length >= 2) [mm, yy] = parts
  else {
    const d = parts[0] || ''
    if (d.length === 4) [mm, yy] = [d.slice(0, 2), d.slice(2)]
    else if (d.length === 6) [mm, yy] = [d.slice(0, 2), d.slice(2)]
    else if (d.length === 3) [mm, yy] = [d.slice(0, 1), d.slice(1)]
    else return null
  }
  const m = Number(mm)
  if (!(m >= 1 && m <= 12)) return null
  if (yy.length === 2) yy = '20' + yy
  if (yy.length !== 4) return null
  const now = new Date()
  if (Number(yy) < now.getFullYear() || (Number(yy) === now.getFullYear() && m < now.getMonth() + 1)) return null
  return {mm: String(m).padStart(2, '0'), yyyy: yy}
}

function luhn(num) {
  let sum = 0
  for (let i = 0; i < num.length; i++) {
    let d = Number(num[num.length - 1 - i])
    if (i % 2) { d *= 2; if (d > 9) d -= 9 }
    sum += d
  }
  return sum % 10 === 0
}

// Reads the card inputs, checks them, and exchanges them for a one-time QuickBooks token.
export async function tokenizeCard(tokenUrl) {
  const v = id => document.getElementById(id)?.value || ''
  const number = digits(v('cc-number'))
  const exp = parseExpiry(v('cc-exp'))
  const cvc = digits(v('cc-cvc'))
  const zip = v('cc-zip').trim()
  if (number.length < 13 || number.length > 19 || !luhn(number)) throw new Error('Please check your card number.')
  if (!exp) throw new Error('Please check the card’s expiry date (MM / YY).')
  if (cvc.length < 3) throw new Error('Please check the CVC.')
  if (!zip) throw new Error('Please enter your billing ZIP code.')

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Accept: 'application/json', 'request-Id': crypto.randomUUID()},
    body: JSON.stringify({card: {
      name: v('cc-name').trim(), number, cvc,
      expMonth: exp.mm, expYear: exp.yyyy,
      address: {postalCode: zip, country: 'US'},
    }}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.value) throw new Error(data?.errors?.[0]?.message || 'We couldn’t verify that card. Please check the details.')
  return data.value
}
