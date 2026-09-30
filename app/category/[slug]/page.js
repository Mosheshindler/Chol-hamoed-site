import {Suspense} from 'react'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import SignupCTA from '../../../components/SignupCTA'
import CategoryBrowser from '../../../components/CategoryBrowser'
import {getVideos,getCategoryOrder} from '../../../lib/data'
import {CATEGORIES,categorySlug,CATEGORY_DESCRIPTIONS,SITE_URL,SITE_IMAGE,SITE_IMAGE_DIMENSIONS} from '../../../lib/site'

// Same fix as the watch pages: without this, every category page (Stories, Documentaries,
// All Videos, …) rendered fresh on the server per visit with zero caching. Listing every
// category slug up front lets these serve statically and regenerate every 30s instead.
export async function generateStaticParams(){
  return [...CATEGORIES.map(c=>({slug:categorySlug(c)})),{slug:'all-videos'}]
}

export async function generateMetadata({params}){
  const {slug:resolvedSlug}=await params
  const slug=resolvedSlug||'stories'
  const url=`${SITE_URL}/category/${slug}`
  if(slug==='all-videos'){
    const title='All Videos'
    const description='Browse the complete Mint Media video library — stories, documentaries, entertainment, music videos, and more.'
    return {
      title,
      description,
      alternates:{canonical:url},
      openGraph:{title,description,url,images:[{url:SITE_IMAGE,...SITE_IMAGE_DIMENSIONS}]},
      twitter:{card:'summary_large_image',title,description,images:[SITE_IMAGE]}
    }
  }
  const match=CATEGORIES.find(c=>categorySlug(c)===slug)
  const name=match||slug.split('-').map(x=>x[0]?.toUpperCase()+x.slice(1)).join(' ').replace('And','&')
  const description=match?CATEGORY_DESCRIPTIONS[match]:`Watch ${name} videos from Mint Media on Entertain-Mint.`
  return {
    title:name,
    description,
    alternates:{canonical:url},
    openGraph:{title:name,description,url,images:[{url:SITE_IMAGE,...SITE_IMAGE_DIMENSIONS}]},
    twitter:{card:'summary_large_image',title:name,description,images:[SITE_IMAGE]}
  }
}

export default async function CategoryPage({params}){
  const {slug:resolvedSlug}=await params
  const slug=resolvedSlug||'stories'
  const name=slug.split('-').map(x=>x[0]?.toUpperCase()+x.slice(1)).join(' ').replace('And','&')
  const [videos,categoryOrder]=await Promise.all([getVideos(),slug==='all-videos'?Promise.resolve({}):getCategoryOrder(slug)])
  return <><Header/><main className="container"><Suspense fallback={null}><CategoryBrowser slug={slug} name={name} videos={videos} categoryOrder={categoryOrder}/></Suspense><SignupCTA/></main><Footer/></>
}
