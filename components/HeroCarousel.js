'use client'
import {useMemo,useState} from 'react'
import Link from 'next/link'
export default function HeroCarousel({videos=[]}){
  const slides=useMemo(()=>videos.filter(Boolean).slice(0,5),[videos])
  const [index,setIndex]=useState(0)
  if(!slides.length)return null
  const current=slides[index%slides.length]
  const image=(current.heroImage&&current.heroImage.trim())||(current.thumbnail&&current.thumbnail.trim())||'/assets/hero-camera.jpg'
  const go=(d)=>setIndex(i=>(i+d+slides.length)%slides.length)
  return <section className="homeHero dynamicHero v9Hero">
    <div className="heroPhoto" style={{backgroundImage:`url(${JSON.stringify(image)})`}}/>
    <div className="heroShade"/>
    <Link className="heroMainLink" href={`/watch/${current.slug}`} aria-label={`Watch ${current.title}`}/>
    <div className="wide heroInner">
      {slides.length>1&&<button type="button" className="heroArrow left" onClick={(e)=>{e.preventDefault();e.stopPropagation();go(-1)}} aria-label="Previous featured video">‹</button>}
      <div className="heroContent"><div className="eyebrow">{current.premium?'PREMIUM CONTENT':'JUST MINTED'}</div><h1>{current.title}</h1><div className="meta">{current.category||current.categories?.[0]||'Video'} <b>•</b> {current.client||'Mint Media'}</div></div>
      {slides.length>1&&<button type="button" className="heroArrow right" onClick={(e)=>{e.preventDefault();e.stopPropagation();go(1)}} aria-label="Next featured video">›</button>}
      {slides.length>1&&<div className="dots">{slides.map((s,i)=><button type="button" key={s.slug||i} className={i===index?'on':''} onClick={(e)=>{e.preventDefault();e.stopPropagation();setIndex(i)}} aria-label={`Show featured video ${i+1}`}/>)}</div>}
    </div>
  </section>
}
