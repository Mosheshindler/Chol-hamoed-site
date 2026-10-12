'use client'

import {useState} from 'react'
import {formats} from './formats'
import {createClient} from '@/lib/supabase/browser'
import {formatPrice} from '@/lib/packages'

const placements = ['Social', 'Paid Advertising', 'YouTube', 'Website', 'Digital Signage', 'Streaming', 'Other']

// One form for the whole order: contact and brand details once, then a project brief per package.
// Saves through /api/projects, uploads files straight to storage with the signed URLs it returns,
// then confirms so the team gets notified.
export default function ProjectForm({lines, onDone}) {
  const [state, setState] = useState({phase: 'idle'})
  const orgRequired = lines.some(l => l.pkg.orgOnly)
  const many = lines.length > 1

  async function onSubmit(e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const logo = fd.get('logo')
    const images = fd.getAll('images').filter(f => f && f.size > 0)
    const files = [...(logo && logo.size > 0 ? [{file: logo, kind: 'logo'}] : []), ...images.map(file => ({file, kind: 'brand_image'}))]
    const g = (i, k) => fd.get(`i${i}_${k}`)

    const payload = {
      _honey: fd.get('_honey'),
      name: fd.get('name'), email: fd.get('email'), company: fd.get('company'), website: fd.get('website'),
      brand_colors: fd.get('brand_colors'), legal_text: fd.get('legal_text'), restrictions: fd.get('restrictions'),
      items: lines.map((l, i) => ({
        package: l.pkg.name,
        promoting: g(i, 'promoting'), audience: g(i, 'audience'), key_message: g(i, 'key_message'),
        desired_action: g(i, 'desired_action'), must_appear: g(i, 'must_appear'),
        placements: fd.getAll(`i${i}_placements`), placement_other: g(i, 'placement_other'),
        orientation: g(i, 'orientation'), ideal_date: g(i, 'ideal_date'), references_links: g(i, 'references_links'),
      })),
      files: files.map(f => ({name: f.file.name, size: f.file.size, kind: f.kind})),
    }

    setState({phase: 'saving'})
    try {
      const res = await fetch('/api/projects', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)})
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      if (!data.id) { onDone({refs: []}); return }

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
      onDone({refs: data.refs, missed: data.uploads.length - uploaded.length})
      window.scrollTo({top: 0, behavior: 'smooth'})
    } catch (err) {
      setState({phase: 'error', message: err.message})
    }
  }

  const busy = state.phase === 'saving' || state.phase === 'uploading'

  return (
    <form id="project-form" className="form" onSubmit={onSubmit}>
      <input type="text" name="_honey" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <h1 id="form-title">Tell us what we&rsquo;re making.</h1>

      <fieldset className="form-section">
        <legend className="section-title">About you</legend>
        <div className="form-row">
          <label>Name<input name="name" required autoComplete="name" /></label>
          <label>Email<input type="email" name="email" required autoComplete="email" /></label>
        </div>
        <div className="form-row">
          {orgRequired
            ? <label>Organization name<input name="company" autoComplete="organization" required /></label>
            : <label>Company / Organization<input name="company" autoComplete="organization" /></label>}
          <label>Website<input name="website" placeholder="https://" autoComplete="url" /></label>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend className="section-title">Your brand <span className="optional">— used for every project in this order</span></legend>
        <div className="form-row">
          <label>Upload your logo<input type="file" name="logo" accept="image/*,.pdf,.svg,.ai,.eps" /></label>
          <label>Upload product / brand images<input type="file" name="images" accept="image/*" multiple /></label>
        </div>
        <label>Brand colors<input name="brand_colors" placeholder="e.g. #88C040, deep green, white" /></label>
        <label>Required text / legal language<textarea name="legal_text" rows={2} /></label>
        <label>Anything we absolutely cannot do?<textarea name="restrictions" rows={2} /></label>
      </fieldset>

      {lines.map((l, i) => (
        <fieldset key={l.id} className="form-section project-section">
          <legend className="section-title">
            {many ? `Project ${i + 1} of ${lines.length}: ` : 'Your project: '}{l.pkg.name}
            {l.pkg.price ? <span className="section-price">{formatPrice(l.pkg.price)}</span> : null}
          </legend>
          <label>What are you promoting?<textarea name={`i${i}_promoting`} rows={2} required /></label>
          <label>Who is your target audience?
            <span className="hint">Age range, gender, location, interests, community.</span>
            <textarea name={`i${i}_audience`} rows={2} required />
          </label>
          <label>What&rsquo;s the single most important thing they should know?<textarea name={`i${i}_key_message`} rows={2} required /></label>
          <label>What do you want them to do after watching?<textarea name={`i${i}_desired_action`} rows={2} required /></label>
          <label>What offer, price or information MUST appear?<textarea name={`i${i}_must_appear`} rows={2} /></label>

          <fieldset>
            <legend>Where will it run?</legend>
            <div className="checks">
              {placements.map(p => (
                <label key={p} className="check"><input type="checkbox" name={`i${i}_placements`} value={p} />{p}</label>
              ))}
            </div>
            <input name={`i${i}_placement_other`} className="other-input" placeholder="If other, where?" aria-label="Other placement" />
          </fieldset>

          <fieldset>
            <legend className="legend-row">
              <span>Which orientation do you need?</span>
              <button type="button" className="info-link" data-open="formats-dialog">What&rsquo;s the difference?<span className="info-i" aria-hidden="true">i</span></button>
            </legend>
            <div className="orient">
              {formats.map(f => (
                <label key={f.ratio} className="orient-opt">
                  <input type="radio" name={`i${i}_orientation`} value={`${f.ratio} ${f.name}`} required />
                  <span className={`frame frame-${f.ratio.replace(':', '-')}`} aria-hidden="true" />
                  <b>{f.ratio}</b>
                  <span className="orient-name">{f.name}</span>
                </label>
              ))}
              <label className="orient-opt">
                <input type="radio" name={`i${i}_orientation`} value="Not sure - recommend one" />
                <span className="frame frame-unsure" aria-hidden="true">?</span>
                <b>Not sure</b>
                <span className="orient-name">Recommend one for me</span>
              </label>
            </div>
          </fieldset>

          <div className="form-row">
            <label>Ideal delivery date
              <input type="date" name={`i${i}_ideal_date`} />
            </label>
            <label><span>References or links <span className="optional">— optional</span></span><input name={`i${i}_references_links`} /></label>
          </div>
        </fieldset>
      ))}

      <div className="before">
        <h3>Before you submit</h3>
        <ul className="ticks">
          <li>Double-check names, prices, dates, URLs and phone numbers.</li>
          <li>Each project gets one approval step and one revision round.</li>
          <li>Delivery dates depend on availability. The first cut arrives 3 business days after production starts.</li>
          <li>Your card is saved when you place your order. We only charge it once your order enters our production queue.</li>
        </ul>
      </div>

      {state.phase === 'error' && <p className="form-error" role="alert">{state.message}</p>}

      <button type="submit" className="btn btn-primary" disabled={busy}>
        {state.phase === 'saving' ? 'Sending…' : state.phase === 'uploading' ? `Uploading files ${state.done + 1}/${state.total}…` : 'Submit order'}
      </button>
    </form>
  )
}
