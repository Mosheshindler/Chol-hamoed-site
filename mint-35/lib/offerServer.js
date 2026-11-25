import 'server-only'
import {createAdminClient} from './supabase/admin'
import {offerState} from './offers'

// The offer behind a private link, with whether it can still be ordered.
export async function findOffer(token) {
  if (typeof token !== 'string' || !/^[\w-]{16,64}$/.test(token)) return {offer: null, state: 'Missing'}
  const {data, error} = await createAdminClient().from('custom_offers').select('*').eq('token', token).maybeSingle()
  if (error || !data) return {offer: null, state: 'Missing'}
  return {offer: data, state: offerState(data)}
}
