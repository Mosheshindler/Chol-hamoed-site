import Header from '../components/Header'
import Footer from '../components/Footer'
import SignupCTA from '../components/SignupCTA'
import VideoCard from '../components/VideoCard'
import HomeSearch from '../components/HomeSearch'
import HeroCarousel from '../components/HeroCarousel'
import CategoryStrip from '../components/CategoryStrip'
import Link from 'next/link'
import {getVideos} from '../lib/data'
import {categories} from '../lib/demoVideos'

const searches=['Funny','Inspirational','Lessons','Music Video','Under 5 min','Long form','Behind the scenes','Kids','Motivational','Family']

export default async function Home(){
  const videos=await getVideos()
  const featuredVideos=videos.filter(v=>v.featured)
  const heroFillers=videos.filter(v=>!v.featured).slice(0,Math.max(0,8-featuredVideos.length))
  const heroVideos=[...featuredVideos,...heroFillers].slice(0,8)
  const featuredHome=videos.filter(v=>v.featuredHome)
  const homeFillers=videos.filter(v=>!v.featuredHome).slice(0,Math.max(0,5-featuredHome.length))
  const homeVideos=[...featuredHome,...homeFillers].slice(0,5)
  return <><Header/><main>
    <HeroCarousel videos={heroVideos}/>
    <div className="wide homeBody">
      <HomeSearch popular={searches}/>
      <div className="sectionHead"><h2>BROWSE BY CATEGORY</h2></div>
      <CategoryStrip categories={categories}/>
      <div className="sectionHead justHead"><h2>JUST MINTED</h2><a href="/category/all-videos">View all&nbsp; →</a></div>
      <div className="cards homeCards">{homeVideos.map(v=><VideoCard video={v} justMinted={v.featuredHome&&v.showJustMintedHome!==false} key={v.slug}/>)}</div>
      <SignupCTA/>
    </div>
   </main><Footer/></>}
