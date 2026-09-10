'use client'
import {useEffect,useMemo,useRef,useState} from 'react'
import VideoCard from './VideoCard'
import Icon from './Icon'

const iconFor={
  'all-videos':'play','documentaries':'documentary','entertainment':'entertainment','music-videos':'music','qanda':'qa','behind-the-scenes':'bts','events-and-highlights':'events','shorts':'shorts','premium-content':'premium'
}

function norm(value=''){
  return String(value).toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,' ').trim()
}

function durationSeconds(duration=''){
  const parts=String(duration).split(':').map(Number)
  if(parts.some(Number.isNaN)) return 0
  if(parts.length===2) return parts[0]*60+parts[1]
  if(parts.length===3) return parts[0]*3600+parts[1]*60+parts[2]
  return 0
}

function inCategory(video,slug){
  if(slug==='all-videos') return true
  if(slug==='premium-content') return Boolean(video.premium) || norm([...(video.categories||[]),video.category||''].join(' ')).includes('premium') || norm(video.category).includes('yidly')
  if(slug==='shorts') return norm([...(video.categories||[]),video.category||''].join(' ')).includes('short') || (video.durationSeconds && Number(video.durationSeconds)<=60)
  const c=norm([...(video.categories||[]),video.category||''].join(' '))
  const map={
    stories:['stories','story'],
    documentaries:['documentary','documentaries'],
    entertainment:['entertainment'],
    'music-videos':['music video','music videos'],
    qanda:['q and a','qanda','qa'],
    'q-and-a':['q and a','qanda','qa'],
    'behind-the-scenes':['behind the scenes','bts'],
    'events-and-highlights':['events and highlights','event highlights','event opener','events','event']
  }
  return (map[slug]||[norm(slug)]).some(term=>c.includes(term))
}

function matchesSearch(video,query){
  const q=norm(query)
  if(!q) return true
  const seconds=durationSeconds(video.duration)
  if(q==='under 5 min' || q==='under 5 minutes') return seconds>0 && seconds<300
  if(q==='long form' || q==='longform') return seconds>=300
  if(q==='premium' || q==='yidly' || q==='yidly premium') return Boolean(video.premium)
  const hay=norm(`${video.title} ${video.client} ${(video.categories||[]).join(' ')} ${video.category||''} ${(video.tags||[]).join(' ')} ${video.premium?'premium yidly':''}`)
  return q.split(' ').every(word=>hay.includes(word))
}

export default function CategoryBrowser({slug,name,videos,initialQuery='',autoFocus=false}){
  const [q,setQ]=useState(initialQuery)
  const searchRef=useRef(null)
  const [visible,setVisible]=useState(12)
  useEffect(()=>{setQ(initialQuery);setVisible(12)},[initialQuery,slug])
  useEffect(()=>{if(autoFocus) setTimeout(()=>searchRef.current?.focus(),50)},[autoFocus])

  const categoryVideos=useMemo(()=>videos.filter(v=>inCategory(v,slug)),[videos,slug])
  const filtered=useMemo(()=>categoryVideos.filter(v=>matchesSearch(v,q)),[categoryVideos,q])
  const shown=filtered.slice(0,visible)

  return <>
    <section className={`categoryHero ${slug==='qanda'||slug==='q-and-a'?'qaCategoryHero':''}`}><div className="bigIcon lockedBigIcon"><img src={`/assets/category-icons-svg/${slug==='qanda'?'q-and-a':slug}.svg`} alt=""/></div><div><h1>{slug==='qanda'||slug==='q-and-a'?'Q&A':name}</h1><p>{slug==='all-videos'?'Search and browse the complete Mint Media library':(slug==='qanda'||slug==='q-and-a'?'Explore Q&A from Mint Media':`Explore ${name.toLowerCase()} from Mint Media`)}</p></div></section>
    <div className="search"><span className="searchGlyph">⌕</span><input ref={searchRef} value={q} onChange={e=>{setQ(e.target.value);setVisible(12)}} placeholder={slug==='all-videos'?'Search by title, client, or category...':(slug==='qanda'||slug==='q-and-a'?'Search Q&A...':`Search ${name.toLowerCase()}...`)} aria-label="Search videos"/>{q?<button className="searchClear" type="button" onClick={()=>setQ('')} aria-label="Clear search">×</button>:null}</div>
    <div className="searchSummary"><span>{filtered.length} {filtered.length===1?'video':'videos'}{q?` found for “${q}”`:''}</span>{q?<button type="button" onClick={()=>setQ('')}>Clear search</button>:null}</div>
    {shown.length?<div className="cards categoryCards">{shown.map(v=><VideoCard video={v} key={v.slug}/>)}</div>:<div className="emptyResults"><strong>No videos found.</strong><span>Try a title, client name, category, or a broader search.</span></div>}
    {visible<filtered.length?<button className="ghost btn loadMore" type="button" onClick={()=>setVisible(v=>v+12)}>Load More ↓</button>:null}
  </>
}
