import {NextResponse} from 'next/server'

// Short, branded redirect for links made in the admin Link Builder — this exists so
// shared links never route through a third-party shortener first. TinyURL's free,
// unauthenticated links show a "this is a redirect, click to continue" interstitial
// page, which meant anyone clicking a shared link had to click twice. This redirects
// straight through on our own domain, and rebuilds the UTM params so GA4 still
// attributes the click to the right campaign.
//
// The code in the URL is a short random one (see admin/links), not the campaign name
// itself — a full campaign name in the link ("entertain-mint.com/l/moshes-whatsapp-
// status-update") looks unprofessional next to the code. The real campaign name is
// looked up from the short_links table here. If that table doesn't exist yet (not set
// up in Supabase) or the code isn't found there, the code itself is used as the
// campaign name instead — matching how these links worked before this change, so nothing
// breaks for links already created and shared under the old scheme.
async function lookupCampaign(code){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!url || !key) return null
  try{
    const target=new URL(`${url}/rest/v1/short_links`)
    target.searchParams.set('code',`eq.${code}`)
    target.searchParams.set('select','campaign')
    const r=await fetch(target,{headers:{apikey:key,Authorization:`Bearer ${key}`},cache:'no-store'})
    if(!r.ok) return null
    const rows=await r.json()
    return rows[0]?.campaign||null
  }catch{
    return null
  }
}

export async function GET(request,{params}){
  const {slug:code}=await params
  const campaign=(await lookupCampaign(code))||code||'untitled'
  const dest=new URL('/',request.url)
  dest.searchParams.set('utm_source','shared_link')
  dest.searchParams.set('utm_medium','referral')
  dest.searchParams.set('utm_campaign',campaign)
  return NextResponse.redirect(dest)
}
