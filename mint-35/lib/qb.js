import 'server-only'
import {randomUUID, randomBytes, createHash, createCipheriv, createDecipheriv} from 'node:crypto'
import {createAdminClient} from './supabase/admin'

// QuickBooks Payments API. Cards are tokenized in the customer's browser (card numbers never
// reach this server), saved to QuickBooks as a "card on file", and charged later by id.
// The QB_*_URL overrides exist only so the flow can be tested against a local stand-in.

export const QB_ENV = process.env.QB_ENVIRONMENT === 'production' ? 'production' : 'sandbox'
const API_BASE = process.env.QB_API_BASE || (QB_ENV === 'production' ? 'https://api.intuit.com' : 'https://sandbox.api.intuit.com')
const AUTH_URL = process.env.QB_AUTH_URL || 'https://appcenter.intuit.com/connect/oauth2'
const TOKEN_URL = process.env.QB_TOKEN_URL || 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
const SCOPE = 'com.intuit.quickbooks.payment'

export const qbConfigured = () => !!(process.env.QB_CLIENT_ID && process.env.QB_CLIENT_SECRET)
export const tokenizeUrl = () => `${API_BASE}/quickbooks/v4/payments/tokens`

export function authorizeUrl(state, redirectUri) {
  const q = new URLSearchParams({client_id: process.env.QB_CLIENT_ID, response_type: 'code', scope: SCOPE, redirect_uri: redirectUri, state})
  return `${AUTH_URL}?${q}`
}

async function tokenRequest(params) {
  const basic = Buffer.from(`${process.env.QB_CLIENT_ID}:${process.env.QB_CLIENT_SECRET}`).toString('base64')
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {Authorization: `Basic ${basic}`, Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams(params),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.access_token) throw new Error(data.error_description || data.error || `QuickBooks sign-in failed (${res.status})`)
  return data
}

// QuickBooks tokens are encrypted (AES-256-GCM) before they're stored. The key comes from QB_TOKEN_KEY,
// or from the QuickBooks client secret when that isn't set, so a copy of the database alone can't be used.
// Switching to new QuickBooks keys means reconnecting QuickBooks, which stores fresh tokens.
const tokenKey = () => createHash('sha256').update(`mint35-qb-tokens:${process.env.QB_TOKEN_KEY || process.env.QB_CLIENT_SECRET || ''}`).digest()

function seal(text) {
  const iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', tokenKey(), iv)
  const body = Buffer.concat([c.update(text, 'utf8'), c.final()])
  return 'v1:' + Buffer.concat([iv, c.getAuthTag(), body]).toString('base64')
}

function unseal(value) {
  if (!value?.startsWith('v1:')) return value // stored before encryption was added; re-saved sealed on next refresh
  const raw = Buffer.from(value.slice(3), 'base64')
  const d = createDecipheriv('aes-256-gcm', tokenKey(), raw.subarray(0, 12))
  d.setAuthTag(raw.subarray(12, 28))
  return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString('utf8')
}

const expiresAt = secs => new Date(Date.now() + (Number(secs) || 3600) * 1000).toISOString()

async function saveTokens(t, extra = {}) {
  const row = {
    id: 1, environment: QB_ENV,
    access_token: seal(t.access_token), refresh_token: seal(t.refresh_token),
    access_expires_at: expiresAt(t.expires_in),
    refresh_expires_at: t.x_refresh_token_expires_in ? expiresAt(t.x_refresh_token_expires_in) : null,
    updated_at: new Date().toISOString(), ...extra,
  }
  const {error} = await createAdminClient().from('qb_connection').upsert(row)
  if (error) throw new Error('Could not save the QuickBooks connection.')
}

export async function connectWithCode({code, realmId, redirectUri, memberId}) {
  const t = await tokenRequest({grant_type: 'authorization_code', code, redirect_uri: redirectUri})
  await saveTokens(t, {realm_id: realmId, connected_by: memberId})
}

export async function getConnection() {
  const {data} = await createAdminClient().from('qb_connection').select('environment, realm_id, access_expires_at, refresh_expires_at, updated_at').eq('id', 1).maybeSingle()
  return data && data.environment === QB_ENV ? data : null
}

export async function disconnect() {
  await createAdminClient().from('qb_connection').delete().eq('id', 1)
}

export async function paymentsReady() {
  return qbConfigured() && !!(await getConnection())
}

async function accessToken(force = false) {
  const db = createAdminClient()
  const {data: c} = await db.from('qb_connection').select('*').eq('id', 1).maybeSingle()
  if (!c || c.environment !== QB_ENV) throw new Error('QuickBooks isn’t connected.')
  let access, refresh
  try { access = unseal(c.access_token); refresh = unseal(c.refresh_token) } catch { throw new Error('QuickBooks needs to be reconnected in Settings.') }
  if (!force && new Date(c.access_expires_at).getTime() - Date.now() > 120000 && c.access_token?.startsWith('v1:')) return access
  const t = await tokenRequest({grant_type: 'refresh_token', refresh_token: refresh})
  await saveTokens(t, {realm_id: c.realm_id, connected_by: c.connected_by})
  return t.access_token
}

async function qbFetch(path, body, retried = false) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await accessToken(retried)}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'request-Id': randomUUID(),
    },
    body: JSON.stringify(body),
  })
  if (res.status === 401 && !retried) return qbFetch(path, body, true)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.errors?.[0]?.message || data?.errors?.[0]?.moreInfo || `QuickBooks error (${res.status})`
    const err = new Error(msg)
    err.status = res.status
    throw err
  }
  return data
}

// Saves a browser-made card token to QuickBooks under `customerId` (our order id).
export async function saveCardFromToken(customerId, token) {
  const card = await qbFetch(`/quickbooks/v4/customers/${encodeURIComponent(customerId)}/cards/createFromToken`, {value: token})
  return {id: card.id, last4: String(card.number || '').slice(-4) || null, brand: card.cardType || null}
}

// Charges a saved card. Returns the QuickBooks charge; throws if it isn't captured.
export async function chargeCard({cardId, amountCents, description}) {
  const charge = await qbFetch('/quickbooks/v4/payments/charges', {
    amount: (amountCents / 100).toFixed(2),
    currency: 'USD',
    cardOnFile: cardId,
    capture: true,
    description: description?.slice(0, 4000),
    context: {mobile: false, isEcommerce: true},
  })
  if (charge.status !== 'CAPTURED') {
    const err = new Error(charge.status === 'DECLINED' ? 'The card was declined.' : `The charge wasn’t completed (${charge.status || 'unknown status'}).`)
    err.charge = charge
    throw err
  }
  return charge
}
