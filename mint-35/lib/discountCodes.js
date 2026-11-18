import 'server-only'
import {createAdminClient} from '@/lib/supabase/admin'
import {normalizeCode} from '@/lib/discounts'

// Looks up a code a client typed. Returns {rule} or {error} with a message they can read.
export async function findDiscount(input, packageNames = []) {
  const code = normalizeCode(input)
  if (!code) return {error: 'Enter a code.'}
  const {data: row} = await createAdminClient().from('discount_codes')
    .select('id, code, kind, value, packages, max_uses, uses, expires_on, active').eq('code', code).maybeSingle()
  const today = new Date().toLocaleDateString('en-CA', {timeZone: 'America/New_York'})
  if (!row || !row.active) return {error: 'That code isn’t valid.'}
  if (row.expires_on && row.expires_on < today) return {error: 'That code has expired.'}
  if (row.max_uses != null && row.uses >= row.max_uses) return {error: 'That code has been fully used.'}
  if (row.packages?.length && !packageNames.some(n => row.packages.includes(n))) return {error: `That code is only for ${row.packages.join(' or ')}.`}
  return {rule: {id: row.id, code: row.code, kind: row.kind, value: Number(row.value), packages: row.packages || []}}
}

// Uses one redemption; false if someone used the last one first.
export async function claimDiscount(id) {
  const {data, error} = await createAdminClient().rpc('claim_discount', {p_id: id})
  return !error && data === true
}
