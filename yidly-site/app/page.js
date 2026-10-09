import Link from 'next/link'
import VideoCard from '../components/VideoCard'
import JoinClub from '../components/JoinClub'
import ContactForm from '../components/ContactForm'
import {VIDEOS,GADGET_GUY} from '../lib/videos'

export default function Home(){
  return (
    <>
      <section className="hero" aria-label="The Gadget Guy — now available">
        <Link href="/gadget-guy" className="heroArt">
          <picture>
            <source media="(max-width: 700px)" srcSet="/images/gadget-guy/poster.jpg"/>
            <img src="/images/gadget-guy/banner.jpg" alt="The Gadget Guy — Yidly & Ziv Studios present, written by Meir Ben-Dayan. Watch now on Mostly Music." fetchPriority="high"/>
          </picture>
        </Link>
        <div className="wrap heroBar">
          <p><span className="pill">New Release</span> Drones, traps and heart-pounding chases. Ages {GADGET_GUY.ages}.</p>
          <div className="heroActions">
            <a href={GADGET_GUY.url} target="_blank" rel="noopener noreferrer" className="btn btnYellow">Watch on Mostly Music</a>
            <Link href="/gadget-guy" className="btn btnOutline">Explore The Gadget Guy</Link>
          </div>
        </div>
      </section>

      <section className="intro wrap">
        <h1>Bring the fun home</h1>
        <p>Wholesome gameshows, adventures and music for the whole family, from the team at Mint Media.</p>
      </section>

      <section className="videos wrap" id="videos">
        <div className="sectionHead">
          <h2>Yidly Videos</h2>
          <p>Every Yidly video is available on Mostly Music.</p>
        </div>
        <div className="grid">
          {VIDEOS.map((v)=><VideoCard key={v.slug} video={v}/>)}
        </div>
      </section>

      <JoinClub/>

      <section className="contact wrap" id="contact">
        <div className="sectionHead">
          <h2>Got questions?</h2>
          <p>Send us a message and we&apos;ll get back to you.</p>
        </div>
        <ContactForm/>
      </section>
    </>
  )
}
