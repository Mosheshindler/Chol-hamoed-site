'use client'

import {useEffect,useMemo,useState} from 'react'
import Link from 'next/link'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import {getSupabaseBrowserClient} from '../../../lib/supabaseClient'

const BASE='https://www.entertain-mint.com'
const STORAGE_KEY='emAdminLinks'

const DESTINATIONS=[
  {label:'Home',path:'/',hint:'Sends to your homepage.'},
  {label:'Premium Videos',path:'/category/premium-content',hint:'Sends to the Premium Content category.'},
  {label:'All Videos',path:'/category/all-videos',hint:'Sends to the All Videos page.'},
  {label:'Contact',path:'/contact',hint:'Sends to the Contact page.'},
  {label:'Other page…',path:null,hint:'Type the page path below, e.g. /watch/your-video-slug'}
]

const SOURCES=[
  {label:'Facebook',source:'facebook',medium:'social'},
  {label:'Instagram',source:'instagram',medium:'social'},
  {label:'WhatsApp',source:'whatsapp',medium:'social'},
  {label:'Email',source:'email',medium:'email'},
  {label:'Google Ads',source:'google',medium:'cpc'},
  {label:'Flyer / Print',source:'print',medium:'offline'},
  {label:'Other…',source:null,medium:null}
]

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

  const [campaign,setCampaign]=useState('')
  const [destIndex,setDestIndex]=useState(0)
  const [customPath,setCustomPath]=useState('')
  const [sourceIndex,setSourceIndex]=useState(0)
  const [customSource,setCustomSource]=useState('')
  const [customMedium,setCustomMedium]=useState('')
  const [saved,setSaved]=useState([])
  const [copyLabel,setCopyLabel]=useState('Copy link')
  const [saveLabel,setSaveLabel]=useState('Save to my links')
  const [copiedId,setCopiedId]=useState(null)

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

  const dest=DESTINATIONS[destIndex]
  const path=dest.path!==null?dest.path:((customPath.trim()?(customPath.trim()[0]==='/'?customPath.trim():'/'+customPath.trim()):'/'))
  const src=SOURCES[sourceIndex]
  const sourceValue=src.source!==null?src.source:(slugify(customSource)||'other')
  const mediumValue=src.medium!==null?src.medium:(slugify(customMedium)||'referral')
  const campaignValue=slugify(campaign)||'untitled'
  const builtUrl=`${BASE}${path}?utm_source=${encodeURIComponent(sourceValue)}&utm_medium=${encodeURIComponent(mediumValue)}&utm_campaign=${encodeURIComponent(campaignValue)}`

  function handleCopy(){
    copyText(builtUrl,()=>{setCopyLabel('Copied ✓');setTimeout(()=>setCopyLabel('Copy link'),1600)})
  }
  function handleSave(){
    const list=loadSaved()
    list.push({id:Date.now()+'-'+Math.random().toString(36).slice(2,7),name:campaign.trim()||'Untitled campaign',url:builtUrl,createdAt:Date.now()})
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
      <div><div className="eyebrow">MINT MEDIA ADMIN</div><h1>Campaign Link Builder</h1><p>Name a campaign, pick where it's going and where you're sharing it, and get back a tracking link.</p></div>
      <div className="adminTopActions"><Link href="/admin" className="adminGhost">← Video Library</Link><button className="adminGhost" onClick={()=>supabase.auth.signOut()}>Sign Out</button></div>
    </div>

    <section className="adminPanel">
      <div className="adminForm">
        <label>What's this link for?
          <input type="text" value={campaign} onChange={e=>setCampaign(e.target.value)} placeholder="e.g. Fall Flyer 2026, Chanukah Promo, Rabbi Klein Shoutout"/>
        </label>
        <p className="linkHint">This becomes the campaign name you'll see in your reports.</p>

        <div className="adminLabel" style={{marginTop:18}}>Where should it send people?</div>
        <div className="linkChips">{DESTINATIONS.map((d,i)=><button type="button" key={d.label} className={`linkChip${i===destIndex?' active':''}`} onClick={()=>setDestIndex(i)}>{d.label}</button>)}</div>
        {dest.path===null&&<input type="text" value={customPath} onChange={e=>setCustomPath(e.target.value)} placeholder="/watch/your-video-slug" style={{marginTop:10}}/>}
        <p className="linkHint">{dest.hint}</p>

        <div className="adminLabel" style={{marginTop:18}}>Where are you sharing it?</div>
        <div className="linkChips">{SOURCES.map((s,i)=><button type="button" key={s.label} className={`linkChip${i===sourceIndex?' active':''}`} onClick={()=>setSourceIndex(i)}>{s.label}</button>)}</div>
        {src.source===null&&<div className="adminGrid" style={{gridTemplateColumns:'1fr 1fr',marginTop:10}}>
          <input type="text" value={customSource} onChange={e=>setCustomSource(e.target.value)} placeholder="e.g. flyer, tv, radio"/>
          <input type="text" value={customMedium} onChange={e=>setCustomMedium(e.target.value)} placeholder="e.g. print, broadcast"/>
        </div>}

        <div className="linkPreview">
          <span className="linkPreviewLabel">Your tracking link</span>
          <div className="linkPreviewUrl">{builtUrl}</div>
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
        ?<p className="adminEmptyHint">No saved links yet. Build one above and hit "Save to my links".</p>
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
      <p className="linkFootnote">Clicks on these links show up in Google Analytics under Reports → Acquisition → Traffic acquisition, grouped by the source, medium and campaign name you picked. Saved links live only in this browser — they won't follow you to your phone or another computer.</p>
    </section>
  </main><Footer/></>
}
