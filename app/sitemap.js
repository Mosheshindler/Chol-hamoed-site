import {getVideos} from '../lib/data'
import {CATEGORIES,categorySlug,SITE_URL} from '../lib/site'

// Next.js's file-convention sitemap — this alone serves /sitemap.xml, no extra wiring
// needed. Pulls every published video's slug from Supabase, so new videos get crawled
// without anyone remembering to update anything by hand.
export default async function sitemap(){
  const videos=await getVideos()
  const staticPages=[
    {url:`${SITE_URL}/`,changeFrequency:'daily',priority:1},
    {url:`${SITE_URL}/category/all-videos`,changeFrequency:'daily',priority:0.9},
    ...CATEGORIES.map(c=>({url:`${SITE_URL}/category/${categorySlug(c)}`,changeFrequency:'daily',priority:0.8})),
    {url:`${SITE_URL}/collections`,changeFrequency:'weekly',priority:0.6},
    {url:`${SITE_URL}/about`,changeFrequency:'monthly',priority:0.5},
    {url:`${SITE_URL}/contact`,changeFrequency:'monthly',priority:0.5},
    {url:`${SITE_URL}/privacy`,changeFrequency:'yearly',priority:0.2}
  ]
  const videoPages=videos.map(v=>({
    url:`${SITE_URL}/watch/${v.slug}`,
    lastModified:v.sourcePublishedAt||v.createdAt||undefined,
    changeFrequency:'monthly',
    priority:0.7
  }))
  return [...staticPages,...videoPages]
}
