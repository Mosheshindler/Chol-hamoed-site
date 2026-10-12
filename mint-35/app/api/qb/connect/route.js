import {NextResponse} from 'next/server'
import {randomUUID} from 'node:crypto'
import {authorizeUrl, qbConfigured} from '@/lib/qb'
import {currentOwner} from '@/lib/owner'

// Starts "Connect QuickBooks": sends the owner to Intuit to approve access.
export async function GET(request) {
  const origin = new URL(request.url).origin
  if (!(await currentOwner())) return NextResponse.redirect(`${origin}/admin/login`)
  if (!qbConfigured()) return NextResponse.redirect(`${origin}/admin/settings?qb=missing-keys`)
  const state = randomUUID()
  const res = NextResponse.redirect(authorizeUrl(state, `${origin}/api/qb/callback`))
  res.cookies.set('qb_state', state, {httpOnly: true, secure: origin.startsWith('https'), sameSite: 'lax', maxAge: 600, path: '/'})
  return res
}
