import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import Player from '../../../components/Player'
import ShareButton from '../../../components/ShareButton'
import BackButton from '../../../components/BackButton'
import MostlyMusicButton from '../../../components/MostlyMusicButton'
import Image from 'next/image'
import {getVideos,getVideoBySlug} from '../../../lib/data'
import {getVideoAspect} from '../../../lib/videoAspect'
import {notFound} from 'next/navigation'

// Fisher-Yates — an unbiased shuffle (unlike sorting by Math.random(), which is not a fair
// shuffle and skews toward certain orderings).
function shuffle(list){
  const arr=[...list]
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1))
    ;[arr[i],arr[j]]=[arr[j],arr[i]]
  }
  return arr
}

export default async function WatchPage({params}){
  const {slug}=await params
  const video=await getVideoBySlug(slug)
  if(!video)notFound()
  const [videos,aspect]=await Promise.all([getVideos(),getVideoAspect(video)])
  // Same-category videos first (shuffled, so it's not the identical six every time), then
  // fill any remaining slots with other videos — rather than always the same static top six
  // from the site-wide order regardless of what's actually being watched.
  const myCategories=video.categories?.length?video.categories:[video.category].filter(Boolean)
  const others=videos.filter(v=>v.slug!==slug)
  const related=others.filter(v=>(v.categories?.length?v.categories:[v.category]).some(c=>myCategories.includes(c)))
  const unrelated=others.filter(v=>!related.includes(v))
  const next=[...shuffle(related),...shuffle(unrelated)].slice(0,6)
  return <><Header/><main className="wide watchLayout">
    <section className="watchMain"><BackButton/><div className={video.premium?'premiumPlayerWrap':undefined}><Player video={video} aspect={aspect}/></div>
      {video.premium&&<section className="yidlyPurchasePanel"><div className="yidlyBrandBlock"><img src="/assets/yidly-logo.png" alt="Yidly" className="yidlyLogo"/><div className="yidlyPremiumWord">PREMIUM</div></div><div className="yidlyPreviewCopy"><div className="yidlyPreviewEyebrow">YIDLY PREMIUM</div><div className="yidlyPreviewTitle">You’re watching a preview.</div><p>Watch the complete Yidly production on Mostly Music.</p></div><div className="yidlyPurchaseAction">{video.purchaseUrl?<MostlyMusicButton video={video}/>:<span className="premiumMissing">Full video link coming soon</span>}<div className="mostlyMusicLockup"><img src="/assets/mostly-music-logo.webp" alt="Mostly Music"/><span>Available on Mostly Music ↗</span></div></div></section>}
      <div className="watchMeta lockedWatchMeta"><div>{video.premium&&<div className="yidlyPremiumBadge">YIDLY PREMIUM</div>}<h1>{video.title}</h1><div className="meta">{(video.categories?.[0]||video.category)}{video.duration?<> &nbsp;•&nbsp; {video.duration}</>:null} &nbsp;•&nbsp; HD</div></div><ShareButton video={video}/></div>
    </section>
    <aside className="upNext"><div className="upNextTitle">Up Next</div>{next.map(v=><a className="upNextItem" href={`/watch/${v.slug}`} key={v.slug}><div className="upNextThumb"><Image src={v.thumbnail} alt={v.title} fill sizes="145px" style={{objectFit:'cover'}}/>{v.duration&&<span>{v.duration}</span>}</div><div><strong>{v.title}</strong><small>{v.categories?.[0]||v.category}</small></div></a>)}</aside>
  </main><Footer/></>
}
