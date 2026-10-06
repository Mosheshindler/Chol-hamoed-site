'use client'
import {useEffect,useRef,useState} from 'react'
import {usePathname} from 'next/navigation'
import {SITE_LINKS} from '../lib/site'

const DELAY_MS=3*60*1000
// localStorage (permanent, survives new visits) — once someone's engaged with either link or
// closed the popup, never ask again on this device. sessionStorage (cleared when the tab/
// window closes) anchors "time on site" to when they actually arrived, so the 3 minutes is
// real elapsed time even across page navigations and hard refreshes, not just time on one page.
const SEEN_KEY='mm_signup_prompt_seen'
const START_KEY='mm_site_start'

// Explicit width/height (not just viewBox) matters here: Safari can render an inline SVG
// with only a viewBox at zero size when its parent's size comes from flexbox rather than
// the SVG's own CSS width/height — it looked fine in Chrome-based testing but showed up as
// a missing icon in Safari, where most of this site's traffic actually comes from.
function MailIcon(){return <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true"><rect x="5.5" y="10.5" width="37" height="27" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/><path d="M7 13l17 13 17-13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
function WhatsAppIcon(){return <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true"><path d="M24 6.5c-9.54 0-17.28 7.38-17.28 16.48 0 3.2.97 6.19 2.65 8.72L6.5 41.5l10.25-2.7a17.86 17.86 0 0 0 7.25 1.53c9.54 0 17.28-7.38 17.28-16.48S33.54 6.5 24 6.5Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"/><path d="M17.2 14.8c.52-.05 1.04-.06 1.37.56l1.98 4.02c.25.5.17.84-.12 1.22l-1.36 1.66c-.27.33-.23.67-.05 1.03 1.23 2.4 3.3 4.48 5.74 5.75.34.18.68.2.98-.06l1.67-1.4c.37-.31.73-.39 1.23-.14l4.02 1.99c.6.3.66.84.56 1.36-.19 1.1-.95 2.46-2.05 3.15-1.06.66-2.35 1.02-3.57.75-2.08-.46-5.3-1.66-8.58-4.8-3.12-2.99-4.49-6.01-5.02-8.1-.32-1.24-.04-2.57.62-3.67.65-1.08 1.56-2.07 2.58-2.32Z" fill="currentColor"/></svg>}

export default function SignupPopup(){
  const pathname=usePathname()||'/'
  const pathnameRef=useRef(pathname)
  const [open,setOpen]=useState(false)

  useEffect(()=>{pathnameRef.current=pathname},[pathname])

  // Runs once for the whole visit (this component lives in the root layout, which doesn't
  // remount on client-side navigation) — the pathname check happens inside the timeout, at
  // the moment it actually fires, so it correctly skips showing over the admin panel even if
  // that's wherever the visitor happens to be three minutes in.
  useEffect(()=>{
    try{
      if(localStorage.getItem(SEEN_KEY)) return
      let start=Number(sessionStorage.getItem(START_KEY))
      if(!start){start=Date.now();sessionStorage.setItem(START_KEY,String(start))}
      const remaining=Math.max(0,DELAY_MS-(Date.now()-start))
      const timer=setTimeout(()=>{
        if(!pathnameRef.current.startsWith('/admin')) setOpen(true)
      },remaining)
      return ()=>clearTimeout(timer)
    }catch{
      const timer=setTimeout(()=>setOpen(true),DELAY_MS)
      return ()=>clearTimeout(timer)
    }
  },[])

  function dismiss(){
    setOpen(false)
    try{localStorage.setItem(SEEN_KEY,'1')}catch{}
  }

  if(!open || pathname.startsWith('/admin')) return null

  return <div className="signupPopupOverlay" onClick={dismiss}>
    <div className="signupPopupCard" onClick={e=>e.stopPropagation()}>
      <button type="button" className="signupPopupClose" onClick={dismiss} aria-label="Close">×</button>
      <div className="signupPopupHead">
        <div className="eyebrow">DON&rsquo;T MISS OUT</div>
        <h3>Stay in the loop</h3>
        <p>Get new videos and updates from Mint Media.</p>
      </div>
      <div className="signupPopupOptions">
        <a className="signupPopupOption" href={SITE_LINKS.newsletter} target="_blank" rel="noreferrer" onClick={dismiss}>
          <span className="ctaIcon"><MailIcon/></span>
          <span><strong>Newsletter</strong><small>Email updates (once monthly)</small></span>
        </a>
        <a className="signupPopupOption" href={SITE_LINKS.whatsapp} target="_blank" rel="noreferrer" onClick={dismiss}>
          <span className="ctaIcon waIcon"><WhatsAppIcon/></span>
          <span><strong>WhatsApp</strong><small>Status updates</small></span>
        </a>
      </div>
      <button type="button" className="signupPopupSkip" onClick={dismiss}>Maybe later</button>
    </div>
  </div>
}
