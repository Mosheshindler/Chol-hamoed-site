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

export default async function Home(){
  const [videos,homeOrder,heroOrder]=await Promise.all([getVideos(),getCategoryOrder('home-just-minted'),getCategoryOrder('hero-carousel')])
  const searches=getPopularTags(videos,20)
  // Admin can reorder this row (independent of the site-wide All Videos order) from the
  // "Hero Carousel" group in /admin — see getCategoryOrder.
  // Newest-upload-first is the default order; anything given an explicit manual position
  // (dragged in the admin's Hero Carousel/Homepage groups) wins over that — the manual sort
  // below runs on the already publish-date-sorted list, so videos with no manual position
  // just keep falling in newest-first among themselves (stable sort).
  const heroFeatured=sortByPublishDate(videos.filter(v=>v.featured))
  const heroVideos=[...heroFeatured].sort((a,b)=>{
    const ao=a.id in heroOrder?heroOrder[a.id]:Infinity
    const bo=b.id in heroOrder?heroOrder[b.id]:Infinity
    return ao-bo
  }).slice(0,8)
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
