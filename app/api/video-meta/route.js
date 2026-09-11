import { NextResponse } from 'next/server'

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
        durationSeconds:Number(data.duration)||null
      })
    }

    const target=new URL('https://www.youtube.com/oembed')
    target.searchParams.set('url',`https://www.youtube.com/watch?v=${info.id}`)
    target.searchParams.set('format','json')
    const r=await fetch(target,{cache:'no-store'})
    let title=''
    if(r.ok){ const data=await r.json(); title=data.title||'' }
    return NextResponse.json({
      platform:'youtube',
      videoId:info.id,
      vimeoHash:'',
      title,
      thumbnailUrl:`https://i.ytimg.com/vi/${info.id}/sddefault.jpg`,
      durationSeconds:null
    })
  }catch(error){
    return NextResponse.json({error:error.message||'Could not read video details.'},{status:400})
  }
}
