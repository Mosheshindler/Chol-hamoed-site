'use client'

import {useEffect,useMemo,useState} from 'react'
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

  // A link only exists once "Create Link" (or Enter) is hit — typing alone doesn't
  // build or shorten anything, so nothing calls out until the name is finished.
  const [created,setCreated]=useState(false)
  const [createdFor,setCreatedFor]=useState('')
  const [builtUrl,setBuiltUrl]=useState('')
  const [shortUrl,setShortUrl]=useState('')
  const [creatingLink,setCreatingLink]=useState(false)

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

  function handleNameChange(e){
    setName(e.target.value)
    // The name changed since the last create — the old link no longer matches it,
    // so hide it rather than show a link for a name that's since been edited.
    if(created) setCreated(false)
  }

  // Short codes are 6 random lowercase/digit characters — plenty of combinations that a
  // collision is essentially never going to happen, but retried a couple of times just in
  // case two people create a link at the exact same moment.
  function randomCode(){
    const chars='abcdefghijklmnopqrstuvwxyz0123456789'
    let code=''
    for(let i=0;i<6;i++) code+=chars[Math.floor(Math.random()*chars.length)]
    return code
  }

  async function handleCreate(e){
    e.preventDefault()
    if(!name.trim()) return
    const campaignValue=slugify(name)||'untitled'
    const url=`${BASE}/?utm_source=${UTM_SOURCE}&utm_medium=${UTM_MEDIUM}&utm_campaign=${encodeURIComponent(campaignValue)}`
    setBuiltUrl(url);setCreatedFor(name.trim());setCreated(true)
    setShortUrl('');setCreatingLink(true)
    // A same-domain redirect instead of a third-party shortener — TinyURL's free,
    // unauthenticated links show a "click to continue" interstitial page before
    // reaching the destination, which meant every shared link took two clicks. The code
    // is a short random one (not the campaign name) so the link doesn't look like a full
    // sentence — the campaign name is stored alongside it and looked up on click instead.
    let code=null
    for(let attempt=0;attempt<3 && !code;attempt++){
      const candidate=randomCode()
      const {error}=await supabase.from('short_links').insert({code:candidate,campaign:campaignValue})
      if(!error) code=candidate
      else if(error.code!=='23505') break // not a code collision (e.g. table not set up yet) — stop retrying
    }
    // Falls back to the old (full-name) link if short_links isn't set up in Supabase yet,
    // or the insert failed for some other reason — still works, just less short.
    setShortUrl(`${BASE}/l/${code||campaignValue}`)
    setCreatingLink(false)
  }

  const copyValue=shortUrl||builtUrl

  function handleCopy(){
    copyText(copyValue,()=>{setCopyLabel('Copied ✓');setTimeout(()=>setCopyLabel('Copy link'),1600)})
  }
  function handleSave(){
    const list=loadSaved()
    list.push({id:Date.now()+'-'+Math.random().toString(36).slice(2,7),name:createdFor||'Untitled link',url:copyValue,fullUrl:builtUrl,createdAt:Date.now()})
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
      <form className="adminForm" onSubmit={handleCreate}>
        <label>Name this link
          <input type="text" value={name} onChange={handleNameChange} placeholder="e.g. Moshe's WhatsApp Status" autoFocus/>
        </label>
        <p className="linkHint">This is how you'll find it in your saved links and in Google Analytics.</p>

        <div className="linkActions" style={{marginTop:14}}>
          <button type="submit" className="adminPrimary" disabled={!name.trim()||creatingLink}>{creatingLink?'Creating…':'Create Link'}</button>
        </div>

        {created&&<>
          <div className="linkPreview" style={{marginTop:18}}>
            <span className="linkPreviewLabel">Your link</span>
            <div className="linkPreviewUrl">{creatingLink?'Creating your link…':(shortUrl||builtUrl)}</div>
          </div>

          <div className="linkActions" style={{marginTop:14}}>
            <button type="button" className="adminPrimary" onClick={handleCopy} disabled={creatingLink}>{copyLabel}</button>
            <button type="button" className="adminSecondary" onClick={handleSave} disabled={creatingLink}>{saveLabel}</button>
          </div>
        </>}
      </form>
    </section>

    <section className="adminPanel adminLibrary">
      <div className="adminPanelHead"><h2>Your saved links</h2><span>Stored on this device only</span></div>
      {saved.length===0
        ?<p className="adminEmptyHint">No saved links yet. Name one above and hit "Create Link".</p>
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
