import Header from '../components/Header'
import Footer from '../components/Footer'
import SignupCTA from '../components/SignupCTA'
import VideoCard from '../components/VideoCard'
import HomeSearch from '../components/HomeSearch'
import HeroCarousel from '../components/HeroCarousel'
import CategoryStrip from '../components/CategoryStrip'
import Link from 'next/link'
import {getVideos,getSiteSettings} from '../lib/data'
import {categories} from '../lib/demoVideos'

const searches=['Funny','Inspirational','Lessons','Music Video','Under 5 min','Long form','Behind the scenes','Kids','Motivational','Family']

export default async function Home(){
  const [videos,settings]=await Promise.all([getVideos(),getSiteSettings()])
  const featuredVideos=videos.filter(v=>v.featured)
  const fillers=videos.filter(v=>!v.featured).slice(0,Math.max(0,5-featuredVideos.length))
  const heroVideos=[...featuredVideos,...fillers].slice(0,5)
  return <><Header/><main>
    <HeroCarousel videos={heroVideos} showJustMinted={settings.showJustMinted}/>
    <div className="wide homeBody">
      <HomeSearch popular={searches}/>
      <div className="sectionHead"><h2>BROWSE BY CATEGORY</h2></div>
      <CategoryStrip categories={categories}/>
      <div className="sectionHead justHead"><h2>{settings.showJustMinted?'JUST MINTED':''}</h2><a href="/category/all-videos">View all&nbsp; →</a></div>
      <div className="cards homeCards">{videos.slice(0,5).map(v=><VideoCard video={v} key={v.slug}/>)}</div>
      <SignupCTA/>
    </div>
   </main><Footer/></>}
