import 'server-only'
import {createAdminClient} from '@/lib/supabase/admin'
import {sendEmail, esc} from '@/lib/email'
import {siteOrigin} from '@/lib/site'

// Emails a team member a one-time link to choose their password (new invite or "forgot password").
// The link opens /admin/set-password; the token is only used when they submit, so link scanners can't burn it.
export async function sendPasswordLink({email, name, invite}) {
  const {data, error} = await createAdminClient().auth.admin.generateLink({type: 'recovery', email})
  const token = data?.properties?.hashed_token
  if (error || !token) return {error: 'Couldn’t create the link. Try again.'}
  const link = `${await siteOrigin()}/admin/set-password?token=${encodeURIComponent(token)}`
  const first = esc((name || '').split(' ')[0] || 'there')
  const res = await sendEmail({copy: false,
    to: email,
    subject: invite ? 'You’re invited to Mint 35 Admin' : 'Reset your Mint 35 Admin password',
    html: `<p>Hi ${first},</p>`
      + (invite
        ? `<p>You've been added to the Mint 35 team. Click below to choose your password and sign in.</p>`
        : `<p>Click below to choose a new password for Mint 35 Admin.</p>`)
      + `<p><a href="${link}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#88C040;color:#0a0c0a;font-weight:700;text-decoration:none">${invite ? 'Set my password' : 'Choose a new password'}</a></p>`
      + `<p style="color:#666;font-size:13px">This link works once and expires after a while. If it has expired, use "Forgot password?" on the sign-in page.</p>`
      + `<p>— Mint 35</p>`,
  })
  return res?.ok || res?.skipped ? {ok: true} : {error: 'The email didn’t send. Try again.'}
}
