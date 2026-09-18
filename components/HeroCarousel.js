'use client'
import {useEffect,useMemo,useRef,useState} from 'react'
import Link from 'next/link'

function PauseIcon(){return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1"/><rect x="14" y="4" width="5" height="16" rx="1"/></svg>}
function PlayIcon(){return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>}

const AUTOPLAY_MS=5500
const SWIPE_THRESHOLD=50

export default function HeroCarousel({videos=[]}){
  const slides=useMemo(()=>videos.filter(Boolean).slice(0,8),[videos])
  const [index,setIndex]=useState(0)
  const [playing,setPlaying]=useState(true)
  const touchStartX=useRef(null)

  useEffect(()=>{
    if(!playing || slides.length<2) return
    const id=setInterval(()=>setIndex(i=>(i+1)%slides.length),AUTOPLAY_MS)
    return ()=>clearInterval(id)
  },[playing,index,slides.length])

  if(!slides.length)return null
  const current=slides[index%slides.length]
  const go=(d)=>setIndex(i=>(i+d+slides.length)%slides.length)
  const eyebrow=current.premium?'PREMIUM CONTENT':(current.showJustMinted!==false?'JUST MINTED':'')

  // Swipe left/right to change slides on touch devices.
  function onTouchStart(e){ touchStartX.current=e.touches[0].clientX }
  function onTouchEnd(e){
    if(touchStartX.current==null) return
    const dx=e.changedTouches[0].clientX-touchStartX.current
    if(Math.abs(dx)>SWIPE_THRESHOLD) go(dx<0?1:-1)
    touchStartX.current=null
  }

  return <section className="homeHero dynamicHero v9Hero" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
    {/* All slides render at once, absolutely stacked; only the active one is opaque, so
        changing slides crossfades instead of the old instant background-image swap. */}
    <div className="heroSlideStack">
      {slides.map((s,i)=>{
        const image=(s.heroImage&&s.heroImage.trim())||(s.thumbnail&&s.thumbnail.trim())||'/assets/hero-camera.jpg'
        return <div key={s.slug||i} className={`heroSlide${i===index?' active':''}`} style={{backgroundImage:`url(${JSON.stringify(image)})`}}/>
      })}
    </div>
    <div className="heroShade"/>
    <Link className="heroMainLink" href={`/watch/${current.slug}`} aria-label={`Watch ${current.title}`}/>
    <div className="wide heroInner">
      {slides.length>1&&<button type="button" className="heroArrow left" onClick={(e)=>{e.preventDefault();e.stopPropagation();go(-1)}} aria-label="Previous featured video">‹</button>}
      <div className="heroContent" key={current.slug}>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1>{current.title}</h1><div className="meta">{current.category||current.categories?.[0]||'Video'}</div></div>
      {slides.length>1&&<button type="button" className="heroArrow right" onClick={(e)=>{e.preventDefault();e.stopPropagation();go(1)}} aria-label="Next featured video">›</button>}
      {slides.length>1&&<div className="dots">
        {slides.map((s,i)=><button type="button" key={s.slug||i} className={i===index?'on':''} onClick={(e)=>{e.preventDefault();e.stopPropagation();setIndex(i)}} aria-label={`Show featured video ${i+1}`}/>)}
        <button type="button" className="heroPlayToggle" onClick={(e)=>{e.preventDefault();e.stopPropagation();setPlaying(p=>!p)}} aria-label={playing?'Pause automatic slideshow':'Resume automatic slideshow'} aria-pressed={!playing}>{playing?<PauseIcon/>:<PlayIcon/>}</button>
      </div>}
    </div>
  </section>
}
