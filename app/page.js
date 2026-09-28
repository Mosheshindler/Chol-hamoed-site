import Header from '../components/Header'
import Footer from '../components/Footer'
import SignupCTA from '../components/SignupCTA'
import VideoCard from '../components/VideoCard'
import HomeSearch from '../components/HomeSearch'
import HeroCarousel from '../components/HeroCarousel'
import CategoryStrip from '../components/CategoryStrip'
import Link from 'next/link'
import {getVideos,getPopularTags,getCategoryOrder,sortByPublishDate} from '../lib/data'
import {categories} from '../lib/demoVideos'
import {SITE_URL} from '../lib/site'

const TITLE='Entertain-Mint - Watch Stories, Documentaries & More'
const DESCRIPTION="Entertain-Mint is Mint Media's home for stories, documentaries, entertainment, music videos and more — new videos added regularly."

// Shared by generateMetadata and the page body, so the homepage's link-preview image always
// matches whatever's actually the #1 Hero Carousel slide, not a separate/stale selection.
// Admin can reorder this row (independent of the site-wide All Videos order) from the
// "Hero Carousel" group in /admin — see getCategoryOrder.
// Newest-upload-first is the default order; anything given an explicit manual position
// (dragged in the admin's Hero Carousel/Homepage groups) wins over that — the manual sort
// below runs on the already publish-date-sorted list, so videos with no manual position
// just keep falling in newest-first among themselves (stable sort).
function getHeroVideos(videos,heroOrder){
  const heroFeatured=sortByPublishDate(videos.filter(v=>v.featured))
  return [...heroFeatured].sort((a,b)=>{
    const ao=a.id in heroOrder?heroOrder[a.id]:Infinity
    const bo=b.id in heroOrder?heroOrder[b.id]:Infinity
    return ao-bo
  }).slice(0,8)
}

// A real screenshot of the homepage (nav, hero, search, categories) rather than a designed
// graphic — matches what a visitor actually sees. It's a snapshot as of when it was taken,
// not auto-generated, so re-capture it (ask Claude, or retake and drop the file in) if the
// homepage's look changes enough that this goes noticeably stale.
const HOME_IMAGE='/assets/homepage-og.png'
export const metadata={
  title:TITLE,
  description:DESCRIPTION,
  alternates:{canonical:SITE_URL},
  openGraph:{title:TITLE,description:DESCRIPTION,url:SITE_URL,images:[{url:HOME_IMAGE,width:2400,height:1260}]},
  twitter:{card:'summary_large_image',title:TITLE,description:DESCRIPTION,images:[HOME_IMAGE]}
}

export default async function Home(){
  const [videos,homeOrder,heroOrder]=await Promise.all([getVideos(),getCategoryOrder('home-just-minted'),getCategoryOrder('hero-carousel')])
  const searches=getPopularTags(videos,20)
  const heroVideos=getHeroVideos(videos,heroOrder)
  const featuredHome=[...sortByPublishDate(videos.filter(v=>v.featuredHome))].sort((a,b)=>{
    const ao=a.id in homeOrder?homeOrder[a.id]:Infinity
    const bo=b.id in homeOrder?homeOrder[b.id]:Infinity
    return ao-bo
  })
  // Only videos explicitly checked "Featured on Homepage" show here — no automatic
  // fallback padding with other videos, same as the Hero Carousel already only ever shows
  // what's checked "Featured in Hero Carousel".
  const homeVideos=featuredHome.slice(0,5)
  return <><Header/><main>
    <HeroCarousel videos={heroVideos}/>
    <div className="wide homeBody">
      <HomeSearch popular={searches}/>
      <div className="sectionHead"><h2>BROWSE BY CATEGORY</h2></div>
      <CategoryStrip categories={categories}/>
      {homeVideos.length>0&&<><div className="sectionHead justHead"><h2>FEATURED VIDEOS</h2><a href="/category/all-videos">View all&nbsp; →</a></div>
      <div className="cards homeCards">{homeVideos.map((v,i)=><VideoCard video={v} priority={i<2} key={v.slug}/>)}</div></>}
      <SignupCTA/>
    </div>
   </main><Footer/></>}
