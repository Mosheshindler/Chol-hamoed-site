'use client'
import {useEffect,useMemo,useRef,useState} from 'react'
import VideoCard from './VideoCard'
import Icon from './Icon'
import {CATEGORIES,categorySlug} from '../lib/site'

const iconFor={
  'all-videos':'play','documentaries':'documentary','entertainment':'entertainment','music-videos':'music','qanda':'qa','behind-the-scenes':'bts','events-and-highlights':'events','shorts':'shorts','premium-content':'premium'
}

const PAGE_SIZE=16

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
  if(slug==='shorts') return norm([...(video.categories||[]),video.category||''].join(' ')).includes('short')
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

// Plain Levenshtein edit distance, used below to tolerate small typos in search terms.
function levenshtein(a,b){
  if(a===b) return 0
  const al=a.length,bl=b.length
  if(!al) return bl
  if(!bl) return al
  let prev=Array.from({length:bl+1},(_,i)=>i)
  for(let i=1;i<=al;i++){
    const cur=[i]
    for(let j=1;j<=bl;j++) cur[j]=a[i-1]===b[j-1]?prev[j-1]:1+Math.min(prev[j-1],prev[j],cur[j-1])
    prev=cur
  }
  return prev[bl]
}

// Exact substring match first (fast path); falls back to edit-distance so a misspelled
// word ("documentries", "shabos") still finds what someone meant. Allowed distance scales
// with word length so short words still need to be close.
function fuzzyWordMatch(haystackWords,word){
  if(haystackWords.some(w=>w.includes(word)||word.includes(w))) return true
  if(word.length<4) return false
  const maxDist=word.length<=6?1:2
  return haystackWords.some(w=>Math.abs(w.length-word.length)<=maxDist && levenshtein(w,word)<=maxDist)
}

function matchesSearch(video,query){
  const q=norm(query)
  if(!q) return true
  const seconds=durationSeconds(video.duration)
  if(q==='under 5 min' || q==='under 5 minutes') return seconds>0 && seconds<300
  if(q==='long form' || q==='longform') return seconds>=300
  if(q==='premium' || q==='yidly' || q==='yidly premium') return Boolean(video.premium)
  const hay=norm(`${video.title} ${(video.categories||[]).join(' ')} ${video.category||''} ${(video.tags||[]).join(' ')} ${video.premium?'premium yidly':''}`)
  const hayWords=hay.split(' ').filter(Boolean)
  return q.split(' ').every(word=>fuzzyWordMatch(hayWords,word))
}

export default function CategoryBrowser({slug,name,videos,categoryOrder={},initialQuery='',autoFocus=false}){
  const [q,setQ]=useState(initialQuery)
  const searchRef=useRef(null)
  const [visible,setVisible]=useState(PAGE_SIZE)
  // Only meaningful on the All Videos page — lets people narrow the master list to any
  // number of collections at once in-page, instead of navigating away to each category's
  // own page. Empty selection means "no filter" (show everything).
  const [selectedCats,setSelectedCats]=useState([])
  const [filterOpen,setFilterOpen]=useState(false)
  const filterRef=useRef(null)
  useEffect(()=>{setQ(initialQuery);setVisible(PAGE_SIZE);setSelectedCats([])},[initialQuery,slug])
  useEffect(()=>{if(autoFocus) setTimeout(()=>searchRef.current?.focus(),50)},[autoFocus])

  useEffect(()=>{
    if(!filterOpen) return
    function onDocClick(e){ if(filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false) }
    function onKey(e){ if(e.key==='Escape') setFilterOpen(false) }
    document.addEventListener('mousedown',onDocClick)
    document.addEventListener('keydown',onKey)
    return ()=>{ document.removeEventListener('mousedown',onDocClick); document.removeEventListener('keydown',onKey) }
  },[filterOpen])

  function toggleCat(catSlug){
    setSelectedCats(prev=>prev.includes(catSlug)?prev.filter(s=>s!==catSlug):[...prev,catSlug])
    setVisible(PAGE_SIZE)
  }

  const categoryVideos=useMemo(()=>{
    let matches
    if(slug==='all-videos'){
      matches=selectedCats.length?videos.filter(v=>selectedCats.some(s=>inCategory(v,s))):videos
    }else{
      matches=videos.filter(v=>inCategory(v,slug))
    }
    const hasOrder=categoryOrder && Object.keys(categoryOrder).length>0
    if(!hasOrder) return matches
    return [...matches].sort((a,b)=>{
      const ao=a.id in categoryOrder?categoryOrder[a.id]:Infinity
      const bo=b.id in categoryOrder?categoryOrder[b.id]:Infinity
      return ao-bo
    })
  },[videos,slug,selectedCats,categoryOrder])
  const filtered=useMemo(()=>categoryVideos.filter(v=>matchesSearch(v,q)),[categoryVideos,q])
  const shown=filtered.slice(0,visible)

  // Auto-load-more: a zero-height sentinel below the grid triggers the next page once it
  // scrolls near the viewport, instead of requiring a "Load More" click. The observer is
  // rebuilt every time `visible` changes (rather than set up once) because observing an
  // already-intersecting element fires immediately — that's what lets this cascade through
  // several loads in a row on a short/fast page instead of getting stuck after the first
  // one (a plain one-time observer only fires on enter/exit, and never "re-enters" if the
  // sentinel was already on-screen the whole time).
  const sentinelRef=useRef(null)
  useEffect(()=>{
    const el=sentinelRef.current
    if(!el || visible>=filtered.length) return
    const observer=new IntersectionObserver((entries)=>{
      if(entries[0].isIntersecting) setVisible(v=>v+PAGE_SIZE)
    },{rootMargin:'800px 0px'})
    observer.observe(el)
    return ()=>observer.disconnect()
  },[visible,filtered.length])

  return <>
    <section className={`categoryHero ${slug==='qanda'||slug==='q-and-a'?'qaCategoryHero':''}`}><div className="bigIcon lockedBigIcon"><img src={`/assets/category-icons-svg/${slug==='qanda'?'q-and-a':slug}.svg`} alt=""/></div><div><h1>{slug==='qanda'||slug==='q-and-a'?'Q&A':name}</h1><p>{slug==='all-videos'?'Search and browse the complete Mint Media library':(slug==='qanda'||slug==='q-and-a'?'Explore Q&A from Mint Media':`Explore ${name.toLowerCase()} from Mint Media`)}</p></div></section>
    {slug==='all-videos'&&<div className="collectionFilterWrap" ref={filterRef}>
      <button type="button" className={`collectionFilterBtn${selectedCats.length?' active':''}`} onClick={()=>setFilterOpen(o=>!o)} aria-expanded={filterOpen}>
        {selectedCats.length?`${selectedCats.length} ${selectedCats.length===1?'category':'categories'}`:'Filter by category'}
        <span className={`chev${filterOpen?' chevOpen':''}`}>▾</span>
      </button>
      {filterOpen&&<div className="collectionFilterMenu" role="menu">
        {CATEGORIES.map(c=>{const s=categorySlug(c);return <label className="collectionFilterOption" key={s}><input type="checkbox" checked={selectedCats.includes(s)} onChange={()=>toggleCat(s)}/>{c}</label>})}
        {selectedCats.length>0&&<button type="button" className="collectionFilterClear" onClick={()=>{setSelectedCats([]);setVisible(PAGE_SIZE)}}>Clear filters</button>}
      </div>}
    </div>}
    <div className="search"><span className="searchGlyph">⌕</span><input ref={searchRef} value={q} onChange={e=>{setQ(e.target.value);setVisible(PAGE_SIZE)}} placeholder={slug==='all-videos'?'Search by title or category...':(slug==='qanda'||slug==='q-and-a'?'Search Q&A...':`Search ${name.toLowerCase()}...`)} aria-label="Search videos"/>{q?<button className="searchClear" type="button" onClick={()=>setQ('')} aria-label="Clear search">×</button>:null}</div>
    <div className="searchSummary"><span>{filtered.length} {filtered.length===1?'video':'videos'}{q?` found for “${q}”`:''}</span>{q?<button type="button" onClick={()=>setQ('')}>Clear search</button>:null}</div>
    {shown.length?<div className="cards categoryCards">{shown.map((v,i)=><VideoCard video={v} priority={i<4} key={v.slug}/>)}</div>:<div className="emptyResults"><strong>No videos found.</strong><span>Try a title, category, or a broader search.</span></div>}
    <div ref={sentinelRef} aria-hidden="true" style={{height:1}}/>
  </>
}
