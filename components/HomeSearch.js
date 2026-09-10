'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'

export default function HomeSearch({popular=[]}){
  const [q,setQ]=useState('')
  const router=useRouter()
  const go=(value=q)=>{
    const term=String(value||'').trim()
    router.push(term ? `/category/all-videos?q=${encodeURIComponent(term)}` : '/category/all-videos')
  }
  return <>
    <form className="search" onSubmit={e=>{e.preventDefault();go()}}>
      <span className="searchGlyph">⌕</span>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="What do you want to watch?" aria-label="Search videos"/>
      <button className="searchGo" type="submit" aria-label="Search">→</button>
    </form>
    <div className="popular"><strong>Popular searches:</strong>{popular.map(s=><button type="button" key={s} onClick={()=>go(s)}>{s}</button>)}</div>
  </>
}
