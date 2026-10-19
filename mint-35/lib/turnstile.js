import 'server-only'

// Cloudflare Turnstile ("are you human" check) on checkout, so bots can't use the order form to test
// stolen cards. Off until TURNSTILE_SECRET_KEY and NEXT_PUBLIC_TURNSTILE_SITE_KEY are set in Vercel.
export const turnstileOn = () => !!process.env.TURNSTILE_SECRET_KEY

export async function verifyHuman(token, ip) {
  if (!turnstileOn()) return true
  if (!token || typeof token !== 'string') return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({secret: process.env.TURNSTILE_SECRET_KEY, response: token, ...(ip ? {remoteip: ip} : {})}),
    })
    const data = await res.json()
    return data.success === true
  } catch (e) {
    console.error('Turnstile check failed', e.message)
    return false
  }
}
