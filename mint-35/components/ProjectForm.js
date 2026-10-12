'use client'

import {useRef, useState} from 'react'
import {formats} from './formats'
import {createClient} from '@/lib/supabase/browser'

const placements = ['Social', 'Paid Advertising', 'YouTube', 'Website', 'Digital Signage', 'Streaming', 'Other']

// Saves the questionnaire through /api/projects, then uploads files straight to storage
// with the signed URLs it returns, then confirms so the team gets notified.
export default function ProjectForm({packageName, orgOnly}) {
  const [state, setState] = useState({phase: 'idle'})
  const formRef = useRef(null)

  async function onSubmit(e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const logo = fd.get('logo')
    const images = fd.getAll('images').filter(f => f && f.size > 0)
    const files = [...(logo && logo.size > 0 ? [{file: logo, kind: 'logo'}] : []), ...images.map(file => ({file, kind: 'brand_image'}))]

    const payload = {
      _honey: fd.get('_honey'),
      name: fd.get('name'), email: fd.get('email'), company: fd.get('company'), website: fd.get('website'),
      package: packageName,
      promoting: fd.get('promoting'), audience: fd.get('audience'), key_message: fd.get('key_message'),
      desired_action: fd.get('desired_action'), must_appear: fd.get('must_appear'),
      placements: fd.getAll('placements'), placement_other: fd.get('placement_other'),
      orientation: fd.get('orientation'), ideal_date: fd.get('ideal_date'),
      brand_colors: fd.get('brand_colors'), legal_text: fd.get('legal_text'),
      restrictions: fd.get('restrictions'), references_links: fd.get('references_links'),
      files: files.map(f => ({name: f.file.name, size: f.file.size, kind: f.kind})),
    }

    setState({phase: 'saving'})
    try {
      const res = await fetch('/api/projects', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)})
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      if (!data.id) { setState({phase: 'done', ref: null}); return }

      const supabase = createClient()
      const uploaded = []
      for (const u of data.uploads) {
        setState({phase: 'uploading', done: uploaded.length, total: data.uploads.length})
        const f = files[u.index]
        const {error} = await supabase.storage.from('project-files').uploadToSignedUrl(u.path, u.token, f.file, {contentType: f.file.type || undefined})
        if (!error) uploaded.push({path: u.path, name: f.file.name, kind: f.kind})
      }

      await fetch(`/api/projects/${data.id}/complete`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({intakeToken: data.intakeToken, files: uploaded}),
      })
      setState({phase: 'done', ref: `M35-${data.number}`, missed: data.uploads.length - uploaded.length})
      formRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'})
    } catch (err) {
      setState({phase: 'error', message: err.message})
    }
  }

  if (state.phase === 'done') {
    return (
      <div id="project-form" ref={formRef} className="form form-done" role="status">
        <span className="done-check" aria-hidden="true">✓</span>
        <h2>Got it. We&rsquo;re on it.</h2>
        {state.ref && <p className="done-ref">Your reference number is <b>{state.ref}</b>.</p>}
        <p>We&rsquo;ll review your project and email you a price. Nothing is charged until we start your job.</p>
        {state.missed > 0 && <p className="form-error">{state.missed} file(s) didn&rsquo;t upload. Reply to our email and attach them there.</p>}
      </div>
    )
  }

  const busy = state.phase === 'saving' || state.phase === 'uploading'

  return (
    <form id="project-form" ref={formRef} className="form" onSubmit={onSubmit}>
      <input type="text" name="_honey" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <h1 id="form-title">Tell us what we&rsquo;re making.</h1>

      <div className="form-row">
        <label>Name<input name="name" required autoComplete="name" /></label>
        <label>Email<input type="email" name="email" required autoComplete="email" /></label>
      </div>
      <div className="form-row">
        {orgOnly
          ? <label>Organization name<input name="company" autoComplete="organization" required /></label>
          : <label>Company / Organization<input name="company" autoComplete="organization" /></label>}
        <label>Website<input name="website" placeholder="https://" autoComplete="url" /></label>
      </div>

      <label>What are you promoting?<textarea name="promoting" rows={2} required /></label>
      <label>Who is your target audience?
        <span className="hint">Age range, gender, location, interests, community.</span>
        <textarea name="audience" rows={2} required />
      </label>
      <label>What&rsquo;s the single most important thing they should know?<textarea name="key_message" rows={2} required /></label>
      <label>What do you want them to do after watching?<textarea name="desired_action" rows={2} required /></label>
      <label>What offer, price or information MUST appear?<textarea name="must_appear" rows={2} /></label>

      <fieldset>
        <legend>Where will the commercial run?</legend>
        <div className="checks">
          {placements.map(p => (
            <label key={p} className="check"><input type="checkbox" name="placements" value={p} />{p}</label>
          ))}
        </div>
        <input name="placement_other" className="other-input" placeholder="If other, where?" aria-label="Other placement" />
      </fieldset>

      <fieldset>
        <legend className="legend-row">
          <span>Which orientation do you need?</span>
          <button type="button" className="info-link" data-open="formats-dialog">What&rsquo;s the difference?<span className="info-i" aria-hidden="true">i</span></button>
        </legend>
        <div className="orient">
          {formats.map(f => (
            <label key={f.ratio} className="orient-opt">
              <input type="radio" name="orientation" value={`${f.ratio} ${f.name}`} required />
              <span className={`frame frame-${f.ratio.replace(':', '-')}`} aria-hidden="true" />
              <b>{f.ratio}</b>
              <span className="orient-name">{f.name}</span>
            </label>
          ))}
          <label className="orient-opt">
            <input type="radio" name="orientation" value="Not sure - recommend one" />
            <span className="frame frame-unsure" aria-hidden="true">?</span>
            <b>Not sure</b>
            <span className="orient-name">Recommend one for me</span>
          </label>
        </div>
      </fieldset>

      <label>When would you ideally like it delivered?
        <span className="hint">Subject to availability. First cut arrives 3 business days after production begins.</span>
        <input type="date" name="ideal_date" />
      </label>

      <div className="form-row">
        <label>Upload your logo<input type="file" name="logo" accept="image/*,.pdf,.svg,.ai,.eps" /></label>
        <label>Upload product / brand images<input type="file" name="images" accept="image/*" multiple /></label>
      </div>
      <label>Brand colors<input name="brand_colors" placeholder="e.g. #88C040, deep green, white" /></label>
      <label>Required text / legal language<textarea name="legal_text" rows={2} /></label>
      <label>Anything we absolutely cannot do?<textarea name="restrictions" rows={2} /></label>
      <label><span>Creative references or links <span className="optional">— optional</span></span><textarea name="references_links" rows={2} /></label>

      <div className="before">
        <h3>Before you submit</h3>
        <ul className="ticks">
          <li>Double-check names, prices, dates, URLs and phone numbers.</li>
          <li>You get one script approval and one revision round.</li>
          <li>The 3-day clock starts after script approval.</li>
          <li>Extra revisions or scope changes are quoted separately.</li>
        </ul>
      </div>

      {state.phase === 'error' && <p className="form-error" role="alert">{state.message}</p>}

      <button type="submit" className="btn btn-primary" disabled={busy}>
        {state.phase === 'saving' ? 'Sending…' : state.phase === 'uploading' ? `Uploading files ${state.done + 1}/${state.total}…` : 'Submit My Project'}
      </button>
    </form>
  )
}
