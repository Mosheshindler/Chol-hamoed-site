import Header from '../components/Header'
import Footer from '../components/Footer'
import SignupCTA from '../components/SignupCTA'
import VideoCard from '../components/VideoCard'
import HomeSearch from '../components/HomeSearch'
import HeroCarousel from '../components/HeroCarousel'
import CategoryStrip from '../components/CategoryStrip'
import Link from 'next/link'
import {getVideos,getPopularTags,getCategoryOrder} from '../lib/data'
import {categories} from '../lib/demoVideos'

export default async function Home(){
  const [videos,homeOrder]=await Promise.all([getVideos(),getCategoryOrder('home-just-minted')])
  const searches=getPopularTags(videos,20)
  const heroVideos=videos.filter(v=>v.featured).slice(0,8)
  // Admin can reorder this row (independent of the site-wide All Videos order) from the
  // "Homepage (Just Minted)" group in /admin — see getCategoryOrder.
  const hasHomeOrder=homeOrder && Object.keys(homeOrder).length>0
  const featuredHomeRaw=videos.filter(v=>v.featuredHome)
  const featuredHome=hasHomeOrder ? [...featuredHomeRaw].sort((a,b)=>{
    const ao=a.id in homeOrder?homeOrder[a.id]:Infinity
    const bo=b.id in homeOrder?homeOrder[b.id]:Infinity
    return ao-bo
  }) : featuredHomeRaw
  const homeFillers=videos.filter(v=>!v.featuredHome).slice(0,Math.max(0,5-featuredHome.length))
  const homeVideos=[...featuredHome,...homeFillers].slice(0,5)
  return <><Header/><main>
    <HeroCarousel videos={heroVideos}/>
    <div className="wide homeBody">
      <HomeSearch popular={searches}/>
      <div className="sectionHead"><h2>BROWSE BY CATEGORY</h2></div>
      <CategoryStrip categories={categories}/>
      <div className="sectionHead justHead"><h2>FEATURED VIDEOS</h2><a href="/category/all-videos">View all&nbsp; →</a></div>
      <div className="cards homeCards">{homeVideos.map((v,i)=><VideoCard video={v} priority={i<2} key={v.slug}/>)}</div>
      <SignupCTA/>
    </div>
   </main><Footer/></>}
