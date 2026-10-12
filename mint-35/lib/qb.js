import 'server-only'
import {randomUUID} from 'node:crypto'
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

const expiresAt = secs => new Date(Date.now() + (Number(secs) || 3600) * 1000).toISOString()

async function saveTokens(t, extra = {}) {
  const row = {
    id: 1, environment: QB_ENV,
    access_token: t.access_token, refresh_token: t.refresh_token,
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
  if (!force && new Date(c.access_expires_at).getTime() - Date.now() > 120000) return c.access_token
  const t = await tokenRequest({grant_type: 'refresh_token', refresh_token: c.refresh_token})
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
