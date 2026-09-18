import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import Player from '../../../components/Player'
import ShareButton from '../../../components/ShareButton'
import BackButton from '../../../components/BackButton'
import Image from 'next/image'
import {getVideos,getVideoBySlug} from '../../../lib/data'
import {getVideoAspect} from '../../../lib/videoAspect'
import {notFound} from 'next/navigation'

export default async function WatchPage({params}){
  const {slug}=await params
  const video=await getVideoBySlug(slug)
  if(!video)notFound()
  const [videos,aspect]=await Promise.all([getVideos(),getVideoAspect(video)])
  const next=videos.filter(v=>v.slug!==slug).slice(0,6)
  return <><Header/><main className="wide watchLayout">
    <section className="watchMain"><BackButton/><Player video={video} aspect={aspect}/><div className="watchMeta lockedWatchMeta"><div>{video.premium&&<div className="yidlyPremiumBadge">YIDLY PREMIUM</div>}<h1>{video.title}</h1><div className="meta">{(video.categories?.[0]||video.category)}{video.duration?<> &nbsp;•&nbsp; {video.duration}</>:null} &nbsp;•&nbsp; HD</div></div><ShareButton video={video}/></div>
      {video.premium&&<section className="yidlyPurchasePanel"><div className="yidlyBrandBlock"><img src="/assets/yidly-logo.png" alt="Yidly" className="yidlyLogo"/><div className="yidlyPremiumWord">PREMIUM</div></div><div className="yidlyPreviewCopy"><div className="yidlyPreviewEyebrow">YIDLY PREMIUM</div><div className="yidlyPreviewTitle">You’re watching a preview.</div><p>Watch the complete Yidly production on Mostly Music.</p></div><div className="yidlyPurchaseAction">{video.purchaseUrl?<a className="yidlyPurchaseBtn" href={video.purchaseUrl} target="_blank" rel="noopener noreferrer">WATCH THE FULL VIDEO <span>→</span></a>:<span className="premiumMissing">Full video link coming soon</span>}<div className="mostlyMusicLockup"><img src="/assets/mostly-music-logo.webp" alt="Mostly Music"/><span>Available on Mostly Music ↗</span></div></div></section>}
    </section>
    <aside className="upNext"><div className="upNextTitle">Up Next</div>{next.map(v=><a className="upNextItem" href={`/watch/${v.slug}`} key={v.slug}><div className="upNextThumb"><Image src={v.thumbnail} alt={v.title} fill sizes="145px" style={{objectFit:'cover'}}/>{v.duration&&<span>{v.duration}</span>}</div><div><strong>{v.title}</strong><small>{v.categories?.[0]||v.category}</small></div></a>)}</aside>
  </main><Footer/></>
}
