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

function mapRow(row){
  return {
    id:row.id,
    slug:row.slug,
    title:row.title,
    client:row.client || 'Mint Media',
    category:row.category || row.categories?.[0] || 'Video',
    categories:Array.isArray(row.categories)&&row.categories.length?row.categories:(row.category?[row.category]:[]),
    tags:Array.isArray(row.tags)?row.tags:[],
    duration:formatDuration(row.duration_seconds),
    durationSeconds:row.duration_seconds || 0,
    provider:row.platform,
    videoId:parseVideoId(row.video_url,row.platform),
    vimeoHash:row.vimeo_hash || '',
    thumbnail:row.thumbnail_url || '/assets/thumb-united.jpg',
    heroImage:row.hero_image_url || '',
    featured:Boolean(row.featured),
    featuredHome:Boolean(row.featured_home),
    showJustMinted:row.show_just_minted!==false,
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

export async function getVideos({includeDemo=true}={}){
  const db=await getDatabaseVideos()
  if(!includeDemo) return db
  const slugs=new Set(db.map(v=>v.slug))
  return [...db,...demoVideos.filter(v=>!slugs.has(v.slug))]
}

export async function getVideoBySlug(slug){
  const videos=await getVideos()
  return videos.find(v=>v.slug===slug)
}
