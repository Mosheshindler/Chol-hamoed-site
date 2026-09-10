'use client'

import {useEffect,useMemo,useState} from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import {getSupabaseBrowserClient} from '../../lib/supabaseClient'

const CATEGORY_OPTIONS=['Stories','Documentaries','Entertainment','Music Videos','Q&A','Behind the Scenes','Events & Highlights','Shorts','Premium Content','Inspirational','Fundraising Film','Schools & Yeshivos','Community','Education','Jewish Life','Event Opener']
const emptyForm={id:null,title:'',slug:'',video_url:'',platform:'vimeo',vimeo_hash:'',client:'Mint Media',category:'Behind the Scenes',categories:['Behind the Scenes'],tags:'',thumbnail_url:'',hero_image_url:'',duration_seconds:'',featured:false,premium:false,purchase_url:'',published:true,sort_order:0}

function slugify(value){
  return value.toLowerCase().trim().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'video'
}

export default function AdminPage(){
  const supabase=useMemo(()=>getSupabaseBrowserClient(),[])
  const [session,setSession]=useState(null)
  const [authLoading,setAuthLoading]=useState(true)
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [authError,setAuthError]=useState('')
  const [videos,setVideos]=useState([])
  const [form,setForm]=useState(emptyForm)
  const [thumbFile,setThumbFile]=useState(null)
  const [heroFile,setHeroFile]=useState(null)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setAuthLoading(false)})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>setSession(next))
    return ()=>subscription.unsubscribe()
  },[supabase])

  useEffect(()=>{if(session) loadVideos()},[session])

  async function loadVideos(){
    const {data,error}=await supabase.from('videos').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false})
    if(error){setMessage(error.message);return}
    setVideos(data||[])
  }

  async function login(e){
    e.preventDefault();setAuthError('');setBusy(true)
    const {error}=await supabase.auth.signInWithPassword({email,password})
    if(error)setAuthError(error.message)
    setBusy(false)
  }

  async function fetchDetails(){
    if(!form.video_url){setMessage('Paste a Vimeo or YouTube URL first.');return}
    setBusy(true);setMessage('Reading video details…')
    try{
      const r=await fetch('/api/video-meta',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:form.video_url})})
      const data=await r.json()
      if(!r.ok) throw new Error(data.error||'Could not fetch video details.')
      setForm(f=>({...f,
        platform:data.platform,
        vimeo_hash:data.vimeoHash||'',
        title:f.title||data.title||'',
        thumbnail_url:data.thumbnailUrl||f.thumbnail_url,
        duration_seconds:data.durationSeconds??f.duration_seconds
      }))
      setMessage('Video details loaded. You can change any field before publishing.')
    }catch(err){setMessage(err.message)}finally{setBusy(false)}
  }

  async function uniqueSlug(base,currentId){
    let candidate=base,n=2
    while(true){
      let q=supabase.from('videos').select('id').eq('slug',candidate).limit(1)
      const {data,error}=await q
      if(error) throw error
      if(!data?.length || data[0].id===currentId) return candidate
      candidate=`${base}-${n++}`
    }
  }

  async function uploadImage(file,slug,prefix='thumb'){
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase()
    const safeExt=['jpg','jpeg','png','webp'].includes(ext)?ext:'jpg'
    const path=`${prefix}-${slug}-${Date.now()}.${safeExt}`
    const {error}=await supabase.storage.from('video-thumbnails').upload(path,file,{upsert:false,contentType:file.type||undefined})
    if(error) throw error
    const {data}=supabase.storage.from('video-thumbnails').getPublicUrl(path)
    return data.publicUrl
  }

  async function saveVideo(e){
    e.preventDefault();setBusy(true);setMessage('Saving…')
    try{
      if(!form.title.trim()) throw new Error('Title is required.')
      if(!form.video_url.trim()) throw new Error('Video URL is required.')
      if(!(form.categories||[]).length) throw new Error('Choose at least one category.')
      let base=slugify(form.slug||form.title)
      const slug=await uniqueSlug(base,form.id)
      let thumbnail=form.thumbnail_url
      if(thumbFile) thumbnail=await uploadImage(thumbFile,slug,'thumb')
      let heroImage=form.hero_image_url||null
      if(heroFile) heroImage=await uploadImage(heroFile,slug,'hero')
      const payload={
        title:form.title.trim(),slug,video_url:form.video_url.trim(),platform:form.platform,vimeo_hash:form.vimeo_hash||null,
        client:form.client?.trim()||null,category:(form.categories?.[0]||form.category||null),categories:(form.categories?.length?form.categories:[form.category].filter(Boolean)),tags:(form.tags||'').split(',').map(s=>s.trim()).filter(Boolean),thumbnail_url:thumbnail||null,hero_image_url:heroImage,
        duration_seconds:form.duration_seconds===''?null:Number(form.duration_seconds),featured:Boolean(form.featured),premium:Boolean(form.premium),purchase_url:form.premium?(form.purchase_url?.trim()||null):null,published:Boolean(form.published),sort_order:Number(form.sort_order)||0
      }
      const result=form.id
        ? await supabase.from('videos').update(payload).eq('id',form.id).select().single()
        : await supabase.from('videos').insert(payload).select().single()
      if(result.error) throw result.error
      setForm(emptyForm);setThumbFile(null);setHeroFile(null);setMessage(form.id?'Video updated.':'Video published.');await loadVideos()
    }catch(err){setMessage(err.message||'Could not save video.')}finally{setBusy(false)}
  }

  function editVideo(v){
    setForm({...emptyForm,...v,categories:(Array.isArray(v.categories)&&v.categories.length?v.categories:[v.category].filter(Boolean)),tags:(Array.isArray(v.tags)?v.tags.join(', '):''),duration_seconds:v.duration_seconds??''});setThumbFile(null);setHeroFile(null);setMessage('Editing video.');window.scrollTo({top:0,behavior:'smooth'})
  }

  async function moveVideo(index,direction){
    const target=index+direction
    if(target<0 || target>=videos.length) return
    const reordered=[...videos]
    const [moved]=reordered.splice(index,1)
    reordered.splice(target,0,moved)
    setVideos(reordered)
    setBusy(true);setMessage('Saving new order…')
    try{
      await Promise.all(reordered.map((v,i)=>supabase.from('videos').update({sort_order:i}).eq('id',v.id)))
      setMessage('Order updated.')
      await loadVideos()
    }catch(err){setMessage(err.message||'Could not save new order.');await loadVideos()}
    finally{setBusy(false)}
  }

  async function removeVideo(v){
    if(!confirm(`Delete “${v.title}”?`)) return
    const {error}=await supabase.from('videos').delete().eq('id',v.id)
    if(error)setMessage(error.message);else{setMessage('Video deleted.');loadVideos()}
  }

  if(authLoading) return <><Header/><main className="adminPage wide"><div className="adminPanel">Loading admin…</div></main><Footer/></>
  if(!session) return <><Header/><main className="adminPage wide"><section className="adminLogin adminPanel"><div className="eyebrow">MINT MEDIA ADMIN</div><h1>Sign in</h1><p>Use your Mint admin email and password.</p><form onSubmit={login}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{authError&&<div className="adminError">{authError}</div>}<button className="adminPrimary" disabled={busy}>{busy?'Signing in…':'Sign In'}</button></form></section></main><Footer/></>

  return <><Header/><main className="adminPage wide">
    <div className="adminTop"><div><div className="eyebrow">MINT MEDIA ADMIN</div><h1>Video Library</h1><p>Add Vimeo or YouTube videos without touching code.</p></div><button className="adminGhost" onClick={()=>supabase.auth.signOut()}>Sign Out</button></div>
    <section className="adminPanel">
      <div className="adminPanelHead"><h2>{form.id?'Edit Video':'Add Video'}</h2>{form.id&&<button className="adminGhost" onClick={()=>{setForm(emptyForm);setThumbFile(null);setHeroFile(null);setMessage('')}}>Cancel Edit</button>}</div>
      <form className="adminForm" onSubmit={saveVideo}>
        <div className="adminUrlRow"><label>{form.premium?'Promo Vimeo or YouTube URL':'Vimeo or YouTube URL'}<input value={form.video_url} onChange={e=>setForm({...form,video_url:e.target.value})} placeholder="https://vimeo.com/…" required/></label><button type="button" className="adminSecondary" onClick={fetchDetails} disabled={busy}>Fetch Details</button></div>
        <div className="adminGrid"><label>Title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></label><label>Client<input value={form.client||''} onChange={e=>setForm({...form,client:e.target.value})}/></label><div className="adminCategoryField"><div className="adminLabel">Categories <span className="optionalLabel">(choose all that apply)</span></div><div className="adminCategoryChecks">{CATEGORY_OPTIONS.map(c=><label key={c}><input type="checkbox" checked={(form.categories||[]).includes(c)} onChange={e=>setForm(f=>({...f,categories:e.target.checked?[...(f.categories||[]),c]:(f.categories||[]).filter(x=>x!==c)}))}/>{c}</label>)}</div></div><label>Duration (seconds)<input type="number" min="0" value={form.duration_seconds} onChange={e=>setForm({...form,duration_seconds:e.target.value})} placeholder="Auto when available"/></label><label>Sort order<input type="number" value={form.sort_order} onChange={e=>setForm({...form,sort_order:e.target.value})}/></label><label>URL slug<input value={form.slug||''} onChange={e=>setForm({...form,slug:e.target.value})} placeholder="Auto from title"/></label><label className="adminTagsField">Tags <span className="optionalLabel">(comma separated, optional)</span><input value={form.tags||''} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="e.g. wedding, kids, chesed"/></label></div>
        <div className="adminThumb"><div><div className="adminLabel">Thumbnail</div><div className="adminThumbPreview" style={{backgroundImage:form.thumbnail_url?`url(${form.thumbnail_url})`:undefined}}>{!form.thumbnail_url&&'No thumbnail yet'}</div></div><div className="adminThumbActions"><label className="adminFile">Upload custom thumbnail<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setThumbFile(e.target.files?.[0]||null)}/></label>{thumbFile&&<div className="adminFileName">Custom image selected: {thumbFile.name}</div>}<label>Thumbnail URL<input value={form.thumbnail_url||''} onChange={e=>setForm({...form,thumbnail_url:e.target.value})} placeholder="Auto-filled from Vimeo/YouTube"/></label><p>Leave the automatic thumbnail, paste another image URL, or upload your own. A custom upload takes priority when you save.</p></div></div>
        <div className="adminThumb adminHeroUpload"><div><div className="adminLabel">Homepage Hero Image <span className="optionalLabel">(optional)</span></div><div className="adminThumbPreview heroPreview" style={{backgroundImage:form.hero_image_url?`url(${form.hero_image_url})`:undefined}}>{!form.hero_image_url&&'Uses thumbnail if left blank'}</div></div><div className="adminThumbActions"><label className="adminFile">Upload hero image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setHeroFile(e.target.files?.[0]||null)}/></label>{heroFile&&<div className="adminFileName">Hero image selected: {heroFile.name}</div>}<label>Hero Image URL<input value={form.hero_image_url||''} onChange={e=>setForm({...form,hero_image_url:e.target.value})} placeholder="Optional — for Featured homepage carousel"/></label><p>Recommended: a clean, wide image without important text near the edges. If this is blank, the homepage hero automatically uses the normal video thumbnail.</p></div></div>
        {form.premium&&<div className="premiumAdminBox"><label>Mostly Music Full Video URL<input type="url" value={form.purchase_url||''} onChange={e=>setForm({...form,purchase_url:e.target.value})} placeholder="https://mostlymusic.com/…" required={form.premium}/></label><p>Premium videos use the Vimeo/YouTube URL above as the Yidly preview. Viewers will watch the preview on Mint, then click through to Mostly Music for the full video.</p></div>}<div className="adminChecks"><label><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Featured on homepage</label><label><input type="checkbox" checked={form.premium} onChange={e=>setForm({...form,premium:e.target.checked})}/> Premium</label><label><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/> Published</label></div>
        {message&&<div className="adminMessage">{message}</div>}
        <button className="adminPrimary" disabled={busy}>{busy?'Saving…':form.id?'Save Changes':'Publish Video'}</button>
      </form>
    </section>
    <section className="adminPanel adminLibrary"><div className="adminPanelHead"><h2>Existing Videos</h2><span>{videos.length} videos</span></div>{videos.length===0?<p>No videos yet.</p>:videos.map((v,i)=><div className="adminVideoRow" key={v.id}><div className="adminReorder"><button type="button" className="adminGhost adminReorderBtn" disabled={i===0||busy} onClick={()=>moveVideo(i,-1)} aria-label="Move up">↑</button><button type="button" className="adminGhost adminReorderBtn" disabled={i===videos.length-1||busy} onClick={()=>moveVideo(i,1)} aria-label="Move down">↓</button></div><div className="adminMiniThumb" style={{backgroundImage:v.thumbnail_url?`url(${v.thumbnail_url})`:undefined}}/><div className="adminVideoInfo"><strong>{v.title}</strong><span>{v.client||'Mint Media'} · {(v.categories?.length?v.categories.join(' + '):(v.category||'Video'))}{v.published?'':' · Draft'}</span>{Array.isArray(v.tags)&&v.tags.length>0&&<span className="adminTagsList">{v.tags.map(t=><em key={t} className="adminTagChip">{t}</em>)}</span>}</div><div className="adminBadges">{v.featured&&<span className="adminBadge">Featured</span>}{v.premium&&<span className="adminBadge premiumBadge">Premium</span>}{!v.published&&<span className="adminBadge draftBadge">Draft</span>}</div><button className="adminGhost" onClick={()=>editVideo(v)}>Edit</button><button className="adminDanger" onClick={()=>removeVideo(v)}>Delete</button></div>)}</section>
  </main><Footer/></>
}
