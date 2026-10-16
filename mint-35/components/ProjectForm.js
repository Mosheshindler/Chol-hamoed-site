'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import {formats} from './formats'
import {createClient} from '@/lib/supabase/browser'
import {formatPrice} from '@/lib/packages'
import CardFields, {tokenizeCard} from './CardFields'
import DisclaimerText from './DisclaimerText'
import {DISCLAIMER_VERSION} from '@/lib/disclaimer'
import {earliestDelivery, formatDate, isClosedDay} from '@/lib/dates'
import {TITLES, ALERTS, STYLES, STORY, VOICES, TONES, MUSIC, DISCLAIMER_POINTS, labelOf} from '@/lib/intake'

const SAVE_KEY = 'mint35-intake'

// Small "?" next to a question that opens a short explanation underneath it.
function Tip({children}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className="q-tip" aria-expanded={open} onClick={() => setOpen(o => !o)} aria-label="More about this question">?</button>
      {open && <span className="q-tip-text">{children}</span>}
    </>
  )
}

// Tappable cards for a single choice; the first option ("Let Mint 35 pick") starts selected.
function Choices({name, options, onSample}) {
  return (
    <div className="choices">
      {options.map((o, n) => (
        <label key={o.value} className="choice">
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
  }, [saveKey, readWatch])

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
  function checkStep(n) {
    const box = formRef.current.querySelector(`[data-step="${n}"]`)
    for (const el of box.querySelectorAll('input, select, textarea')) {
      if (el.disabled || el.closest('[hidden]') !== box && el.closest('[hidden]')) continue
      if (!el.checkValidity()) {
        setStep(n)
        setTimeout(() => { el.reportValidity(); el.focus?.() }, 60)
        return false
      }
    }
    return true
  }

  function go(n) {
    setStep(n)
    requestAnimationFrame(() => formRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'}))
  }
  const next = () => { if (checkStep(step)) go(step + 1) }

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
        launch_at: g(i, 'launch_at'), tagline: g(i, 'tagline'),
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
    <div className="step-nav">
      {n > 0 && <button type="button" className="btn btn-ghost" onClick={() => go(n - 1)}>← Back</button>}
      {n < last && <button type="button" className="btn btn-primary" onClick={next}>Continue →</button>}
    </div>
  )

  return (
    <form id="project-form" ref={formRef} className="form wizard" onSubmit={onSubmit} onChange={() => { readWatch(); save() }} onInput={save} noValidate>
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
          <p className="hint">Everything comes to you by email. We can also send a quick alert when something new is waiting for you.</p>
          <div className="choices choices-row">
            {ALERTS.map(a => (
              <label key={a.value} className="choice">
                <input type="radio" name="alert_channel" value={a.value} required />
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
        <p className="callout">💡 This step is about your company or organization as a whole. Graphics for what you&rsquo;re promoting in this video come in the next step.</p>
        <label><span>Your main logo{watch.override && <Opt />}</span>
          <span className="hint">Your everyday company or organization logo, not a logo for a specific product, service or campaign. High-res, PDF or PNG preferred.</span>
          <input type="file" name="logo" accept="image/*,.pdf,.svg,.ai,.eps" required={!watch.override} />
        </label>
        <label className="check check-inline">
          <input type="checkbox" name="logo_override" />
          <span>I only have a logo for what I&rsquo;m promoting</span>
        </label>
        {watch.override && <p className="hint">No problem. You&rsquo;ll upload it in the next step.</p>}
        <label><span>Brand materials<Opt /></span>
          <span className="hint">Brochures, flyers, infographics or anything else that shows your colors, fonts and overall look.</span>
          <input type="file" name="brand_materials" accept="image/*,.pdf" multiple />
        </label>
        <fieldset>
          <legend>Open design files<Opt /> <Tip>The original, editable versions of your graphics: Illustrator (.ai), Photoshop (.psd), InDesign, layered PDF, or a Canva or Figma link. They let us use your exact fonts, colors and artwork cleanly. Don&rsquo;t have them? No problem. Your designer&rsquo;s email works too, or we&rsquo;ll work from what you send.</Tip></legend>
          <div className="stack">
            <input type="file" name="design_files" multiple aria-label="Upload open design files" />
            <input name="design_link" placeholder="Or paste a link (Drive, Dropbox, Canva)" aria-label="Link to design files" />
            <input name="designer" placeholder="Or your designer’s email" aria-label="Designer name and email" />
          </div>
        </fieldset>
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
              {l.pkg.price ? <span className="section-price">{formatPrice(l.pkg.price)}</span> : null}
            </p>

            {momentum ? (
              <>
                <h3 className="q-group">The campaign</h3>
                <label><span>What is the campaign raising money for? <Tip>Two or three sentences: the cause, and why now.</Tip></span><textarea name={p('promoting')} rows={3} required /></label>
                <label>Campaign page link<input type="url" name={p('campaign_link')} placeholder="https://" required /></label>
                <div className="form-row">
                  <label>Goal amount<input name={p('goal')} placeholder="$250,000" required /></label>
                  <label><span>Matching?<Opt /> <Tip>If a matcher multiplies gifts, tell us the match (2x, 3x) and the matcher&rsquo;s name, if it can be shown.</Tip></span><input name={p('match')} placeholder="e.g. 2x by the Cohen Family" /></label>
                </div>
                <label>Launch date and time
                  <input type="datetime-local" name={p('launch_at')} min={minDate ? `${minDate}T00:00` : undefined} required />
                  {minDate && <span className="hint">Earliest launch: {formatDate(minDate)}, so all 5 videos are ready in time.</span>}
                </label>

                <h3 className="q-group">The message</h3>
                <label><span>Call to action: what should donors do? <Tip>For example: &ldquo;Donate now at…&rdquo;, &ldquo;Double your gift by midnight&rdquo;.</Tip></span><input name={p('desired_action')} required /></label>
                <label><span>Tagline or hashtag<Opt /></span><input name={p('tagline')} /></label>
                <label><span>Names or sponsors that must appear<Opt /></span><textarea name={p('must_appear')} rows={2} /></label>
              </>
            ) : (
              <>
                <h3 className="q-group">The basics</h3>
                <label><span>What are you promoting? <Tip>A product, service, event, sale, launch or announcement. A sentence or two is plenty.</Tip></span><textarea name={p('promoting')} rows={2} required /></label>
                <label><span>Website for what you&rsquo;re promoting<Opt /></span><input name={p('item_website')} placeholder="https://" /></label>
                <label><span>Who is it for? <Tip>Who you want to reach: age range, community, location, interests.</Tip></span><textarea name={p('audience')} rows={2} required /></label>

                <h3 className="q-group">The message</h3>
                <label><span>The one thing viewers should remember <Tip>If viewers forget everything else, what should stick? For example: &ldquo;Same-day delivery anywhere in town.&rdquo;</Tip></span><textarea name={p('key_message')} rows={2} required /></label>
                <label><span>Call to action: what should viewers do after watching? <Tip>For example: &ldquo;Call 732-555-1234&rdquo;, &ldquo;Shop at yoursite.com&rdquo;, &ldquo;Register by May 1&rdquo;.</Tip></span><input name={p('desired_action')} required /></label>
                <label><span>Info that must appear<Opt /></span><span className="hint">Price, offer, dates, phone, address.</span><textarea name={p('must_appear')} rows={2} /></label>
              </>
            )}

            <h3 className="q-group">The look and sound</h3>
            <label><span>{momentum ? 'Campaign graphics, photos and videos' : 'Photos, videos and graphics to use in your video'}{!watch.override && <Opt />}</span>
              <span className="hint">{momentum ? 'Campaign logo, artwork, flyers, photos or footage.' : 'Product photos, footage, its own logo, artwork, flyers.'}</span>
              <input type="file" name={p('media')} multiple accept="image/*,video/*,.pdf,.ai,.eps,.psd" required={!!watch.override} />
              <span className="upload-warn">⚠️ Anything you upload here may appear in your video. Please don&rsquo;t include anything you don&rsquo;t want shown.</span>
            </label>
            <Orientation name={p('orientation')} label={momentum ? 'Orientation (one for all 5 videos)' : 'Orientation'} />
            <fieldset>
              <legend>What style do you want? <Tip>This sets the overall look. Not sure? Let us pick what fits your message best.</Tip></legend>
              <Choices name={p('style')} options={STYLES} onSample={setSample} />
            </fieldset>
            {w.style === 'realistic' && (
              <label><span>Reference photos<Opt /></span>
                <span className="hint">Show us the kind of people you&rsquo;d like to see: age, look, style of dress. These guide the style; we don&rsquo;t create exact look-alikes of real people.</span>
                <input type="file" name={p('refs')} accept="image/*" multiple />
              </label>
            )}
            <fieldset>
              <legend>How should the story be told? <Tip>On-screen text: words animate on screen, no voice. Narration: a voiceover tells the story. Not sure? Let us decide.</Tip></legend>
              <Choices name={p('story')} options={STORY} />
            </fieldset>
            {w.story !== 'text' && (
              <>
                <fieldset><legend>Voice</legend><Choices name={p('voice')} options={VOICES} /></fieldset>
                <fieldset><legend>Voice tone</legend><Choices name={p('tone')} options={TONES} /></fieldset>
              </>
            )}
            <fieldset><legend>Music mood</legend><Choices name={p('music')} options={MUSIC} /></fieldset>
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
            {!momentum && minDate && <p className="hint">Earliest: {formatDate(minDate)}. Our 3 business days start once your order enters the production queue. Weekends and holidays are skipped, and orders after 5pm ET count from the next business day.</p>}
            <Nav n={n} />
          </fieldset>
        )
      })}

      {/* Step 4 · Review & pay */}
      <fieldset className="wizard-step" data-step={last} hidden={step !== last}>
        <p className="step-intro">Check your order, add a card, and you&rsquo;re done. Nothing is charged until your order enters production.</p>
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
            <li>Each video includes one approval step and one revision round.</li>
            <li>Your card is saved now and charged only once your order enters production.</li>
          </ul>
        </div>

        <fieldset className="disclaimer-accept">
          <legend>AI Production Disclaimer</legend>
          <div className="checks-col">
            {DISCLAIMER_POINTS.map((t, n) => (
              <label key={n} className="check check-block"><input type="checkbox" name={`dp${n}`} required /><span>{t}</span></label>
            ))}
          </div>
          <div className="disclaimer-box" tabIndex={0} ref={el => { if (el && !read && el.scrollHeight <= el.clientHeight + 8 && step === last) setRead(true) }}
            onScroll={e => { const el = e.currentTarget; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setRead(true) }}>
            <DisclaimerText />
          </div>
          {!read && <p className="hint">Scroll to the end of the disclaimer to continue.</p>}
          <label className={`check accept${read ? '' : ' is-locked'}`}>
            <input type="checkbox" name="accept_disclaimer" disabled={!read} />
            <span>I&rsquo;ve read and accept the AI Production Disclaimer.</span>
          </label>
        </fieldset>

        {state.phase === 'error' && <p className="form-error" role="alert">{state.message}</p>}

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
