'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect,useState} from 'react'
import {ALL_CATEGORIES,categorySlug,SITE_LINKS} from '../lib/site'

function SearchIcon(){return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/></svg>}
function WhatsAppIcon(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.5 11.7a8.5 8.5 0 01-12.6 7.5L3.5 20.5l1.4-4.2a8.5 8.5 0 1115.6-4.6z"/><path d="M8.5 8.1c.4-.5.8-.5 1.1 0l1 2c.2.4.1.7-.2 1l-.7.7c1 1.8 2.4 3.2 4.3 4.1l.7-.8c.3-.3.6-.4 1-.2l2 .9c.4.2.5.6.2 1.1-.4.8-1.2 1.4-2.1 1.4-3.6-.2-8.4-4.5-8.8-8.2-.1-.8.6-1.5 1.5-2z"/></svg>}

export default function Header(){
  const pathname=usePathname()||'/'
  const [open,setOpen]=useState(false)
  const [mobileOpen,setMobileOpen]=useState(false)
  const active=(href)=>href==='/'?pathname==='/':pathname===href||pathname.startsWith(href+'/')
  useEffect(()=>{setMobileOpen(false);setOpen(false)},[pathname])
  return <header className="header"><div className="wide headerInner">
    <Link href="/" className="brand" aria-label="Mint Media home"><img src="/assets/mint-media-logo.png" alt="Mint Media"/></Link>
    <nav className="nav" aria-label="Primary navigation">
      <Link className={active('/')?'active':''} href="/">Browse</Link>
      <div className="navDrop">
        <button className={`navDropButton ${pathname.startsWith('/category/')?'active':''}`} type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>Categories <span className="chev">⌄</span></button>
        {open&&<div className="navDropMenu">{ALL_CATEGORIES.map(label=><Link key={label} href={`/category/${categorySlug(label)}`} onClick={()=>setOpen(false)}>{label}</Link>)}</div>}
      </div>
      <Link className={active('/collections')?'active':''} href="/collections">Collections</Link>
      <Link className={active('/category/all-videos')?'active':''} href="/category/all-videos">All Videos</Link>
      <Link className={active('/about')?'active':''} href="/about">About</Link>
      <Link className={active('/contact')?'active':''} href="/contact">Contact</Link>
    </nav>
    <div className="spacer"/>
    <Link className="searchIcon" href="/category/all-videos?focus=1" aria-label="Search videos"><SearchIcon/></Link>
    <a className="whatsapp" href={SITE_LINKS.whatsapp} target="_blank" rel="noreferrer"><WhatsAppIcon/> Follow on WhatsApp</a>
    <button className={`navBurger${mobileOpen?' open':''}`} type="button" onClick={()=>setMobileOpen(v=>!v)} aria-expanded={mobileOpen} aria-label="Toggle menu"><span/></button>
  </div>
  {mobileOpen&&<nav className="mobileNavPanel" aria-label="Mobile navigation">
    <Link className={active('/')?'active':''} href="/" onClick={()=>setMobileOpen(false)}>Browse</Link>
    <Link className={active('/collections')?'active':''} href="/collections" onClick={()=>setMobileOpen(false)}>Collections</Link>
    <Link className={active('/category/all-videos')?'active':''} href="/category/all-videos" onClick={()=>setMobileOpen(false)}>All Videos</Link>
    <Link className={active('/about')?'active':''} href="/about" onClick={()=>setMobileOpen(false)}>About</Link>
    <Link className={active('/contact')?'active':''} href="/contact" onClick={()=>setMobileOpen(false)}>Contact</Link>
    <div className="mobileNavLabel">Categories</div>
    <div className="mobileNavCats">{ALL_CATEGORIES.map(label=><Link key={label} href={`/category/${categorySlug(label)}`} onClick={()=>setMobileOpen(false)}>{label}</Link>)}</div>
  </nav>}
  </header>
}
