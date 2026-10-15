'use client'

// Card inputs for checkout. They have no `name`, so the numbers are never part of the order
// form data; ProjectForm reads them and sends them only to Intuit's tokenization endpoint.
export default function CardFields() {
  return (
    <fieldset className="form-section card-section">
      <legend className="section-title">Payment</legend>
      <p className="hint">Your card is saved securely with QuickBooks Payments when you place your order. We only charge it once your order enters our production queue.</p>
      <label>Name on card<input id="cc-name" autoComplete="cc-name" required /></label>
      <label>Card number<input id="cc-number" inputMode="numeric" autoComplete="cc-number" placeholder="1234 1234 1234 1234" required /></label>
      <div className="form-row card-row">
        <label>Expiry<input id="cc-exp" inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" maxLength={9} onInput={formatExpiry} required /></label>
        <label>CVC<input id="cc-cvc" inputMode="numeric" autoComplete="cc-csc" placeholder="123" required /></label>
        <label>Billing ZIP<input id="cc-zip" inputMode="numeric" autoComplete="postal-code" placeholder="08701" required /></label>
      </div>
      <p className="secure-note">🔒 Card details go straight to QuickBooks Payments. Mint 35 never sees or stores your card number.</p>
    </fieldset>
  )
}

const digits = s => String(s || '').replace(/\D/g, '')

// Phone number pads have no "/" key, so add it as people type: "1230" shows as "12 / 30".
function formatExpiry(e) {
  const el = e.currentTarget
  if (e.nativeEvent?.inputType?.startsWith('delete')) { el.value = el.value.replace(/\s*\/\s*$/, ''); return }
  let d = digits(el.value)
  if (d.length === 1 && Number(d) > 1) d = '0' + d
  el.value = d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2, 6)}` : d
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
