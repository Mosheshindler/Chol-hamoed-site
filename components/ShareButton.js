'use client'
import {useEffect,useRef,useState} from 'react'

// Turns a video's UUID into a short, YouTube-style code (e.g. "3f2a1c4e")
// for the /v/[code] redirect route below.
function shortCode(id){
  return (id||'').replace(/-/g,'').slice(0,8)
}

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

  async function shareNative(){
    try{ await navigator.share({title:document.title,url:link}) }catch{}
  }

  return <div className="shareWrap" ref={boxRef}>
    <button type="button" className="ghost btn shareOnly" onClick={()=>setOpen(o=>!o)} aria-expanded={open}>↗ Share</button>
    {open&&<div className="sharePopover" role="dialog" aria-label="Share this video">
      <div className="sharePopoverTitle">Share this video</div>
      <div className="shareLinkRow">
        <input ref={inputRef} className="shareLinkInput" readOnly value={link} onFocus={e=>e.target.select()}/>
        <button type="button" className="shareCopyBtn" onClick={copyLink}>{copied?'✓ Copied':'Copy'}</button>
      </div>
      {shortLink&&<label className="shareShortToggle"><input type="checkbox" checked={useShort} onChange={e=>setUseShort(e.target.checked)}/> Use short link</label>}
      {typeof navigator!=='undefined'&&navigator.share&&<button type="button" className="shareNativeBtn" onClick={shareNative}>Share via…</button>}
    </div>}
  </div>
}
