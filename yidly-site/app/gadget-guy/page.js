import Image from 'next/image'
import JoinClub from '../../components/JoinClub'
import {GADGET_GUY as G} from '../../lib/videos'

export const metadata={
  title:'The Gadget Guy',
  description:G.synopsis[0],
  openGraph:{title:'The Gadget Guy',description:G.synopsis[0],images:[{url:'/images/gadget-guy/banner.jpg',width:2000,height:553}]},
}

export default function GadgetGuy(){
  return (
    <div className="gg">
      <section className="ggHero">
        <div className="wrap ggHeroInner">
          <div className="ggHeroText">
            <p className="ggKicker">{G.presentedBy} present</p>
            <h1><Image src="/images/gadget-guy/logo.png" alt="The Gadget Guy" width={1000} height={393} priority sizes="(max-width:900px) 90vw, 560px"/></h1>
            <p className="ggLead">{G.synopsis[0]}</p>
            <ul className="ggFacts">
              <li><b>{G.runTime}</b><span>Run time</span></li>
              <li><b>{G.ages}</b><span>Recommended ages</span></li>
              <li><b>Meir Ben-Dayan</b><span>Written by</span></li>
            </ul>
            <div className="heroActions">
              <a href={G.url} target="_blank" rel="noopener noreferrer" className="btn btnElectric">Watch on Mostly Music</a>
              <a href="#gg-club" className="btn btnOutline">Join the Gadget Guy Club</a>
            </div>
          </div>
          <div className="ggPoster">
            <Image src="/images/gadget-guy/poster.jpg" alt="The Gadget Guy poster" width={1379} height={2000} priority sizes="(max-width:900px) 80vw, 420px"/>
          </div>
        </div>
      </section>

      <section className="wrap ggSection">
        <h2>Trailer</h2>
        {G.trailerVimeoId ? (
          <div className="ggVideo">
            <iframe src={`https://player.vimeo.com/video/${G.trailerVimeoId}?title=0&byline=0&portrait=0`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="The Gadget Guy trailer"/>
          </div>
        ) : (
          <div className="ggVideo ggComingSoon">
            <Image src="/images/gadget-guy/banner.jpg" alt="" fill sizes="(max-width:1100px) 100vw, 1100px"/>
            <span>Trailer coming soon</span>
          </div>
        )}
      </section>

      <section className="wrap ggSection ggStory">
        <h2>More than gadgets</h2>
        <p>{G.synopsis[1]}</p>
      </section>

      <section className="wrap ggSection">
        <h2>The Gadget Lab</h2>
        <p className="ggSub">Behind-the-scenes, bonus clips and a peek at how Gershy&apos;s gadgets were made are on the way.</p>
        <div className="ggLab">
          {['Behind the Scenes','Bonus Clips','Meet the Cast'].map((t)=>(
            <div key={t} className="ggLabTile"><span>{t}</span><small>Coming soon</small></div>
          ))}
        </div>
      </section>

      <JoinClub id="gg-club" title="Join the Gadget Guy Club" text="Get new clips, behind-the-scenes and Gadget Guy surprises sent straight to your inbox."/>
    </div>
  )
}
