'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import {formats} from './formats'
import {createClient} from '@/lib/supabase/browser'
import {formatPrice} from '@/lib/packages'
import CardFields, {tokenizeCard} from './CardFields'
import DisclaimerText from './DisclaimerText'
import Icon from './Icon'
import {DISCLAIMER_VERSION} from '@/lib/disclaimer'
import {loadFiles, saveFiles, clearFiles} from '@/lib/fileStash'
import {earliestDelivery, formatDate, isClosedDay} from '@/lib/dates'
import {TITLES, ALERTS, STYLES, STORY, VOICES, TONES, MUSIC, DISCLAIMER_POINTS, labelOf} from '@/lib/intake'

const SAVE_KEY = 'mint35-intake'

// Small "?" next to a question that opens a short explanation underneath it.
// "?" next to a question: hover shows the explanation and moving away hides it; on phones a tap opens
// it and a tap anywhere else closes it.
function Tip({children}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])
  const mouse = fn => e => { if (e.pointerType === 'mouse') fn() }
  return (
    <span className="tip-wrap" ref={ref} onPointerEnter={mouse(() => setOpen(true))} onPointerLeave={mouse(() => setOpen(false))}>
      <button type="button" className="q-tip" aria-expanded={open} aria-label="More about this question"
        onClick={e => { e.preventDefault(); setOpen(o => e.nativeEvent.pointerType === 'mouse' ? true : !o) }}>?</button>
      {open && <span className="tip-pop" role="tooltip">{children}</span>}
    </span>
  )
}

// Tappable cards for a single choice; the first option ("Let Mint 35 pick") starts selected.
function Choices({name, options, onSample, chips}) {
  return (
    <div className={chips ? 'chips' : 'choices'}>
      {options.map((o, n) => (
        <label key={o.value} className={chips ? 'chip' : 'choice'}>
          <input type="radio" name={name} value={o.value} defaultChecked={n === 0} />
          <b>{o.label}</b>
          {o.hint && <span className="choice-hint">{o.hint}</span>}
          {o.sample && <button type="button" className="choice-sample" onClick={e => { e.preventDefault(); onSample(o) }}>▶ See a sample</button>}
        </label>
      ))}
    </div>
  )
}

function Orientation({name, label}) {
  return (
    <fieldset>
      <legend className="legend-row">
        <span>{label}</span>
        <button type="button" className="info-link" data-open="formats-dialog">What&rsquo;s the difference?<span className="info-i" aria-hidden="true">i</span></button>
      </legend>
      <div className="orient">
        {formats.map(f => (
          <label key={f.ratio} className="orient-opt">
            <input type="radio" name={name} value={`${f.ratio} ${f.name}`} required />
            <span className={`frame frame-${f.ratio.replace(':', '-')}`} aria-hidden="true" />
            <b>{f.ratio}</b>
            <span className="orient-name">{f.name}</span>
          </label>
        ))}
        <label className="orient-opt">
          <input type="radio" name={name} value="Not sure - recommend one" />
          <span className="frame frame-unsure" aria-hidden="true">?</span>
          <b>Not sure</b>
          <span className="orient-name">Recommend one for me</span>
        </label>
      </div>
    </fieldset>
  )
}

const Opt = () => <span className="optional"> (optional)</span>

// An upload as a compact card: icon, title, one short line, an Upload button and the chosen file names.
function UploadCard({name, icon, title, hint, accept, multiple, required, optional, tip, children}) {
  const [names, setNames] = useState([])
  const input = useRef(null)
  function clear() {
    input.current.value = ''
    setNames([])
    input.current.dispatchEvent(new Event('change', {bubbles: true}))
  }
  return (
    <div className="upload-card">
      <span className="upload-icon"><Icon name={icon} /></span>
      <div className="upload-body">
        <b>{title}{tip && <> <Tip>{tip}</Tip></>}</b>
        {optional && <span className="opt-tag">Optional</span>}
        {hint && <span className="upload-hint">{hint}</span>}
        {names.length > 0 && <span className="upload-names">✓ {names.join(', ')} <button type="button" className="link-btn upload-remove" onClick={clear}>Remove</button></span>}
      </div>
      <label className="upload-btn">
        {names.length ? 'Change' : 'Upload'}
        <input ref={input} type="file" name={name} accept={accept} multiple={multiple} required={required}
          onChange={e => setNames([...e.currentTarget.files].map(f => f.name))} />
      </label>
      {children && <div className="upload-extra">{children}</div>}
    </div>
  )
}

// Optional extra questions behind a link. The fields stay in the form while closed so saved answers
// restore into them; if any comes back filled in, the box opens by itself.
function Reveal({label, children}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if ([...(ref.current?.querySelectorAll('input, textarea') || [])].some(e => e.value)) setOpen(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <>
      {!open && <button type="button" className="reveal-link" onClick={() => setOpen(true)}>{label}</button>}
      <div ref={ref} hidden={!open}>{children}</div>
    </>
  )
}

// Multi-step order form: 1 You · 2 Your brand · 3 one page per video · 4 Review & pay.
// Every step stays in one <form> (hidden when not current) so answers and chosen files survive
// moving back and forth. Text answers are also saved in the browser in case the page is closed.
export default function ProjectForm({lines, tokenUrl, closedDays = {}, onDone}) {
  const formRef = useRef(null)
  const [state, setState] = useState({phase: 'idle'})
  const [step, setStep] = useState(0)
  const [minDate, setMinDate] = useState(null)
  const [watch, setWatch] = useState({})
  const [read, setRead] = useState(false)
  const [sample, setSample] = useState(null)
  const [missing, setMissing] = useState(null) // {step, items: [{key, label}]}
  const pendingFiles = useRef({})
  const [filesLoaded, setFilesLoaded] = useState(0)
  const many = lines.length > 1
  const saveKey = `${SAVE_KEY}:${lines.map(l => l.pkg.slug).join(',')}`

  const steps = [
    {key: 'you', title: 'Let’s get to know you!'},
    {key: 'brand', title: 'Your brand'},
    ...lines.map((l, i) => ({key: `video${i}`, title: many ? `Video ${i + 1} of ${lines.length}: ${l.pkg.name}` : `Your video: ${l.pkg.name}`, i})),
    {key: 'review', title: 'Review & pay'},
  ]
  const last = steps.length - 1

  // Conditional questions depend on a few answers; re-read them whenever the form changes.
  const readWatch = useCallback(() => {
    const f = formRef.current
    if (!f) return
    const fd = new FormData(f)
    setWatch({
      override: fd.get('logo_override') === 'on',
      alert: fd.get('alert_channel'),
      items: Array.from({length: lines.length}, (_, i) => ({style: fd.get(`i${i}_style`), story: fd.get(`i${i}_story`)})),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.length])

  useEffect(() => { setMinDate(earliestDelivery(new Date(), closedDays)) }, [closedDays])

  useEffect(() => {
    if (!sample) return
    const onKey = e => { if (e.key === 'Escape') setSample(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sample])

  // Restore saved text answers once, then keep saving them as the customer types.
  useEffect(() => {
    const f = formRef.current
    let saved = {}
    try { saved = JSON.parse(localStorage.getItem(saveKey) || '{}') } catch {}
    for (const el of f.elements) {
      if (!el.name || el.type === 'file' || !(el.name in saved)) continue
      if (el.type === 'radio') el.checked = saved[el.name] === el.value
      else if (el.type === 'checkbox') el.checked = !!saved[el.name]
      else el.value = saved[el.name]
    }
    readWatch()
    loadFiles(saveKey).then(saved => { pendingFiles.current = saved; setFilesLoaded(n => n + 1) })
  }, [saveKey, readWatch])

  // Put saved files back into their upload fields. Some fields only appear after other answers are
  // restored (e.g. reference photos), so this runs again whenever those answers change.
  useEffect(() => {
    const f = formRef.current
    for (const [name, files] of Object.entries(pendingFiles.current)) {
      const el = f.elements[name]
      if (!el || el.type !== 'file') continue
      delete pendingFiles.current[name]
      if (el.files.length) continue
      try {
        const dt = new DataTransfer()
        for (const file of files) dt.items.add(file)
        el.files = dt.files
        el.dispatchEvent(new Event('change', {bubbles: true}))
      } catch {}
    }
  }, [watch, filesLoaded])

  function save() {
    const f = formRef.current
    const out = {}
    for (const el of f.elements) {
      if (!el.name || el.type === 'file' || el.name === '_honey' || el.name.startsWith('dp') || el.name === 'accept_disclaimer') continue
      if (el.type === 'radio') { if (el.checked) out[el.name] = el.value }
      else if (el.type === 'checkbox') out[el.name] = el.checked
      else out[el.name] = el.value
    }
    try { localStorage.setItem(saveKey, JSON.stringify(out)) } catch {}
  }

  // Checks every field in a step; shows the first problem and returns false.
  // Finds every unanswered or invalid field in a step, outlines each one in red and lists them
  // above the buttons. Returns true when the step is complete.
  function checkStep(n) {
    const box = formRef.current.querySelector(`[data-step="${n}"]`)
    box.querySelectorAll('.is-missing').forEach(e => e.classList.remove('is-missing'))
    const items = []
    const seen = new Set()
    for (const el of box.querySelectorAll('input, select, textarea')) {
      if (el.disabled || el.closest('[hidden]') !== box && el.closest('[hidden]')) continue
      if (el.checkValidity()) continue
      const key = el.type === 'radio' ? el.name : el.name || el.id
      if (seen.has(key)) continue
      seen.add(key)
      const holder = el.closest('.upload-card') || (el.type === 'radio' ? el.closest('.alert-pick, .orient, .choices, .chips') : null) || (el.type === 'checkbox' ? el.closest('label') : null) || el
      holder.classList.add('is-missing')
      holder.dataset.missingKey = key
      const custom = el.validity.valueMissing ? ''
        : el.validity.typeMismatch && el.type === 'email' ? ' (check the email address)'
        : el.validity.patternMismatch && el.type === 'tel' ? ' (needs 10 digits)'
        : el.validity.rangeUnderflow && minDate ? ` (earliest is ${formatDate(minDate)})`
        : el.validity.customError ? ` (${el.validationMessage.replace(/\.$/, '')})` : ''
      items.push({key, label: fieldLabel(el) + custom})
    }
    if (n === last && !read) {
      const d = box.querySelector('.disclaimer-box')
      d.classList.add('is-missing'); d.dataset.missingKey = 'disclaimer-read'
      items.push({key: 'disclaimer-read', label: 'Read the disclaimer to the end'})
    }
    if (!items.length) { if (missing?.step === n) setMissing(null); return true }
    setMissing({step: n, items})
    setStep(n)
    setTimeout(() => {
      const first = box.querySelector('.is-missing')
      first?.scrollIntoView({behavior: 'smooth', block: 'center'})
    }, 60)
    return false
  }

  // Short name for a field in the "Please fill in" list.
  function fieldLabel(el) {
    if (el.dataset.label) return el.dataset.label
    const card = el.closest('.upload-card')
    const fs = el.type === 'radio' && el.closest('fieldset')
    const text = card ? card.querySelector('.upload-body > b')?.innerText
      : fs ? fs.querySelector('legend')?.innerText
      : el.closest('label')?.innerText
    return (text || el.name || 'A required field').split('\n')[0].replace(/\(optional\)|\?/g, '').trim()
  }

  function jumpTo(key) {
    const box = formRef.current.querySelector(`[data-step="${step}"]`)
    const h = box.querySelector(`[data-missing-key="${CSS.escape(key)}"]`)
    h?.scrollIntoView({behavior: 'smooth', block: 'center'})
    h?.querySelector('input:not([type=hidden]), select, textarea')?.focus({preventScroll: true})
  }

  // As fields get filled in, clear their red outline and drop them from the list.
  function recheck(target) {
    if (!missing || missing.step !== step) return
    const h = target?.closest?.('.is-missing')
    const box = formRef.current.querySelector(`[data-step="${step}"]`)
    if (h) {
      const fields = h.matches('input, select, textarea') ? [h] : [...h.querySelectorAll('input, select, textarea')].filter(e => !e.disabled)
      if (fields.every(e => e.checkValidity())) {
        h.classList.remove('is-missing')
        const key = h.dataset.missingKey
        setMissing(m => {
          const items = m.items.filter(i => i.key !== key)
          return items.length ? {...m, items} : null
        })
      }
    }
    if (!box.querySelector('.is-missing')) setMissing(null)
  }

  function go(n) {
    setStep(n)
    requestAnimationFrame(() => formRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'}))
  }
  const next = () => { if (checkStep(step)) go(step + 1) }

  // Enter in a text field moves to the next step (like Continue) instead of submitting the whole form.
  function onKeyDown(e) {
    if (e.key !== 'Enter' || e.target.tagName !== 'INPUT' || ['checkbox', 'radio', 'file', 'submit', 'button'].includes(e.target.type)) return
    e.preventDefault()
    if (step < last) next()
  }

  function dateCheck(e) {
    const el = e.currentTarget
    const v = el.value
    el.setCustomValidity(
      minDate && v && v < minDate ? `The earliest date we can deliver is ${formatDate(minDate)}.`
      : v && isClosedDay(v, closedDays) ? `We’re closed on ${formatDate(v)}${closedDays[v] ? ` (${closedDays[v]})` : ' (weekend)'}. Please pick a business day.`
      : '')
    const i = el.dataset.item
    const ideal = formRef.current.elements[`i${i}_ideal_date`]
    const latest = formRef.current.elements[`i${i}_latest_date`]
    if (ideal && latest && ideal.value && latest.value && !latest.validationMessage.startsWith('We’re') && !latest.validationMessage.startsWith('The earliest')) {
      latest.setCustomValidity(ideal.value > latest.value ? 'The latest date can’t be before your ideal date.' : '')
    }
    el.reportValidity()
  }

  async function onSubmit(e) {
    e.preventDefault()
    for (let n = 0; n < last; n++) if (!checkStep(n)) return
    if (!checkStep(last)) return
    if (!read || !formRef.current.elements.accept_disclaimer.checked) {
      setState({phase: 'error', message: 'Please read the AI Production Disclaimer to the end and accept it.'})
      return
    }

    const fd = new FormData(formRef.current)
    const g = (i, k) => fd.get(`i${i}_${k}`)
    const files = []
    const addFiles = (field, kind, item = null) => {
      for (const file of fd.getAll(field)) if (file && file.size > 0) files.push({file, kind, item})
    }
    addFiles('logo', 'logo')
    addFiles('brand_materials', 'brand_material')
    addFiles('design_files', 'design_file')
    lines.forEach((_, i) => { addFiles(`i${i}_media`, 'media', i); addFiles(`i${i}_refs`, 'reference', i) })

    const payload = {
      _honey: fd.get('_honey'),
      contact: {
        title: fd.get('title'), first_name: fd.get('first_name'), last_name: fd.get('last_name'),
        email: fd.get('email'), phone: fd.get('phone'), company: fd.get('company'), website: fd.get('website'),
        alert_channel: fd.get('alert_channel'),
      },
      brand: {logo_override: fd.get('logo_override') === 'on', design_link: fd.get('design_link'), designer: fd.get('designer')},
      items: lines.map((l, i) => ({
        package: l.pkg.name,
        promoting: g(i, 'promoting'), item_website: g(i, 'item_website'), audience: g(i, 'audience'),
        key_message: g(i, 'key_message'), desired_action: g(i, 'desired_action'), must_appear: g(i, 'must_appear'),
        orientation: g(i, 'orientation'), style: g(i, 'style'), story: g(i, 'story'), voice: g(i, 'voice'),
        tone: g(i, 'tone'), music: g(i, 'music'), references_links: g(i, 'references_links'),
        legal_text: g(i, 'legal_text'), restrictions: g(i, 'restrictions'),
        ideal_date: g(i, 'ideal_date'), latest_date: g(i, 'latest_date'),
        campaign_link: g(i, 'campaign_link'), goal: g(i, 'goal'), match: g(i, 'match'),
        launch_at: g(i, 'launch_at'), tagline: g(i, 'tagline'), per_video: g(i, 'per_video'),
      })),
      files: files.map(f => ({name: f.file.name, size: f.file.size, kind: f.kind, item: f.item})),
      acceptedDisclaimer: DISCLAIMER_VERSION,
      acceptedPoints: DISCLAIMER_POINTS.filter((_, n) => fd.get(`dp${n}`)).length,
    }

    try {
      if (tokenUrl) {
        setState({phase: 'card'})
        payload.cardToken = await tokenizeCard(tokenUrl)
      }
      setState({phase: 'saving'})
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
      try { localStorage.removeItem(saveKey) } catch {}
      clearFiles(saveKey)
      onDone({refs: data.refs, missed: data.uploads.length - uploaded.length})
      window.scrollTo({top: 0, behavior: 'smooth'})
    } catch (err) {
      setState({phase: 'error', message: err.message})
    }
  }

  const busy = state.phase === 'card' || state.phase === 'saving' || state.phase === 'uploading'
  const total = lines.reduce((s, l) => s + (l.pkg.price || 0), 0)
  const val = name => formRef.current?.elements[name]?.value || ''

  const Nav = ({n}) => (
    <>
    {missing?.step === n && missing.items.length > 0 && (
      <div className="missing-box" role="alert">
        <b>Please fill in:</b>
        <ul>{missing.items.map(i => <li key={i.key}><button type="button" onClick={() => jumpTo(i.key)}>{i.label}</button></li>)}</ul>
      </div>
    )}
    <div className="step-nav">
      {n > 0 && <button type="button" className="btn btn-ghost" onClick={() => go(n - 1)}>← Back</button>}
      {n < last && <button type="button" className="btn btn-primary" onClick={next}>Continue →</button>}
    </div>
    </>
  )

  return (
    <form id="project-form" ref={formRef} className="form wizard" onSubmit={onSubmit} onKeyDown={onKeyDown} onChange={e => { if (e.target.type === 'file') saveFiles(saveKey, e.target.name, e.target.files); readWatch(); save(); recheck(e.target) }} onInput={e => { save(); recheck(e.target) }} noValidate>
      <input type="text" name="_honey" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="wizard-head">
        <p className="wizard-count">Step {step + 1} of {steps.length}</p>
        <h1 id="form-title">{steps[step].title}</h1>
        <div className="wizard-bar" aria-hidden="true"><span style={{width: `${((step + 1) / steps.length) * 100}%`}} /></div>
      </div>

      {/* Step 1 · You */}
      <fieldset className="wizard-step" data-step={0} hidden={step !== 0}>
        <p className="step-intro">For the most efficient process, we work with one point of contact per order.</p>
        <div className="form-row name-row">
          <label><span>Title<Opt /></span>
            <select name="title" defaultValue="">
              <option value="">—</option>
              {TITLES.map(t => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>First name<input name="first_name" required autoComplete="given-name" /></label>
          <label>Last name<input name="last_name" required autoComplete="family-name" /></label>
        </div>
        <div className="form-row">
          <label>Email<input type="email" name="email" required autoComplete="email" /></label>
          <label>Cell phone<input type="tel" name="phone" required autoComplete="tel" pattern="[^0-9]*([0-9][^0-9]*){10,}" title="Please enter a 10-digit phone number." /></label>
        </div>
        <div className="form-row">
          <label>Company / Organization<input name="company" required autoComplete="organization" /></label>
          <label><span>Website<Opt /></span><input name="website" placeholder="https://" autoComplete="url" /></label>
        </div>
        <fieldset>
          <legend>How should we alert you?</legend>
          <p className="hint">Everything comes by email. Want a quick heads-up too?</p>
          <div className="alert-pick">
            {ALERTS.map(a => (
              <label key={a.value} className="alert-opt">
                <input type="radio" name="alert_channel" value={a.value} required />
                <Icon name={a.icon} />
                <b>{a.label}</b>
              </label>
            ))}
          </div>
          {(watch.alert === 'sms' || watch.alert === 'whatsapp') && <p className="hint">Message and data rates may apply. Reply STOP to opt out.</p>}
        </fieldset>
        <Nav n={0} />
      </fieldset>

      {/* Step 2 · Brand */}
      <fieldset className="wizard-step" data-step={1} hidden={step !== 1}>
        <p className="step-intro">Let&rsquo;s get to know your brand so your video looks and sounds like you.</p>
        <p className="callout">💡 About your company as a whole. Graphics for this video come next.</p>
        <UploadCard name="logo" icon="badge" title="Main logo" hint="Your everyday logo · PDF or PNG" accept="image/*,.pdf,.svg,.ai,.eps"
          required={!watch.override} optional={watch.override}>
          <label className="mini-check">
            <input type="checkbox" name="logo_override" />
            <span>I only have a logo for what I&rsquo;m promoting</span>
          </label>
          {watch.override && <span className="upload-hint">No problem. You&rsquo;ll add it in the next step.</span>}
        </UploadCard>
        <UploadCard name="brand_materials" icon="palette" title="Brand materials" optional multiple accept="image/*,.pdf"
          hint="Brochures, flyers, anything that shows your look" />
        <UploadCard name="design_files" icon="layers" title="Open design files" optional multiple
          hint="Editable files: AI, PSD, Canva…"
          tip="The original, editable versions of your graphics: Illustrator (.ai), Photoshop (.psd), InDesign, layered PDF, or a Canva or Figma link. They let us use your exact fonts, colors and artwork. Don’t have them? Your designer’s email works too, or we’ll work from what you send.">
          <Reveal label="Share a link or your designer’s email instead">
            <div className="stack">
              <input name="design_link" placeholder="Link (Drive, Dropbox, Canva)" aria-label="Link to design files" />
              <input name="designer" placeholder="Designer’s email" aria-label="Designer email" />
            </div>
          </Reveal>
        </UploadCard>
        <Nav n={1} />
      </fieldset>

      {/* Step 3 · one page per video */}
      {lines.map((l, i) => {
        const n = 2 + i
        const momentum = !!l.pkg.orgOnly
        const w = watch.items?.[i] || {}
        const p = k => `i${i}_${k}`
        return (
          <fieldset key={l.id} className="wizard-step" data-step={n} hidden={step !== n}>
            <p className="step-intro">
              {momentum ? 'Tell us about your fundraising campaign. All 5 milestone videos will be ready before launch.' : 'Now tell us about the video you’re ordering.'}
            </p>

            {momentum ? (
              <>
                <h3 className="q-group">The campaign</h3>
                <label><span>What is the campaign raising money for? <Tip>Two or three sentences: the cause, and why now.</Tip></span><textarea name={p('promoting')} rows={3} required /></label>
                <label>Campaign page link<input name={p('campaign_link')} inputMode="url" placeholder="https://" required /></label>
                <div className="form-row">
                  <label>Goal amount<input name={p('goal')} placeholder="$250,000" required /></label>
                  <label><span>Matching?<Opt /> <Tip>If a matcher multiplies gifts, tell us the match (2x, 3x) and the matcher&rsquo;s name, if it can be shown.</Tip></span><input name={p('match')} placeholder="e.g. 2x by the Cohen Family" /></label>
                </div>
                <label>Launch date and time
                  <input type="datetime-local" name={p('launch_at')} min={minDate ? `${minDate}T00:00` : undefined} required />
                  {minDate && <span className="hint">Earliest launch: {formatDate(minDate)}, so all 5 videos are ready in time.</span>}
                </label>

                <h3 className="q-group">The message</h3>
                <label><span>Call to action: what should donors do? <Tip>For example: &ldquo;Donate today&rdquo;, &ldquo;Donate now at…&rdquo;, &ldquo;Double your gift by midnight&rdquo;.</Tip></span><input name={p('desired_action')} required /></label>
                <label><span>Tagline or hashtag<Opt /></span><input name={p('tagline')} /></label>
                <label><span>Names or sponsors that must appear<Opt /></span><textarea name={p('must_appear')} rows={2} /></label>
                <label><span>What changes from video to video?<Opt /> <Tip>Photos and text can be different in each video. For example: &ldquo;Video 3 thanks our new sponsor&rdquo; or &ldquo;Use photo 4 in the 75% video&rdquo;.</Tip></span><textarea name={p('per_video')} rows={2} /></label>
              </>
            ) : (
              <>
                <h3 className="q-group">The basics</h3>
                <label><span>What are you promoting? <Tip>A product, service, event, sale, launch or announcement. A sentence or two is plenty.</Tip></span><textarea name={p('promoting')} rows={2} required /></label>
                <label><span>Website for what you&rsquo;re promoting<Opt /></span><input name={p('item_website')} placeholder="https://" /></label>
                <label><span>Who is it for? <Tip>Who you want to reach: age range, community, location, interests.</Tip></span><textarea name={p('audience')} rows={2} required /></label>

                <h3 className="q-group">The message</h3>
                <label><span>The one thing viewers should remember <Tip>If viewers forget everything else, what should stick? For example: &ldquo;Same-day delivery anywhere in town.&rdquo;</Tip></span><textarea name={p('key_message')} rows={2} required /></label>
                <label><span>Call to action: what should viewers do after watching? <Tip>For example: &ldquo;Call 732-555-1234&rdquo;, &ldquo;Shop at yoursite.com&rdquo;, &ldquo;Register by May 1&rdquo;, &ldquo;Donate today&rdquo;.</Tip></span><input name={p('desired_action')} required /></label>
                <label><span>Info that must appear<Opt /></span><span className="hint">Price, offer, dates, phone, address.</span><textarea name={p('must_appear')} rows={2} /></label>
              </>
            )}

            <h3 className="q-group">The look and sound</h3>
            <UploadCard name={p('media')} icon="image" multiple accept="image/*,video/*,.pdf,.ai,.eps,.psd"
              title={momentum ? 'Campaign graphics, photos & videos' : 'Photos, videos & graphics to use'}
              hint={momentum ? 'Campaign logo, artwork, flyers, footage. Different photos for each video? Number the files 1–5.' : 'Product photos, footage, its own logo, artwork. Need your product to look exact? Upload real photos or video of it.'}
              required={!!watch.override} optional={!watch.override}>
              <span className="upload-warn">⚠️ Anything you upload here may appear in your video.</span>
            </UploadCard>
            <Orientation name={p('orientation')} label={momentum ? 'Orientation (one for all 5 videos)' : 'Orientation'} />
            <fieldset>
              <legend>What style do you want? <Tip>This sets the overall look. Not sure? Let us pick what fits your message best.</Tip></legend>
              <Choices name={p('style')} options={STYLES} onSample={setSample} />
            </fieldset>
            {w.style === 'realistic' && (
              <UploadCard name={p('refs')} icon="user" title="Reference photos" optional multiple accept="image/*"
                hint="The kind of people you’d like to see"
                tip="Age, look, style of dress. These guide the style; we don’t create exact look-alikes of real people." />
            )}
            <fieldset>
              <legend>How should the story be told? <Tip>
                <span className="tip-line"><Icon name="type" /><span><b>On-screen text only:</b> words animate on screen, no voice.</span></span>
                <span className="tip-line"><Icon name="mic" /><span><b>Narration + key text:</b> a voiceover tells the story, with key words on screen.</span></span>
                <span className="tip-line"><Icon name="mic" /><span><b>Narration only:</b> a voiceover tells the story.</span></span>
                <span className="tip-line"><Icon name="help" /><span>Not sure? Let us decide.</span></span>
                <span className="tip-note">Want full subtitles? Subtitles are available as an add-on: $150 per video.</span>
              </Tip></legend>
              <Choices name={p('story')} options={STORY} chips />
            </fieldset>
            {w.story !== 'text' && (
              <>
                <fieldset><legend>Voice</legend><Choices name={p('voice')} options={VOICES} chips /></fieldset>
                <fieldset><legend>Voice tone</legend><Choices name={p('tone')} options={TONES} chips /></fieldset>
              </>
            )}
            <fieldset><legend>Music mood</legend><Choices name={p('music')} options={MUSIC} chips /></fieldset>
            <label><span>References you like<Opt /></span><span className="hint">Links to videos or ads with a feel you like.</span><input name={p('references_links')} /></label>

            <h3 className="q-group">The fine print</h3>
            <label><span>Required text or legal language<Opt /></span><textarea name={p('legal_text')} rows={2} /></label>
            <label><span>Anything we absolutely can&rsquo;t do?<Opt /> <Tip>For example: no images of people, no music, a color to avoid.</Tip></span><textarea name={p('restrictions')} rows={2} /></label>
            {!momentum && (
              <div className="form-row">
                <label><span>Ideal delivery date<Opt /></span>
                  <input type="date" name={p('ideal_date')} data-item={i} min={minDate || undefined} onChange={dateCheck} />
                </label>
                <label>Absolute latest date you need it in hand
                  <input type="date" name={p('latest_date')} data-item={i} min={minDate || undefined} onChange={dateCheck} required />
                </label>
              </div>
            )}
            {!momentum && minDate && <p className="hint">Earliest: {formatDate(minDate)}. Our 3 business days start once your order enters the production queue, not including weekends and holidays. Orders after 5pm ET count from the next business day.</p>}
            <Nav n={n} />
          </fieldset>
        )
      })}

      {/* Step 4 · Review & pay */}
      <fieldset className="wizard-step" data-step={last} hidden={step !== last}>
        <p className="step-intro">Check your order, add a card, and you&rsquo;re done. Your card will be charged in full once your order moves to production.</p>
        <ul className="review-list">
          {lines.map((l, i) => {
            const date = l.pkg.orgOnly ? val(`i${i}_launch_at`).slice(0, 10) : val(`i${i}_latest_date`)
            return (
              <li key={l.id}>
                <div>
                  <b>{many ? `Video ${i + 1}: ` : ''}{l.pkg.name}</b>
                  <span className="muted">{val(`i${i}_promoting`).slice(0, 90) || '—'}</span>
                  <span className="muted">Style: {labelOf(STYLES, watch.items?.[i]?.style)}{date ? ` · ${l.pkg.orgOnly ? 'Launch' : 'Needed by'} ${formatDate(date)}` : ''}</span>
                </div>
                <div className="review-side">
                  {l.pkg.price ? <b>{formatPrice(l.pkg.price)}</b> : <b>Quote</b>}
                  <button type="button" className="link-btn" onClick={() => go(2 + i)}>Edit</button>
                </div>
              </li>
            )
          })}
          <li className="review-total"><span>Total <span className="intro-tag">Introductory pricing</span></span><b>{formatPrice(total)}</b></li>
        </ul>
        <p className="review-edit"><button type="button" className="link-btn" onClick={() => go(0)}>Edit contact details</button> · <button type="button" className="link-btn" onClick={() => go(1)}>Edit brand</button></p>

        {tokenUrl && <CardFields />}

        <div className="before">
          <h3>Before you submit</h3>
          <ul className="ticks">
            <li>Double-check names, prices, dates and phone numbers.</li>
            {lines.some(l => !l.pkg.orgOnly) && <li>Each video includes one approval step and one revision round.</li>}
            {lines.some(l => l.pkg.orgOnly) && <li>The Momentum Pack includes one sample to approve and one revision round for all 5 videos.</li>}
            <li>Your card is saved now and charged in full once your order moves to production.</li>
            <li>All sales are final. Mint 35 doesn&rsquo;t offer refunds.</li>
          </ul>
        </div>

        <fieldset className="disclaimer-accept">
          <legend>AI Production Disclaimer</legend>
          <div className="checks-col">
            {DISCLAIMER_POINTS.map((t, n) => (
              <label key={n} className="check check-block"><input type="checkbox" name={`dp${n}`} required data-label={`Disclaimer point ${n + 1}`} /><span>{t}</span></label>
            ))}
          </div>
          <div className="disclaimer-box" tabIndex={0} ref={el => { if (el && !read && el.scrollHeight <= el.clientHeight + 8 && step === last) setRead(true) }}
            onScroll={e => { const el = e.currentTarget; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) { setRead(true); if (el.classList.contains('is-missing')) { el.classList.remove('is-missing'); setMissing(m => { const items = (m?.items || []).filter(i => i.key !== 'disclaimer-read'); return items.length ? {...m, items} : null }) } } }}>
            <DisclaimerText />
          </div>
          {!read && <p className="hint">Scroll to the end of the disclaimer to continue.</p>}
          <label className={`check accept${read ? '' : ' is-locked'}`}>
            <input type="checkbox" name="accept_disclaimer" disabled={!read} required data-label="Accept the disclaimer" />
            <span>I&rsquo;ve read and accept the AI Production Disclaimer.</span>
          </label>
        </fieldset>

        {state.phase === 'error' && <p className="form-error" role="alert">{state.message}</p>}

        {missing?.step === last && missing.items.length > 0 && (
          <div className="missing-box" role="alert">
            <b>Please fill in:</b>
            <ul>{missing.items.map(i => <li key={i.key}><button type="button" onClick={() => jumpTo(i.key)}>{i.label}</button></li>)}</ul>
          </div>
        )}
        <div className="step-nav">
          <button type="button" className="btn btn-ghost" onClick={() => go(last - 1)}>← Back</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {state.phase === 'card' ? 'Securing card…' : state.phase === 'saving' ? 'Sending…' : state.phase === 'uploading' ? `Uploading files ${state.done + 1}/${state.total}…` : 'Submit order'}
          </button>
        </div>
      </fieldset>

      {sample && (
        <div className="sample-overlay" role="dialog" aria-label={`${sample.label} sample`} onClick={() => setSample(null)}>
          <div className="sample-box" onClick={e => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setSample(null)} aria-label="Close">✕</button>
            <p className="eyebrow">Sample</p>
            <h3>{sample.label}</h3>
            <div className="sample-frame">
              <iframe src={`https://www.youtube-nocookie.com/embed/${sample.sample}?autoplay=1&rel=0`} title={`${sample.label} sample`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
