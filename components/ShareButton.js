'use client'
import {useEffect,useRef,useState} from 'react'

// Turns a video's UUID into a short, YouTube-style code (e.g. "3f2a1c4e")
// for the /v/[code] redirect route below.
function shortCode(id){
  return (id||'').replace(/-/g,'').slice(0,8)
}

function WhatsAppGlyph(){return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a9.8 9.8 0 0 0-8.4 14.8L2 22l5.4-1.5A9.9 9.9 0 1 0 12 2Zm0 17.8a7.7 7.7 0 0 1-3.9-1.1l-.3-.2-3.2.9.9-3.1-.2-.3A7.8 7.8 0 1 1 12 19.8Zm4.3-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-1.4-.7-2.3-1.3-3.2-2.9-.2-.3.2-.3.6-1 .1-.2.1-.4 0-.6 0-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5 4.5.7.3 1.2.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.1-.3-.2-.6-.3Z"/></svg>}
function XGlyph(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.4 8.5L23 22h-6.8l-5.3-6.9L4.8 22H1.7l7.9-9L1 2h7l4.8 6.3L18.9 2Zm-1.2 18h1.9L6.4 4H4.4l13.3 16Z"/></svg>}
function FacebookGlyph(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 22v-8.4h2.8l.4-3.3h-3.2V8.1c0-1 .3-1.6 1.7-1.6h1.6V3.5A22 22 0 0 0 14 3.3c-2.5 0-4.2 1.5-4.2 4.4v2.6H7v3.3h2.8V22h3.7Z"/></svg>}
function EmailGlyph(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3.5" y="5.5" width="17" height="13" rx="1.6"/><path d="M4.5 7l7.5 6 7.5-6"/></svg>}

export default function ShareButton({video}){
  const [open,setOpen]=useState(false)
  const [useShort,setUseShort]=useState(false)
  const [copied,setCopied]=useState(false)
  const boxRef=useRef(null)
  const inputRef=useRef(null)

  const [origin,setOrigin]=useState('')
  useEffect(()=>{setOrigin(window.location.origin)},[])

  const fullLink=origin?`${origin}/watch/${video?.slug||''}`:''
  const shortLink=origin&&video?.id?`${origin}/v/${shortCode(video.id)}`:''
  const link=(useShort&&shortLink)?shortLink:fullLink
  const title=video?.title||'this video'

  useEffect(()=>{
    if(!open) return
    function onDocClick(e){ if(boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    function onKey(e){ if(e.key==='Escape') setOpen(false) }
    document.addEventListener('mousedown',onDocClick)
    document.addEventListener('keydown',onKey)
    return ()=>{ document.removeEventListener('mousedown',onDocClick); document.removeEventListener('keydown',onKey) }
  },[open])

  useEffect(()=>{ if(open) setTimeout(()=>inputRef.current?.select(),50) },[open,link])

  async function copyLink(){
    try{ await navigator.clipboard.writeText(link); setCopied(true); setTimeout(()=>setCopied(false),1500) }
    catch{ inputRef.current?.select() }
  }

  const shareTargets=[
    ['WhatsApp','whatsapp',`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${link}`)}`,<WhatsAppGlyph key="i"/>],
    ['X','x',`https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}&text=${encodeURIComponent(title)}`,<XGlyph key="i"/>],
    ['Facebook','facebook',`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,<FacebookGlyph key="i"/>],
    ['Email','email',`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(link)}`,<EmailGlyph key="i"/>],
  ]

  return <div className="shareWrap" ref={boxRef}>
    <button type="button" className="ghost btn shareOnly" onClick={()=>setOpen(o=>!o)} aria-expanded={open}>↗ Share</button>
    {open&&<div className="sharePopover" role="dialog" aria-label="Share this video">
      <div className="sharePopoverTitle">Share</div>
      <div className="shareTargetRow">
        {shareTargets.map(([label,key,href,icon])=><a key={key} className={`shareTarget shareTarget-${key}`} href={href} target="_blank" rel="noreferrer"><span className="shareTargetIcon">{icon}</span><span className="shareTargetLabel">{label}</span></a>)}
      </div>
      <div className="shareLinkRow">
        <input ref={inputRef} className="shareLinkInput" readOnly value={link} onFocus={e=>e.target.select()}/>
        <button type="button" className="shareCopyBtn" onClick={copyLink}>{copied?'✓ Copied':'Copy'}</button>
      </div>
      {shortLink&&<label className="shareShortToggle"><input type="checkbox" checked={useShort} onChange={e=>setUseShort(e.target.checked)}/> Use short link</label>}
    </div>}
  </div>
}
