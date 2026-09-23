import {NextResponse} from 'next/server'

// Short, branded redirect for links made in the admin Link Builder — this exists so
// shared links never route through a third-party shortener first. TinyURL's free,
// unauthenticated links show a "this is a redirect, click to continue" interstitial
// page, which meant anyone clicking a shared link had to click twice. This redirects
// straight through on our own domain, and rebuilds the UTM params from the slug so
// GA4 still attributes the click to the right campaign.
export async function GET(request,{params}){
  const {slug}=await params
  const dest=new URL('/',request.url)
  dest.searchParams.set('utm_source','shared_link')
  dest.searchParams.set('utm_medium','referral')
  dest.searchParams.set('utm_campaign',slug||'untitled')
  return NextResponse.redirect(dest)
}
