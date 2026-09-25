// ISO 8601 duration ("PT4M32S"), the format schema.org/Google requires for VideoObject.duration.
export function toIso8601Duration(seconds){
  if(!Number.isFinite(seconds) || seconds<=0) return undefined
  const h=Math.floor(seconds/3600)
  const m=Math.floor((seconds%3600)/60)
  const s=Math.floor(seconds%60)
  return `PT${h?`${h}H`:''}${m?`${m}M`:''}${s||(!h&&!m)?`${s}S`:''}`
}

// The platform's own player URL — schema.org VideoObject uses this as embedUrl, since the
// underlying video file itself (contentUrl) isn't something we can point to for a
// YouTube/Vimeo-hosted video.
export function videoEmbedUrl(video){
  if(video.provider==='vimeo'){
    const hash=video.vimeoHash?`?h=${encodeURIComponent(video.vimeoHash)}`:''
    return `https://player.vimeo.com/video/${video.videoId}${hash}`
  }
  return `https://www.youtube-nocookie.com/embed/${video.videoId}`
}

// The videos table has no description column yet, so this generates a reasonable one from
// data that already exists — good enough for search snippets and schema.org compliance
// until/unless a real per-video description field gets added in admin.
export function videoDescription(video){
  const cat=video.categories?.[0] || video.category || 'video'
  return `Watch "${video.title}" — a ${cat} video from Mint Media on Entertain-Mint.`
}

function absoluteUrl(url,siteUrl){
  if(!url) return url
  return /^https?:\/\//.test(url) ? url : `${siteUrl}${url}`
}

// schema.org VideoObject JSON-LD — the single biggest lever for a video site to show up in
// Google's video search results/carousel. Kept to fields we can reliably fill: fields we
// have no real data for (contentUrl, interactionStatistic) are left out rather than faked.
export function buildVideoJsonLd(video,siteUrl){
  const uploadDate=video.sourcePublishedAt || video.createdAt
  const json={
    '@context':'https://schema.org',
    '@type':'VideoObject',
    name:video.title,
    description:videoDescription(video),
    thumbnailUrl:[absoluteUrl(video.thumbnail,siteUrl)],
    embedUrl:videoEmbedUrl(video),
    url:`${siteUrl}/watch/${video.slug}`
  }
  if(uploadDate) json.uploadDate=new Date(uploadDate).toISOString()
  const duration=toIso8601Duration(video.durationSeconds)
  if(duration) json.duration=duration
  return json
}
