import { NextResponse } from 'next/server'

// Parses ISO 8601 durations ("PT3M59S", "PT1H2M3S") into whole seconds.
function parseIsoDuration(iso){
  const m=/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso||'')
  if(!m) return null
  const [,h,min,s]=m
  const total=(Number(h)||0)*3600+(Number(min)||0)*60+(Number(s)||0)
  return total>0?total:null
}

// Optional — YouTube's oEmbed endpoint (used for title/thumbnail) doesn't include
// duration or the real upload date, unlike Vimeo's. When a YOUTUBE_API_KEY is configured,
// this fills that gap via the official YouTube Data API v3. Never exposed to the browser.
async function fetchYouTubeDetails(videoId){
  const key=process.env.YOUTUBE_API_KEY
  if(!key) return {durationSeconds:null,publishedAt:null}
  try{
    const target=new URL('https://www.googleapis.com/youtube/v3/videos')
    target.searchParams.set('id',videoId)
    target.searchParams.set('part','contentDetails,snippet')
    target.searchParams.set('key',key)
    const r=await fetch(target,{cache:'no-store'})
    if(!r.ok) return {durationSeconds:null,publishedAt:null}
    const data=await r.json()
    const item=data.items?.[0]
    return {
      durationSeconds:parseIsoDuration(item?.contentDetails?.duration),
      publishedAt:item?.snippet?.publishedAt||null
    }
  }catch{
    return {durationSeconds:null,publishedAt:null}
  }
}

// YouTube always generates a small hqdefault.jpg (480x360), but the sharper sddefault.jpg
// (640x480) and maxresdefault.jpg (1280x720) only exist for videos whose source resolution
// supports them. When a size doesn't exist, YouTube doesn't error — it silently serves a
// tiny ~1KB gray placeholder instead, which looks like a broken/missing thumbnail on the
// site. So the sharpest real size is picked here (once, when the video is added/edited) by
// actually checking it's a real image rather than that placeholder, instead of guessing.
const YT_PLACEHOLDER_MAX_BYTES=2000
async function pickYouTubeThumbnail(videoId){
  for(const size of ['maxresdefault','sddefault']){
    try{
      const r=await fetch(`https://i.ytimg.com/vi/${videoId}/${size}.jpg`,{cache:'no-store'})
      if(r.ok){
        const buf=await r.arrayBuffer()
        if(buf.byteLength>YT_PLACEHOLDER_MAX_BYTES) return `https://i.ytimg.com/vi/${videoId}/${size}.jpg`
      }
    }catch{}
  }
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` // always available, real image
}

function identify(raw){
  const u=new URL(raw)
  const host=u.hostname.replace(/^www\./,'')
  if(host==='vimeo.com' || host.endsWith('.vimeo.com')){
    const parts=u.pathname.split('/').filter(Boolean)
    const id=parts.find(p=>/^\d+$/.test(p)) || ''
    const idx=parts.indexOf(id)
    const hash=idx>=0 && parts[idx+1] && !/^\d+$/.test(parts[idx+1]) ? parts[idx+1] : ''
    return {platform:'vimeo',id,hash}
  }
  if(host==='youtu.be') return {platform:'youtube',id:u.pathname.split('/').filter(Boolean)[0]||'',hash:''}
  if(host.includes('youtube.com')){
    let id=u.searchParams.get('v')||''
    if(!id){
      const parts=u.pathname.split('/').filter(Boolean)
      const marker=parts.findIndex(x=>['shorts','embed','live'].includes(x))
      id=marker>=0 ? parts[marker+1]||'' : parts.at(-1)||''
    }
    return {platform:'youtube',id,hash:''}
  }
  throw new Error('Please paste a Vimeo or YouTube URL.')
}

export async function POST(request){
  try{
    const {url}=await request.json()
    if(!url) return NextResponse.json({error:'Video URL is required.'},{status:400})
    const info=identify(url)
    if(!info.id) return NextResponse.json({error:'Could not find the video ID in that URL.'},{status:400})

    if(info.platform==='vimeo'){
      const target=new URL('https://vimeo.com/api/oembed.json')
      target.searchParams.set('url',url)
      // Without a width, Vimeo's oEmbed defaults to a tiny ~295px-wide thumbnail that looks
      // blurry once it's stretched to fill a normal-sized video card. Ask for a proper size.
      target.searchParams.set('width','1280')
      const r=await fetch(target,{cache:'no-store'})
      if(!r.ok) return NextResponse.json({error:'Vimeo could not return details for this video.'},{status:400})
      const data=await r.json()
      return NextResponse.json({
        platform:'vimeo',
        videoId:info.id,
        vimeoHash:info.hash,
        title:data.title||'',
        thumbnailUrl:data.thumbnail_url||'',
        durationSeconds:Number(data.duration)||null,
        // Vimeo's oEmbed response includes the real upload date as "YYYY-MM-DD" — good
        // enough for date-only sorting (no time-of-day precision, but that's fine here).
        sourcePublishedAt:data.upload_date||null
      })
    }

    const target=new URL('https://www.youtube.com/oembed')
    target.searchParams.set('url',`https://www.youtube.com/watch?v=${info.id}`)
    target.searchParams.set('format','json')
    const r=await fetch(target,{cache:'no-store'})
    let title=''
    if(r.ok){ const data=await r.json(); title=data.title||'' }
    const [details,thumbnailUrl]=await Promise.all([fetchYouTubeDetails(info.id),pickYouTubeThumbnail(info.id)])
    return NextResponse.json({
      platform:'youtube',
      videoId:info.id,
      vimeoHash:'',
      title,
      thumbnailUrl,
      durationSeconds:details.durationSeconds,
      sourcePublishedAt:details.publishedAt
    })
  }catch(error){
    return NextResponse.json({error:error.message||'Could not read video details.'},{status:400})
  }
}
