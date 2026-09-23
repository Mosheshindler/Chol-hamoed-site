import { NextResponse } from 'next/server'

// TinyURL's create-alias-free endpoint needs no account or API key — a plain GET that
// returns the short link as plain text. Called server-side so the browser never has to
// make a cross-origin request TinyURL doesn't allow, and the UTM params stay intact
// since TinyURL just redirects straight through to the full destination URL.
export async function POST(request){
  try{
    const {url}=await request.json()
    if(!url) return NextResponse.json({error:'A URL is required.'},{status:400})
    const target=new URL('https://tinyurl.com/api-create.php')
    target.searchParams.set('url',url)
    const r=await fetch(target,{cache:'no-store'})
    if(!r.ok) return NextResponse.json({error:'Could not shorten that link.'},{status:502})
    const shortUrl=(await r.text()).trim()
    if(!shortUrl.startsWith('http')) return NextResponse.json({error:'Could not shorten that link.'},{status:502})
    return NextResponse.json({shortUrl})
  }catch(error){
    return NextResponse.json({error:error.message||'Could not shorten that link.'},{status:400})
  }
}
