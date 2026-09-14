import {NextResponse} from 'next/server'
import {getVideos} from '../../../lib/data'

// Short-link redirect (e.g. yoursite.com/v/3f2a1c4e), mirroring what youtu.be does for
// YouTube — the "Use short link" option in the Share popover points here. The code is
// just the first 8 characters of the video's id with the dashes stripped out, so this
// looks it up by matching that prefix rather than needing a separate short-code column.
export async function GET(request,{params}){
  const {code}=await params
  const clean=(code||'').toLowerCase()
  const videos=await getVideos()
  const match=videos.find(v=>v.id && v.id.replace(/-/g,'').toLowerCase().startsWith(clean))
  const dest=match?`/watch/${match.slug}`:'/'
  return NextResponse.redirect(new URL(dest,request.url))
}
