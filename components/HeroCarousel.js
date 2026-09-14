'use client'
import {useEffect,useMemo,useState} from 'react'
import Link from 'next/link'

function PauseIcon(){return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1"/><rect x="14" y="4" width="5" height="16" rx="1"/></svg>}
function PlayIcon(){return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>}

const AUTOPLAY_MS=5500

export default function HeroCarousel({videos=[]}){
  const slides=useMemo(()=>videos.filter(Boolean).slice(0,8),[videos])
  const [index,setIndex]=useState(0)
  const [playing,setPlaying]=useState(true)

  useEffect(()=>{
    if(!playing || slides.length<2) return
    const id=setInterval(()=>setIndex(i=>(i+1)%slides.length),AUTOPLAY_MS)
    return ()=>clearInterval(id)
  },[playing,index,slides.length])

  if(!slides.length)return null
  const current=slides[index%slides.length]
  const image=(current.heroImage&&current.heroImage.trim())||(current.thumbnail&&current.thumbnail.trim())||'/assets/hero-camera.jpg'
  const go=(d)=>setIndex(i=>(i+d+slides.length)%slides.length)
  const eyebrow=current.premium?'PREMIUM CONTENT':(current.showJustMinted!==false?'JUST MINTED':'')
  return <section className="homeHero dynamicHero v9Hero">
    <div className="heroPhoto" style={{backgroundImage:`url(${JSON.stringify(image)})`}}/>
    <div className="heroShade"/>
    <Link className="heroMainLink" href={`/watch/${current.slug}`} aria-label={`Watch ${current.title}`}/>
    <div className="wide heroInner">
      {slides.length>1&&<button type="button" className="heroArrow left" onClick={(e)=>{e.preventDefault();e.stopPropagation();go(-1)}} aria-label="Previous featured video">‹</button>}
      <div className="heroContent">{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1>{current.title}</h1><div className="meta">{current.category||current.categories?.[0]||'Video'}</div></div>
      {slides.length>1&&<button type="button" className="heroArrow right" onClick={(e)=>{e.preventDefault();e.stopPropagation();go(1)}} aria-label="Next featured video">›</button>}
      {slides.length>1&&<div className="dots">
        {slides.map((s,i)=><button type="button" key={s.slug||i} className={i===index?'on':''} onClick={(e)=>{e.preventDefault();e.stopPropagation();setIndex(i)}} aria-label={`Show featured video ${i+1}`}/>)}
        <button type="button" className="heroPlayToggle" onClick={(e)=>{e.preventDefault();e.stopPropagation();setPlaying(p=>!p)}} aria-label={playing?'Pause automatic slideshow':'Resume automatic slideshow'} aria-pressed={!playing}>{playing?<PauseIcon/>:<PlayIcon/>}</button>
      </div>}
    </div>
  </section>
}
