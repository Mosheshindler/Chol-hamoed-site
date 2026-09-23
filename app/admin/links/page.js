'use client'

import {useEffect,useMemo,useRef,useState} from 'react'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import AdminTabs from '../../../components/AdminTabs'
import {getSupabaseBrowserClient} from '../../../lib/supabaseClient'

const BASE='https://www.entertain-mint.com'
const STORAGE_KEY='emAdminLinks'
// Fixed since the tool no longer asks where the link is going or being shared — the
// name the user gives it (utm_campaign) is what tells links apart in GA4's reports.
const UTM_SOURCE='shared_link'
const UTM_MEDIUM='referral'

function slugify(value){
  return (value||'').toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')
}

function loadSaved(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch(e){return []}
}
function persistSaved(list){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(list))}catch(e){}
}

function copyText(text,onDone){
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(onDone).catch(()=>{fallbackCopy(text);onDone()})
  }else{
    fallbackCopy(text);onDone()
  }
}
function fallbackCopy(text){
  const ta=document.createElement('textarea')
  ta.value=text;ta.style.position='fixed';ta.style.opacity='0'
  document.body.appendChild(ta);ta.select()
  try{document.execCommand('copy')}catch(e){}
  document.body.removeChild(ta)
}

export default function AdminLinksPage(){
  const supabase=useMemo(()=>getSupabaseBrowserClient(),[])
  const [session,setSession]=useState(null)
  const [authLoading,setAuthLoading]=useState(true)
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [authError,setAuthError]=useState('')
  const [busy,setBusy]=useState(false)

  const [name,setName]=useState('')
  const [saved,setSaved]=useState([])
  const [copyLabel,setCopyLabel]=useState('Copy link')
  const [saveLabel,setSaveLabel]=useState('Save to my links')
  const [copiedId,setCopiedId]=useState(null)

  const [shortUrl,setShortUrl]=useState('')
  const [shortening,setShortening]=useState(false)
  const [shortenFailed,setShortenFailed]=useState(false)
  const shortenTimer=useRef(null)
  const shortenReqId=useRef(0)

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setAuthLoading(false)})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>setSession(next))
    return ()=>subscription.unsubscribe()
  },[supabase])

  useEffect(()=>{if(session) setSaved(loadSaved())},[session])

  async function login(e){
    e.preventDefault();setAuthError('');setBusy(true)
    const {error}=await supabase.auth.signInWithPassword({email,password})
    if(error)setAuthError(error.message)
    setBusy(false)
  }

  const campaignValue=slugify(name)||'untitled'
  const builtUrl=`${BASE}/?utm_source=${UTM_SOURCE}&utm_medium=${UTM_MEDIUM}&utm_campaign=${encodeURIComponent(campaignValue)}`

  // Auto-shorten whenever the built link changes, debounced so a link isn't requested
  // on every keystroke while typing the name.
  useEffect(()=>{
    setShortUrl('');setShortenFailed(false)
    if(shortenTimer.current) clearTimeout(shortenTimer.current)
    const reqId=++shortenReqId.current
    setShortening(true)
    shortenTimer.current=setTimeout(async()=>{
      try{
        const r=await fetch('/api/shorten',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:builtUrl})})
        const data=await r.json()
        if(reqId!==shortenReqId.current) return
        if(!r.ok||!data.shortUrl) throw new Error(data.error||'Could not shorten link.')
        setShortUrl(data.shortUrl)
      }catch(err){
        if(reqId!==shortenReqId.current) return
        setShortenFailed(true)
      }finally{
        if(reqId===shortenReqId.current) setShortening(false)
      }
    },700)
    return ()=>clearTimeout(shortenTimer.current)
  },[builtUrl])

  const copyValue=shortUrl||builtUrl

  function handleCopy(){
    copyText(copyValue,()=>{setCopyLabel('Copied ✓');setTimeout(()=>setCopyLabel('Copy link'),1600)})
  }
  function handleSave(){
    const list=loadSaved()
    list.push({id:Date.now()+'-'+Math.random().toString(36).slice(2,7),name:name.trim()||'Untitled link',url:copyValue,fullUrl:builtUrl,createdAt:Date.now()})
    persistSaved(list);setSaved(list)
    setSaveLabel('Saved ✓');setTimeout(()=>setSaveLabel('Save to my links'),1400)
  }
  function handleDelete(id){
    const list=loadSaved().filter(x=>x.id!==id)
    persistSaved(list);setSaved(list)
  }
  function handleItemCopy(item){
    copyText(item.url,()=>{setCopiedId(item.id);setTimeout(()=>setCopiedId(null),1600)})
  }

  if(authLoading) return <><Header/><main className="adminPage wide"><div className="adminPanel">Loading admin…</div></main><Footer/></>
  if(!session) return <><Header/><main className="adminPage wide"><section className="adminLogin adminPanel"><div className="eyebrow">MINT MEDIA ADMIN</div><h1>Sign in</h1><p>Use your Mint admin email and password.</p><form onSubmit={login}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{authError&&<div className="adminError">{authError}</div>}<button className="adminPrimary" disabled={busy}>{busy?'Signing in…':'Sign In'}</button></form></section></main><Footer/></>

  return <><Header/><main className="adminPage wide">
    <div className="adminTop">
      <div><div className="eyebrow">MINT MEDIA ADMIN</div><h1>Link Builder</h1><p>Name a link and get one back you can share and track.</p></div>
      <button className="adminGhost" onClick={()=>supabase.auth.signOut()}>Sign Out</button>
    </div>
    <AdminTabs active="links"/>

    <section className="adminPanel">
      <div className="adminForm">
        <label>Name this link
          <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Moshe's WhatsApp Status" autoFocus/>
        </label>
        <p className="linkHint">This is how you'll find it in your saved links and in Google Analytics.</p>

        <div className="linkPreview" style={{marginTop:18}}>
          <span className="linkPreviewLabel">{shortUrl?'Your link':shortening?'Shortening…':'Your link'}</span>
          <div className="linkPreviewUrl">{shortUrl||builtUrl}</div>
          {shortenFailed&&<div className="linkPreviewNote">Couldn't shorten it right now — the full link above still works and tracks the same.</div>}
        </div>

        <div className="adminChecks" style={{marginTop:18}}>
          <button type="button" className="adminPrimary" onClick={handleCopy}>{copyLabel}</button>
          <button type="button" className="adminSecondary" onClick={handleSave}>{saveLabel}</button>
        </div>
      </div>
    </section>

    <section className="adminPanel adminLibrary">
      <div className="adminPanelHead"><h2>Your saved links</h2><span>Stored on this device only</span></div>
      {saved.length===0
        ?<p className="adminEmptyHint">No saved links yet. Name one above and hit "Save to my links".</p>
        :<div className="linkSavedList">{saved.slice().reverse().map(item=>{
          const d=new Date(item.createdAt)
          const dateStr=isNaN(d)?'':d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})
          return <div className="linkItem" key={item.id}>
            <div className="linkItemTop"><strong>{item.name}</strong><span className="linkItemDate">{dateStr}</span></div>
            <div className="linkItemUrl">{item.url}</div>
            <div className="linkItemActions">
              <button type="button" className={`linkItemBtn${copiedId===item.id?' copied':''}`} onClick={()=>handleItemCopy(item)}>{copiedId===item.id?'Copied':'Copy'}</button>
              <button type="button" className="linkItemBtn danger" onClick={()=>handleDelete(item.id)}>Delete</button>
            </div>
          </div>
        })}</div>}
      <p className="linkFootnote">Clicks on these links show up in Google Analytics under Reports → Acquisition → Traffic acquisition — look for the name you gave it under Campaign. Saved links live only in this browser — they won't follow you to your phone or another computer.</p>
    </section>
  </main><Footer/></>
}
