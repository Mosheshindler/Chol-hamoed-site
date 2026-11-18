import 'server-only'
import {createClient} from '@supabase/supabase-js'

// Service-role client: bypasses row-level security. Only for trusted server code
// (public intake, team account creation). Never import this from a client component.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {persistSession: false, autoRefreshToken: false},
  })
}
