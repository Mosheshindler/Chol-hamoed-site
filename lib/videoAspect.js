// Auto-detects a video's real aspect ratio (so vertical/portrait uploads — Shorts, Reels-style
// videos — get a matching player instead of being forced into a 16:9 box) using each
// provider's public oEmbed endpoint, which always reports width/height. Cached for a day
// since a given video's aspect ratio never changes; falls back to standard 16:9 on any error.
const FALLBACK = {width: 16, height: 9}

export async function getVideoAspect(video){
  try{
    if(video.provider === 'vimeo' && video.videoId){
      const target = new URL(`https://vimeo.com/${video.videoId}${video.vimeoHash ? '/' + video.vimeoHash : ''}`)
      const oembed = new URL('https://vimeo.com/api/oembed.json')
      oembed.searchParams.set('url', target.toString())
      const r = await fetch(oembed, {next: {revalidate: 86400}})
      if(!r.ok) return FALLBACK
      const data = await r.json()
      if(data.width && data.height) return {width: data.width, height: data.height}
      return FALLBACK
    }
    if(video.provider === 'youtube' && video.videoId){
      const oembed = new URL('https://www.youtube.com/oembed')
      oembed.searchParams.set('url', `https://www.youtube.com/watch?v=${video.videoId}`)
      oembed.searchParams.set('format', 'json')
      const r = await fetch(oembed, {next: {revalidate: 86400}})
      if(!r.ok) return FALLBACK
      const data = await r.json()
      if(data.width && data.height) return {width: data.width, height: data.height}
      return FALLBACK
    }
    return FALLBACK
  }catch{
    return FALLBACK
  }
}
