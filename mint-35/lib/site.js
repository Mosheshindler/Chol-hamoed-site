import 'server-only'
import {headers} from 'next/headers'

// Base URL for links in emails: the address the site is being used on right now
// (the vercel.app link before launch, mint35.com after), falling back to the env setting.
export async function siteOrigin() {
  try {
    const h = await headers()
    const host = h.get('x-forwarded-host') || h.get('host')
    if (host) return `${h.get('x-forwarded-proto') || 'https'}://${host}`
  } catch {}
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://mint35.com'
}

export const customerLink = (origin, token) => `${origin}/p/${token}`
