'use client'

import {useEffect,useMemo,useState} from 'react'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import AdminTabs from '../../../components/AdminTabs'
import {getSupabaseBrowserClient} from '../../../lib/supabaseClient'

const BASE='https://www.entertain-mint.com'
// Fixed since the tool no longer asks where the link is going or being shared — the
// name the user gives it (utm_campaign) is what tells links apart in GA4's reports.
const UTM_SOURCE='shared_link'
const UTM_MEDIUM='referral'

function slugify(value){
  return (value||'').toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')
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
  const [createdCode,setCreatedCode]=useState(null)
  const [creatingLink,setCreatingLink]=useState(false)

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setAuthLoading(false)})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>setSession(next))
    return ()=>subscription.unsubscribe()
  },[supabase])

  async function loadSaved(){
    const {data,error}=await supabase.from('short_links').select('*').eq('saved',true).order('created_at',{ascending:false})
    if(!error) setSaved(data||[])
  }

  useEffect(()=>{if(session) loadSaved()},[session])

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
    setShortUrl('');setCreatedCode(null);setCreatingLink(true)
    // A same-domain redirect instead of a third-party shortener — TinyURL's free,
    // unauthenticated links show a "click to continue" interstitial page before
    // reaching the destination, which meant every shared link took two clicks. The code
    // is a short random one (not the campaign name) so the link doesn't look like a full
    // sentence — the campaign name is stored alongside it and looked up on click instead.
    let code=null
    for(let attempt=0;attempt<3 && !code;attempt++){
      const candidate=randomCode()
      const {error}=await supabase.from('short_links').insert({code:candidate,campaign:campaignValue,display_name:name.trim()})
      if(!error) code=candidate
      else if(error.code!=='23505') break // not a code collision (e.g. table not set up yet) — stop retrying
    }
    // Falls back to the old (full-name) link if short_links isn't set up in Supabase yet,
    // or the insert failed for some other reason — still works, just less short. "Save to
    // my links" needs a real row to mark saved, so it's disabled in that fallback case.
    setCreatedCode(code)
    setShortUrl(`${BASE}/l/${code||campaignValue}`)
    setCreatingLink(false)
  }

  const copyValue=shortUrl||builtUrl

  function handleCopy(){
    copyText(copyValue,()=>{setCopyLabel('Copied ✓');setTimeout(()=>setCopyLabel('Copy link'),1600)})
  }
  async function handleSave(){
    if(!createdCode) return
    const {error}=await supabase.from('short_links').update({saved:true}).eq('code',createdCode)
    if(error) return
    setSaveLabel('Saved ✓');setTimeout(()=>setSaveLabel('Save to my links'),1400)
    await loadSaved()
  }
  async function handleDelete(item){
    const {error}=await supabase.from('short_links').update({saved:false}).eq('code',item.code)
    if(error) return
    setSaved(list=>list.filter(x=>x.code!==item.code))
  }
  function handleItemCopy(item){
    copyText(`${BASE}/l/${item.code}`,()=>{setCopiedId(item.code);setTimeout(()=>setCopiedId(null),1600)})
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
            <button type="button" className="adminSecondary" onClick={handleSave} disabled={creatingLink||!createdCode} title={createdCode?undefined:"Can't save — this link didn't get a database row (see the short link setup)"}>{saveLabel}</button>
          </div>
        </>}
      </form>
    </section>

    <section className="adminPanel adminLibrary">
      <div className="adminPanelHead"><h2>Saved links</h2><span>Shared with anyone who logs into admin</span></div>
      {saved.length===0
        ?<p className="adminEmptyHint">No saved links yet. Name one above and hit "Create Link".</p>
        :<div className="linkSavedList">{saved.map(item=>{
          const d=new Date(item.created_at)
          const dateStr=isNaN(d)?'':d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})
          return <div className="linkItem" key={item.code}>
            <div className="linkItemTop"><strong>{item.display_name||item.campaign}</strong><span className="linkItemDate">{dateStr}</span></div>
            <div className="linkItemUrl">{`${BASE}/l/${item.code}`}</div>
            <div className="linkItemActions">
              <button type="button" className={`linkItemBtn${copiedId===item.code?' copied':''}`} onClick={()=>handleItemCopy(item)}>{copiedId===item.code?'Copied':'Copy'}</button>
              <button type="button" className="linkItemBtn danger" onClick={()=>handleDelete(item)}>Delete</button>
            </div>
          </div>
        })}</div>}
      <p className="linkFootnote">Clicks on these links show up in Google Analytics under Reports → Acquisition → Traffic acquisition — look for the name you gave it under Campaign. Saved links are shared — anyone who logs into admin sees the same list, on any device.</p>
    </section>
  </main><Footer/></>
}
