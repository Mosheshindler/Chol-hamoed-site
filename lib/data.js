import {demoVideos} from './demoVideos'

function formatDuration(seconds){
  if(!Number.isFinite(seconds) || seconds <= 0) return ''
  const m=Math.floor(seconds/60)
  const s=seconds%60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

function parseVideoId(url, platform){
  try{
    const u=new URL(url)
    if(platform==='vimeo') return u.pathname.split('/').filter(Boolean)[0] || ''
    if(u.hostname.includes('youtu.be')) return u.pathname.split('/').filter(Boolean)[0] || ''
    return u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop() || ''
  }catch{return ''}
}

// Videos added before the thumbnail-size fix have small, blurry-when-stretched URLs baked
// in (Vimeo's oEmbed defaults to a ~295px-wide thumbnail with no width param; YouTube's
// hqdefault.jpg is only 480x360). Upgrading the size in the URL itself at read-time fixes
// every existing video without needing to re-save each one — new videos already get a
// properly-sized URL from /api/video-meta, so this is a no-op for them.
export function sharpenThumbnail(url){
  if(!url) return url
  try{
    const u=new URL(url)
    // Vimeo's CDN reliably renders any requested size on demand, so upgrading this at read
    // time is safe. YouTube is NOT: sddefault/maxresdefault only exist for videos whose
    // source resolution actually supports them, and when they don't, YouTube silently
    // serves a tiny ~1KB gray placeholder instead of an error — which is exactly what made
    // a couple of videos' thumbnails stop "pulling" after this used to blindly upgrade
    // hqdefault.jpg to sddefault.jpg here. The best available YouTube size is now picked
    // once, verified, when the video is added/edited (see /api/video-meta) and stored
    // directly, so no unverified guess is needed on every read.
    if(u.hostname==='i.vimeocdn.com') return url.replace(/-d_\d+x\d+/,'-d_1280x720')
    return url
  }catch{
    return url
  }
}

function mapRow(row){
  return {
    id:row.id,
    slug:row.slug,
    title:row.title,
    category:row.category || row.categories?.[0] || 'Video',
    categories:Array.isArray(row.categories)&&row.categories.length?row.categories:(row.category?[row.category]:[]),
    tags:Array.isArray(row.tags)?row.tags:[],
    duration:formatDuration(row.duration_seconds),
    durationSeconds:row.duration_seconds || 0,
    provider:row.platform,
    videoId:parseVideoId(row.video_url,row.platform),
    vimeoHash:row.vimeo_hash || '',
    thumbnail:sharpenThumbnail(row.thumbnail_url) || '/assets/thumb-united.jpg',
    heroImage:row.hero_image_url || '',
    featured:Boolean(row.featured),
    featuredHome:Boolean(row.featured_home),
    showJustMinted:row.show_just_minted!==false,
    showJustMintedHome:row.show_just_minted_home!==false,
    premium:Boolean(row.premium),
    purchaseUrl:row.purchase_url || '',
    published:Boolean(row.published),
    sortOrder:row.sort_order || 0,
    fromDatabase:true
  }
}

export async function getDatabaseVideos(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!url || !key) return []
  try{
    const res=await fetch(`${url}/rest/v1/videos?select=*&published=eq.true&order=sort_order.asc,created_at.desc`,{
      headers:{apikey:key,Authorization:`Bearer ${key}`},
      cache:'no-store'
    })
    if(!res.ok){
      console.error('Supabase videos request failed',res.status,await res.text())
      return []
    }
    const rows=await res.json()
    return rows.map(mapRow)
  }catch(err){
    console.error('Supabase videos request error',err)
    return []
  }
}

// Demo/placeholder videos (generic stock thumbnails, shared sample video IDs) were only
// ever meant as filler before real videos existed. The library now has real content, so
// they're off by default everywhere — pass {includeDemo:true} explicitly to bring them back.
export async function getVideos({includeDemo=false}={}){
  const db=await getDatabaseVideos()
  if(!includeDemo) return db
  const slugs=new Set(db.map(v=>v.slug))
  return [...db,...demoVideos.filter(v=>!slugs.has(v.slug))]
}

export async function getVideoBySlug(slug){
  const videos=await getVideos()
  return videos.find(v=>v.slug===slug)
}

// Per-category ordering (independent from the shared videos.sort_order used for All Videos
// and the homepage). Returns a plain {video_id: position} object — not a Map, since this
// crosses the server/client component boundary and Maps aren't serializable there — so the
// category page can sort by it; videos with no entry yet just fall back to their existing
// relative order.
export async function getCategoryOrder(categorySlug){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!url || !key || !categorySlug) return {}
  try{
    const res=await fetch(`${url}/rest/v1/video_category_order?select=video_id,sort_order&category=eq.${encodeURIComponent(categorySlug)}`,{
      headers:{apikey:key,Authorization:`Bearer ${key}`},
      cache:'no-store'
    })
    if(!res.ok) return {}
    const rows=await res.json()
    return Object.fromEntries(rows.map(r=>[r.video_id,r.sort_order]))
  }catch{
    return {}
  }
}

const FALLBACK_SEARCHES=['Funny','Inspirational','Music Video','Under 5 min','Long form','Behind the scenes','Kids','Motivational']

// "Popular searches" pulled from real tag usage instead of a fixed list — counts how many
// published videos carry each tag (case-insensitively, keeping the most common casing as
// the display label) and returns the most-used ones. Pads with a few evergreen fallback
// terms when there aren't enough real tags yet, so the row never looks sparse or empty.
export function getPopularTags(videos,limit=10){
  const counts=new Map()
  for(const v of videos){
    for(const tag of (v.tags||[])){
      const t=String(tag).trim()
      if(!t) continue
      const key=t.toLowerCase()
      const entry=counts.get(key)
      if(entry) entry.count++
      else counts.set(key,{label:t,count:1})
    }
  }
  const ranked=[...counts.values()].sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label)).map(e=>e.label)
  const seen=new Set(ranked.map(t=>t.toLowerCase()))
  for(const fallback of FALLBACK_SEARCHES){
    if(ranked.length>=limit) break
    if(!seen.has(fallback.toLowerCase())){ ranked.push(fallback); seen.add(fallback.toLowerCase()) }
  }
  return ranked.slice(0,limit)
}
