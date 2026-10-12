import {NextResponse} from 'next/server'
import {connectWithCode} from '@/lib/qb'
import {currentOwner} from '@/lib/owner'

// Intuit sends the owner back here after they approve access.
export async function GET(request) {
  const url = new URL(request.url)
  const origin = url.origin
  const back = status => {
    const res = NextResponse.redirect(`${origin}/admin/settings?qb=${status}`)
    res.cookies.delete('qb_state')
    return res
  }
  const owner = await currentOwner()
  if (!owner) return NextResponse.redirect(`${origin}/admin/login`)
  if (url.searchParams.get('error')) return back('cancelled')
  const state = url.searchParams.get('state')
  if (!state || state !== request.cookies.get('qb_state')?.value) return back('bad-state')
  const code = url.searchParams.get('code')
  const realmId = url.searchParams.get('realmId')
  if (!code || !realmId) return back('failed')
  try {
    await connectWithCode({code, realmId, redirectUri: `${origin}/api/qb/callback`, memberId: owner.id})
  } catch (e) {
    console.error('QuickBooks connect failed', e)
    return back('failed')
  }
  return back('connected')
}
