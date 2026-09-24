'use client'
import Link from 'next/link'
import {usePathname,useRouter} from 'next/navigation'
import {useEffect,useRef,useState} from 'react'
import {CATEGORIES,categorySlug,SITE_LINKS} from '../lib/site'

function SearchIcon(){return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/></svg>}
function ChevIcon(){return <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l4 3.2L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
function WhatsAppIcon(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.5 11.7a8.5 8.5 0 01-12.6 7.5L3.5 20.5l1.4-4.2a8.5 8.5 0 1115.6-4.6z"/><path d="M8.5 8.1c.4-.5.8-.5 1.1 0l1 2c.2.4.1.7-.2 1l-.7.7c1 1.8 2.4 3.2 4.3 4.1l.7-.8c.3-.3.6-.4 1-.2l2 .9c.4.2.5.6.2 1.1-.4.8-1.2 1.4-2.1 1.4-3.6-.2-8.4-4.5-8.8-8.2-.1-.8.6-1.5 1.5-2z"/></svg>}

export default function Header(){
  const pathname=usePathname()||'/'
  const router=useRouter()
  const [open,setOpen]=useState(false)
  const [mobileOpen,setMobileOpen]=useState(false)
  const [searchOpen,setSearchOpen]=useState(false)
  const [searchValue,setSearchValue]=useState('')
  const searchBoxRef=useRef(null)
  const searchInputRef=useRef(null)
  const active=(href)=>href==='/'?pathname==='/':pathname===href||pathname.startsWith(href+'/')
  useEffect(()=>{setMobileOpen(false);setOpen(false);setSearchOpen(false)},[pathname])

  useEffect(()=>{
    if(!searchOpen) return
    setTimeout(()=>searchInputRef.current?.focus(),50)
    function onDocClick(e){ if(searchBoxRef.current && !searchBoxRef.current.contains(e.target)) setSearchOpen(false) }
    function onKey(e){ if(e.key==='Escape') setSearchOpen(false) }
    document.addEventListener('mousedown',onDocClick)
    document.addEventListener('keydown',onKey)
    return ()=>{ document.removeEventListener('mousedown',onDocClick); document.removeEventListener('keydown',onKey) }
  },[searchOpen])

  function submitSearch(e){
    e.preventDefault()
    const term=searchValue.trim()
    router.push(term?`/category/all-videos?q=${encodeURIComponent(term)}`:'/category/all-videos')
    setSearchOpen(false);setSearchValue('')
  }

  return <header className="header"><div className="wide headerInner">
    <Link href="/" className="brand" aria-label="Entertain-Mint home"><img src="/assets/entertain-mint-logo.webp" alt="Entertain-Mint, powered by Mint Media"/></Link>
    <nav className="nav" aria-label="Primary navigation">
      <Link className={active('/')?'active':''} href="/">Home</Link>
      <div className="navDrop">
        <button className={`navDropButton ${pathname.startsWith('/category/')?'active':''}`} type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>Categories <span className={`chev${open?' chevOpen':''}`}><ChevIcon/></span></button>
        {open&&<div className="navDropMenu">{CATEGORIES.map(label=><Link key={label} href={`/category/${categorySlug(label)}`} onClick={()=>setOpen(false)}>{label}</Link>)}</div>}
      </div>
      <Link className={active('/collections')?'active':''} href="/collections">Collections</Link>
      <Link className={active('/category/all-videos')?'active':''} href="/category/all-videos">All Videos</Link>
      <Link className={active('/about')?'active':''} href="/about">About</Link>
      <Link className={active('/contact')?'active':''} href="/contact">Contact</Link>
    </nav>
    <div className="spacer"/>
    <div className="headerRight">
      <div className="searchBox" ref={searchBoxRef}>
        <button type="button" className="searchIcon" onClick={()=>setSearchOpen(v=>!v)} aria-expanded={searchOpen} aria-label="Search videos"><SearchIcon/></button>
        {searchOpen&&<form className="searchDrop" onSubmit={submitSearch}><input ref={searchInputRef} value={searchValue} onChange={e=>setSearchValue(e.target.value)} placeholder="What do you want to watch?" aria-label="Search videos"/><button type="submit" aria-label="Search">→</button></form>}
      </div>
      <a className="whatsapp" href={SITE_LINKS.whatsapp} target="_blank" rel="noreferrer"><WhatsAppIcon/> Follow us</a>
      <button className={`navBurger${mobileOpen?' open':''}`} type="button" onClick={()=>setMobileOpen(v=>!v)} aria-expanded={mobileOpen} aria-label="Toggle menu"><span/></button>
    </div>
  </div>
  {mobileOpen&&<nav className="mobileNavPanel" aria-label="Mobile navigation">
    <Link className={active('/')?'active':''} href="/" onClick={()=>setMobileOpen(false)}>Home</Link>
    <Link className={active('/collections')?'active':''} href="/collections" onClick={()=>setMobileOpen(false)}>Collections</Link>
    <Link className={active('/category/all-videos')?'active':''} href="/category/all-videos" onClick={()=>setMobileOpen(false)}>All Videos</Link>
    <Link className={active('/about')?'active':''} href="/about" onClick={()=>setMobileOpen(false)}>About</Link>
    <Link className={active('/contact')?'active':''} href="/contact" onClick={()=>setMobileOpen(false)}>Contact</Link>
    <div className="mobileNavLabel">Categories</div>
    <div className="mobileNavCats">{CATEGORIES.map(label=><Link key={label} href={`/category/${categorySlug(label)}`} onClick={()=>setMobileOpen(false)}>{label}</Link>)}</div>
  </nav>}
  </header>
}
