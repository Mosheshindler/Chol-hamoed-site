import 'server-only'
import {headers} from 'next/headers'

// Base URL for links in emails. NEXT_PUBLIC_SITE_URL (https://www.mint35.com) wins so customers always
// get the official address; without it, the address the site is being used on right now.
export async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  try {
    const h = await headers()
    const host = h.get('x-forwarded-host') || h.get('host')
    if (host) return `${h.get('x-forwarded-proto') || 'https'}://${host}`
  } catch {}
  return 'https://www.mint35.com'
}

export const customerLink = (origin, token) => `${origin}/p/${token}`
