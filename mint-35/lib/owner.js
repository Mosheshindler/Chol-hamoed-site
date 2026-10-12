import 'server-only'
import {createClient} from './supabase/server'

// The signed-in team member if they're an owner, otherwise null.
export async function currentOwner() {
  const supabase = await createClient()
  const {data: {user}} = await supabase.auth.getUser()
  if (!user) return null
  const {data: me} = await supabase.from('team_members').select('id, name, role').eq('id', user.id).maybeSingle()
  return me?.role === 'owner' ? me : null
}
