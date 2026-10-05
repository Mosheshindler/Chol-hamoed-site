import {NextResponse} from 'next/server'
import {revalidatePath} from 'next/cache'

// Only the admin's own logged-in session should be able to trigger this — otherwise it's a
// free way for anyone to burn through Vercel's ISR Writes quota by spamming this endpoint
// (the exact problem this exists to prevent). Reuses the admin's existing Supabase session
// token rather than a separate secret, since the admin panel already holds one.
async function isAuthorized(request){
  const token=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'')
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!token || !url || !key) return false
  try{
    const r=await fetch(`${url}/auth/v1/user`,{headers:{apikey:key,Authorization:`Bearer ${token}`}})
    return r.ok
  }catch{
    return false
  }
}

// Video/category pages are statically cached (see app/watch/[slug] and app/category/[slug])
// so they don't re-render on every single visit — but that means a save in /admin no longer
// shows up on its own. Rather than falling back to a short timed refresh (which is what
// drove Vercel's "ISR Writes" quota toward its limit: every cached page re-generating on a
// timer, multiplied by however many are visited, regardless of whether anything changed),
// the admin panel calls this right after a save so pages refresh only when content actually
// changes. Revalidating the root layout covers every page in one call rather than needing to
// know exactly which category/watch pages a given save affects.
export async function POST(request){
  if(!await isAuthorized(request)) return NextResponse.json({error:'Unauthorized'},{status:401})
  try{
    revalidatePath('/','layout')
    return NextResponse.json({revalidated:true})
  }catch(err){
    return NextResponse.json({error:err.message||'Could not refresh pages.'},{status:500})
  }
}
