'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import {formats} from './formats'
import {createClient} from '@/lib/supabase/browser'
import {formatPrice, EXTRA_FORMAT_PRICE, extraFormatsCost, CHECKOUT_EXTRAS, checkoutExtrasCost} from '@/lib/packages'
import CardFields, {tokenizeCard} from './CardFields'
import DisclaimerText from './DisclaimerText'
import Icon from './Icon'
import {DISCLAIMER_VERSION} from '@/lib/disclaimer'
import {loadFiles, saveFiles, clearFiles} from '@/lib/fileStash'
import {earliestDelivery, formatDate, isClosedDay} from '@/lib/dates'
import {STYLES, STORY, VOICES, TONES, MUSIC, DISCLAIMER_POINTS, US_STATES, MAX_UPLOAD_MB, MAX_UPLOAD_BYTES, formatSize, labelOf} from '@/lib/intake'
import TooBigDialog from './TooBigDialog'
import {discountLines, describeDiscount} from '@/lib/discounts'
import {SALES_TAX_RATE, SALES_TAX_LABEL, TAX_STATE, EXEMPT_REASONS, taxCents} from '@/lib/tax'

const SAVE_KEY = 'mint35-intake'
const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

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
      {/* A span, not a <button>: a button inside a <label> would take over the label from its field. */}
      <span role="button" tabIndex={0} className="q-tip" aria-expanded={open} aria-label="More about this question"
        onClick={e => { e.preventDefault(); setOpen(o => e.nativeEvent.pointerType === 'mouse' ? true : !o) }}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setOpen(o => !o) } }}>?</span>
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

const xfName = (name, f) => `${name}_xf_${f.ratio.replace(':', '-')}`

function Orientation({name, label, pkg, chosen}) {
  const videos = pkg?.videos || 1
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
      {pkg?.price ? (
        <div className="extra-formats">
          <p><b>Need it in another shape too?</b> <span className="muted">Add a format for {formatPrice(EXTRA_FORMAT_PRICE)} per video{videos > 1 ? ` (${formatPrice(EXTRA_FORMAT_PRICE * videos)} for all ${videos})` : ''}.</span></p>
          <div className="extra-formats-opts">
            {formats.map(f => {
              const isMain = chosen?.startsWith(f.ratio + ' ')
              return (
                <label key={f.ratio} className={`check xf-opt${isMain ? ' is-main' : ''}`}>
                  <input type="checkbox" name={xfName(name, f)} disabled={isMain} />
                  <span>+ {f.ratio} {f.name}</span>
                </label>
              )
            })}
          </div>
        </div>
      ) : null}
    </fieldset>
  )
}

const Opt = () => <span className="optional"> (optional)</span>

// An upload as a compact card: icon, title, one short line, an Upload button and the chosen file names.
// The "Before you start" checklist on step 1, matching the questions asked later in the form.
const PREP_CLASSIC = [
  ['megaphone', 'What you’re promoting, and who it’s for'],
  ['sparkles', 'The one thing viewers should remember'],
  ['route', 'What viewers should do next: call, visit, donate, buy'],
  ['form', 'Details that must appear: price, dates, phone, web address'],
  ['image', 'Your logo, plus any photos or videos you want included'],
  ['calendar', 'The latest date you need the video delivered to you'],
]
const PREP_CAMPAIGN = [
  ['heart', 'What the campaign is raising money for, and why now'],
  ['form', 'Your campaign page link, goal amount and any matching'],
  ['calendar', 'The launch date and time'],
  ['route', 'What donors should do: donate today, double your gift…'],
  ['image', 'Your logo, campaign graphics and any photos or videos, saved in one place'],
]

// Picking files again adds to the ones already chosen (instead of replacing them), so a client can
// add photos a few at a time. Each file can be removed on its own and shows its size. Files over the
// upload limit are left out and a pop-up suggests sharing them from Google Drive or Dropbox; with
// `linkName`, the card has a field for those links (the pop-up can fill it in).
function UploadCard({name, icon, title, hint, accept, multiple, required, optional, tip, linkName, children}) {
  const [picked, setPicked] = useState([]) // [{name, size}]
  const [tooBig, setTooBig] = useState(null)
  const [skipped, setSkipped] = useState([]) // names of files left out for being too big
  const [showLinks, setShowLinks] = useState(false)
  const input = useRef(null)
  const links = useRef(null)
  const kept = useRef([]) // the files chosen so far
  const replacing = useRef(false) // set when we change the list ourselves (Remove)
  const key = f => `${f.name}|${f.size}|${f.lastModified}`
  // Links restored from a saved draft open the field by themselves.
  useEffect(() => {
    const id = requestAnimationFrame(() => { if (links.current?.value) setShowLinks(true) })
    return () => cancelAnimationFrame(id)
  }, [])
  function setFiles(files) {
    const dt = new DataTransfer()
    files.forEach(f => dt.items.add(f))
    input.current.files = dt.files
  }
  function onChange(e) {
    const chosen = [...e.currentTarget.files]
    const big = replacing.current ? [] : chosen.filter(f => f.size > MAX_UPLOAD_BYTES)
    const fresh = chosen.filter(f => !big.includes(f))
    let files = fresh
    if (multiple && !replacing.current) {
      const seen = new Set(kept.current.map(key))
      files = [...kept.current, ...fresh.filter(f => !seen.has(key(f)))]
    } else if (!fresh.length && big.length) files = kept.current // a too-big pick keeps the earlier file
    if (files.length !== chosen.length || files.some((f, i) => f !== chosen[i])) {
      try { setFiles(files) } catch { if (big.length) { input.current.value = ''; files = [] } else files = chosen }
    }
    replacing.current = false
    kept.current = files
    setPicked(files.map(f => ({name: f.name, size: f.size})))
    if (big.length) {
      setTooBig(big.map(f => ({name: f.name, size: f.size})))
      setSkipped(old => [...new Set([...old, ...big.map(f => f.name)])])
    }
  }
  function remove(i) {
    const files = i == null ? [] : kept.current.filter((_, n) => n !== i)
    try { setFiles(files) } catch { input.current.value = '' }
    replacing.current = true
    input.current.dispatchEvent(new Event('change', {bubbles: true}))
  }
  function addLink(url) {
    setShowLinks(true)
    requestAnimationFrame(() => {
      const el = links.current
      if (!el) return
      el.value = el.value.trim() ? `${el.value.trim()}\n${url}` : url
      el.dispatchEvent(new Event('input', {bubbles: true}))
      el.dispatchEvent(new Event('change', {bubbles: true}))
    })
  }
  const label = f => <>{f.name} <span className="upload-size">{formatSize(f.size)}</span></>
  return (
    <div className="upload-card">
      <span className="upload-icon"><Icon name={icon} /></span>
      <div className="upload-body">
        <b>{title}{tip && <> <Tip>{tip}</Tip></>}</b>
        {optional && <span className="opt-tag">Optional</span>}
        {hint && <span className="upload-hint">{hint}</span>}
        <span className="upload-limit">Up to {MAX_UPLOAD_MB} MB per file</span>
        {picked.length > 0 && (multiple
          ? <ul className="upload-list">
              {picked.map((f, i) => <li key={i}><span>✓ {label(f)}</span><button type="button" className="link-btn upload-remove" aria-label={`Remove ${f.name}`} onClick={() => remove(i)}>Remove</button></li>)}
              {picked.length > 1 && <li className="upload-count">{picked.length} files · {formatSize(picked.reduce((s, f) => s + f.size, 0))}</li>}
            </ul>
          : <span className="upload-names">✓ {label(picked[0])} <button type="button" className="link-btn upload-remove" onClick={() => remove(null)}>Remove</button></span>)}
        {linkName && (
          <>
            {!showLinks && <button type="button" className="reveal-link" onClick={() => setShowLinks(true)}>Bigger files? Share a Google Drive or Dropbox link</button>}
            <label className="upload-links" hidden={!showLinks}>
              <span>Links to your files <span className="muted">(Google Drive, Dropbox)</span></span>
              <textarea ref={links} name={linkName} rows={2} placeholder="https://drive.google.com/…" />
              <span className="hint">Set sharing to &ldquo;Anyone with the link&rdquo; so we can open it.</span>
            </label>
          </>
        )}
      </div>
      <label className="upload-btn">
        {!picked.length ? 'Upload' : multiple ? 'Add more' : 'Change'}
        <input ref={input} type="file" name={name} accept={accept} multiple={multiple} required={required} onChange={onChange} />
      </label>
      {children && <div className="upload-extra">{children}</div>}
      {skipped.length > 0 && <span hidden data-skipped={JSON.stringify(skipped)} data-link={linkName || ''} />}
      {tooBig && <TooBigDialog files={tooBig} onLink={linkName ? addLink : null} onClose={() => { setTooBig(null); if (linkName) setShowLinks(true) }} />}
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
  const [discount, setDiscount] = useState({rule: null, error: '', busy: false})
  const [exempt, setExempt] = useState(false)
  // NJ billing address = taxed (exempt option shown); any other state = no sales tax.
  const taxed = watch.billingState === TAX_STATE
  const pendingFiles = useRef({})
  const humanBox = useRef(null)
  const humanWidget = useRef(null)
  const [human, setHuman] = useState(null) // Turnstile token
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
      billingState: fd.get('billing_state'),
      items: Array.from({length: lines.length}, (_, i) => {
        const orientation = fd.get(`i${i}_orientation`)
        const xf = formats.filter(f => fd.get(xfName(`i${i}_orientation`, f)) === 'on' && !orientation?.startsWith(f.ratio + ' ')).map(f => `${f.ratio} ${f.name}`)
        const extras = CHECKOUT_EXTRAS.filter(a => fd.get(`i${i}_x_${a.key}`) === 'on').map(a => a.key)
        return {style: fd.get(`i${i}_style`), story: fd.get(`i${i}_story`), stories: fd.get(`i${i}_stories`), orientation, xf, extras, mediaLinks: !!fd.get(`i${i}_media_links`)?.trim()}
      }),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.length])

  useEffect(() => { setMinDate(earliestDelivery(new Date(), closedDays)) }, [closedDays])

  // Cloudflare Turnstile on the last step (only when its site key is set).
  useEffect(() => {
    if (!TURNSTILE_KEY || step !== last || humanWidget.current !== null) return
    const draw = () => {
      if (humanWidget.current !== null || !window.turnstile || !humanBox.current) return
      humanWidget.current = window.turnstile.render(humanBox.current, {
        sitekey: TURNSTILE_KEY, theme: 'dark', size: 'flexible',
        callback: t => setHuman(t), 'expired-callback': () => setHuman(null), 'error-callback': () => setHuman(null),
      })
    }
    if (window.turnstile) return draw()
    let s = document.getElementById('cf-turnstile')
    if (!s) {
      s = document.createElement('script')
      s.id = 'cf-turnstile'
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      s.async = true
      document.head.appendChild(s)
    }
    s.addEventListener('load', draw)
    return () => s.removeEventListener('load', draw)
  }, [step, last])

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

  // Website fields (placeholder https://) accept "example.com"; add the https:// on the way out.
  function fixUrl(e) {
    const el = e.target
    if (el.tagName !== 'INPUT' || el.placeholder !== 'https://') return
    const v = el.value.trim()
    if (v && !/^https?:\/\//i.test(v) && /^[^\s]+\.[^\s]+$/.test(v)) { el.value = 'https://' + v; save() }
  }

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
    if (TURNSTILE_KEY && !human) {
      setState({phase: 'error', message: 'Please wait a moment for the security check above the Submit button to finish.'})
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
    if (taxed && exempt) addFiles('tax_doc', 'tax_exempt')
    lines.forEach((_, i) => { addFiles(`i${i}_media`, 'media', i); addFiles(`i${i}_refs`, 'reference', i) })

    const payload = {
      _honey: fd.get('_honey'),
      turnstileToken: human,
      contact: {
        title: fd.get('title'), first_name: fd.get('first_name'), last_name: fd.get('last_name'),
        email: fd.get('email'), phone: fd.get('phone'), company: fd.get('company'), website: fd.get('website'),
        billing: {line1: fd.get('billing_line1'), line2: fd.get('billing_line2'), city: fd.get('billing_city'), state: fd.get('billing_state'), zip: fd.get('billing_zip')},
        alert_channel: fd.get('alert_channel'),
      },
      brand: {logo_override: fd.get('logo_override') === 'on', design_link: fd.get('design_link'), designer: fd.get('designer'), brand_links: fd.get('brand_links')},
      items: lines.map((l, i) => ({
        package: l.pkg.name,
        promoting: g(i, 'promoting'), item_website: g(i, 'item_website'), audience: g(i, 'audience'),
        key_message: g(i, 'key_message'), desired_action: g(i, 'desired_action'), must_appear: g(i, 'must_appear'),
        orientation: g(i, 'orientation'), extra_formats: watch.items?.[i]?.xf || [], extras: watch.items?.[i]?.extras || [], style: g(i, 'style'), story: g(i, 'story'), voice: g(i, 'voice'),
        tone: g(i, 'tone'), music: g(i, 'music'), references_links: g(i, 'references_links'), media_links: g(i, 'media_links'),
        legal_text: g(i, 'legal_text'), restrictions: g(i, 'restrictions'),
        ideal_date: g(i, 'ideal_date'), latest_date: g(i, 'latest_date'),
        campaign_link: g(i, 'campaign_link'), goal: g(i, 'goal'), match: g(i, 'match'),
        launch_at: g(i, 'launch_at'), tagline: g(i, 'tagline'), per_video: g(i, 'per_video'),
        stories: g(i, 'stories'), video_ideas: [1, 2, 3].map(n => g(i, `video_${n}`)),
      })),
      files: files.map(f => ({name: f.file.name, size: f.file.size, kind: f.kind, item: f.item})),
      // Files left out for being too big, from boxes where no link was added: the welcome email reminds them.
      skippedFiles: [...formRef.current.querySelectorAll('[data-skipped]')]
        .filter(el => !(el.dataset.link && String(fd.get(el.dataset.link) || '').trim()))
        .flatMap(el => JSON.parse(el.dataset.skipped)),
      acceptedDisclaimer: DISCLAIMER_VERSION,
      acceptedPoints: DISCLAIMER_POINTS.filter((_, n) => fd.get(`dp${n}`)).length,
      discountCode: discount.rule?.code || null,
      tax: {exempt: taxed && exempt, reason: taxed && exempt ? fd.get('tax_reason') : null},
    }

    try {
      if (tokenUrl) {
        setState({phase: 'card'})
        payload.cardToken = await tokenizeCard(tokenUrl, payload.contact.billing)
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
      // A Turnstile token works once; get a fresh one for the next try.
      if (humanWidget.current !== null) { window.turnstile?.reset(humanWidget.current); setHuman(null) }
    }
  }

  const busy = state.phase === 'card' || state.phase === 'saving' || state.phase === 'uploading'
  const xfCost = i => extraFormatsCost(lines[i].pkg, watch.items?.[i]?.xf?.length || 0)
  const exCost = i => checkoutExtrasCost(lines[i].pkg, watch.items?.[i]?.extras)
  const lineTotal = i => (lines[i].pkg.price || 0) + xfCost(i) + exCost(i)
  // Discount preview (the order API applies the real one). Cents, per video.
  const off = discount.rule ? discountLines(discount.rule, lines.map((l, i) => ({package: l.pkg.name, cents: lineTotal(i) * 100}))) : lines.map(() => 0)
  const offTotal = off.reduce((s, c) => s + c, 0) / 100
  // Sales tax per video on its price after any discount, the same way the server works it out.
  const taxTotal = !taxed || exempt ? 0 : lines.reduce((s, l, i) => s + taxCents(lineTotal(i) * 100 - off[i], SALES_TAX_RATE), 0) / 100
  const subtotal = lines.reduce((s, l, i) => s + lineTotal(i), 0) - offTotal
  const total = subtotal + taxTotal
  const money = n => '$' + n.toLocaleString('en-US', {minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2})

  async function applyCode() {
    const code = formRef.current?.elements.discount_code?.value || ''
    setDiscount(d => ({...d, busy: true, error: ''}))
    try {
      const res = await fetch('/api/discount', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({code, packages: lines.map(l => l.pkg.name)})})
      const data = await res.json()
      if (!res.ok) return setDiscount({rule: null, error: data.error || 'That code isn’t valid.', busy: false})
      setDiscount({rule: data.rule, error: '', busy: false})
    } catch {
      setDiscount({rule: null, error: 'Couldn’t check that code. Try again.', busy: false})
    }
  }
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
    <form id="project-form" ref={formRef} className="form wizard" onSubmit={onSubmit} onKeyDown={onKeyDown} onChange={e => { if (e.target.type === 'file') saveFiles(saveKey, e.target.name, e.target.files); readWatch(); save(); recheck(e.target) }} onInput={e => { save(); recheck(e.target) }} onBlur={fixUrl} noValidate>
      <input type="text" name="_honey" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="wizard-head">
        <p className="wizard-count">Step {step + 1} of {steps.length}</p>
        <h1 id="form-title">{steps[step].title}</h1>
        <div className="wizard-bar" aria-hidden="true"><span style={{width: `${((step + 1) / steps.length) * 100}%`}} /></div>
      </div>

      {/* Step 1 · You */}
      <fieldset className="wizard-step" data-step={0} hidden={step !== 0}>
        <div className="have-ready">
          <b>Before you start, please prepare for the following:</b>
          <ul className="prep-list">
            {(lines.every(l => l.pkg.orgOnly) ? PREP_CAMPAIGN : PREP_CLASSIC).map(([icon, text]) => <li key={text}><Icon name={icon} /><span>{text}</span></li>)}
          </ul>
          <span className="prep-note">A sentence or two for each is plenty. Your answers save on this device as you go, so you can stop and come back.</span>
        </div>
        <p className="step-intro">For the most efficient process, we work with one point of contact per order.</p>
        <div className="form-row">
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
        <h3 className="q-group">Billing address</h3>
        <label>Street address<input name="billing_line1" required autoComplete="address-line1" /></label>
        <label><span>Apt, suite, floor<Opt /></span><input name="billing_line2" autoComplete="address-line2" /></label>
        <div className="form-row address-row">
          <label>City<input name="billing_city" required autoComplete="address-level2" /></label>
          <label>State
            <select name="billing_state" required defaultValue="" autoComplete="address-level1">
              <option value="" disabled>Choose</option>
              {US_STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
            </select>
          </label>
          <label>ZIP<input name="billing_zip" required inputMode="numeric" autoComplete="postal-code" pattern="\d{5}(-\d{4})?" title="Please enter a 5-digit ZIP code." /></label>
        </div>
        <p className="hint">For your receipt. New Jersey addresses include NJ sales tax, unless your organization is tax-exempt (you can mark that at checkout).</p>
        {/* Text/WhatsApp alerts are hidden until Twilio is set up; every order gets email. To bring them
            back, restore the "How should we alert you?" choice over ALERTS (lib/intake.js). */}
        <input type="hidden" name="alert_channel" value="email" />
        <Nav n={0} />
      </fieldset>

      {/* Step 2 · Brand */}
      <fieldset className="wizard-step" data-step={1} hidden={step !== 1}>
        <p className="step-intro">Let&rsquo;s get to know your brand so your video looks and sounds like you.</p>
        <p className="callout">💡 About your company as a whole. Graphics for this video come next.</p>
        <UploadCard name="logo" icon="badge" title="Main logo" hint="Your everyday logo · PNG, PDF, SVG, AI or EPS (vector preferred)" accept="image/*,.pdf,.svg,.ai,.eps"
          required={!watch.override} optional={watch.override}>
          <label className="mini-check">
            <input type="checkbox" name="logo_override" />
            <span>I only have a logo for what I&rsquo;m promoting</span>
          </label>
          {watch.override && <span className="upload-hint">No problem. You&rsquo;ll add it in the next step.</span>}
        </UploadCard>
        <UploadCard name="brand_materials" icon="palette" title="Brand materials" optional multiple accept="image/*,.pdf" linkName="brand_links"
          hint="Brochures, flyers, anything that shows your look" />
        <UploadCard name="design_files" icon="layers" title="Open design files" optional multiple linkName="design_link"
          hint="Editable files: AI, PSD, Canva…"
          tip="The original, editable versions of your graphics: Illustrator (.ai), Photoshop (.psd), InDesign, layered PDF, or a Canva or Figma link. They let us use your exact fonts, colors and artwork. Don’t have them? Your designer’s email works too, or we’ll work from what you send.">
          <Reveal label="Or send us your designer’s email">
            <input name="designer" placeholder="Designer’s email" aria-label="Designer email" />
          </Reveal>
        </UploadCard>
        <Nav n={1} />
      </fieldset>

      {/* Step 3 · one page per video */}
      {lines.map((l, i) => {
        const n = 2 + i
        const momentum = !!l.pkg.orgOnly
        const multi = !momentum && l.pkg.videos > 1 ? l.pkg.videos : 0
        const w = watch.items?.[i] || {}
        const p = k => `i${i}_${k}`
        return (
          <fieldset key={l.id} className="wizard-step" data-step={n} hidden={step !== n}>
            <p className="step-intro">
              {momentum ? 'Tell us about your fundraising campaign. All 5 milestone videos will be ready before launch.' : multi ? `Now tell us about your campaign. These answers apply to all ${multi} videos.` : 'Now tell us about the video you’re ordering.'}
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
                {multi && (
                  <>
                    <h3 className="q-group">The {multi} videos</h3>
                    <fieldset>
                      <legend>How should we plan the {multi} videos?</legend>
                      <Choices name={p('stories')} options={[
                        {value: 'general', label: 'General direction only', hint: `We plan ${multi} different videos with one look, from your answers above.`},
                        {value: 'ideas', label: 'I have an idea for each video', hint: 'Give us a line or two for each one.'},
                      ]} />
                    </fieldset>
                    {w.stories === 'ideas' && Array.from({length: multi}, (_, n) => (
                      <label key={n}><span>Video {n + 1} idea<Opt /></span><textarea name={p(`video_${n + 1}`)} rows={2} placeholder={n === 0 ? 'e.g. Show the new menu items' : undefined} /></label>
                    ))}
                    {w.stories === 'ideas' && <p className="hint">Leave one blank and we&rsquo;ll plan that video for you.</p>}
                  </>
                )}
              </>
            )}

            <h3 className="q-group">The look and sound</h3>
            <UploadCard name={p('media')} icon="image" multiple accept="image/*,video/*,.pdf,.ai,.eps,.psd" linkName={p('media_links')}
              title={momentum ? 'Campaign graphics, photos & videos' : 'Photos, videos & graphics to use'}
              hint={momentum ? 'Campaign logo, artwork, flyers, footage. Different photos for each video? Number the files 1–5.' : 'Product photos, footage, its own logo, artwork. Need your product to look exact? Upload real photos or video of it.'}
              required={!!watch.override && !w.mediaLinks} optional={!watch.override}>
              <span className="upload-warn">⚠️ Anything you upload here may appear in your video.</span>
            </UploadCard>
            <Orientation name={p('orientation')} label={momentum ? 'Video format (one for all 5 videos)' : multi ? `Video format (one for all ${multi} videos)` : 'Video format'} pkg={l.pkg} chosen={watch.items?.[i]?.orientation} />
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
            {w.story?.startsWith('narration') && (
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
            {!momentum && minDate && <p className="hint">Earliest: {formatDate(minDate)}. Your first cut takes 3 business days once production starts; with your revision round, allow about 6 business days for the final. Weekends and holidays aren’t counted, and orders after 5pm ET count from the next business day.</p>}
            <Nav n={n} />
          </fieldset>
        )
      })}

      {/* Step 4 · Review & pay */}
      <fieldset className="wizard-step" data-step={last} hidden={step !== last}>
        <p className="step-intro">Check your order, add a card, and you&rsquo;re done. Your card will be charged in full when we start your project.</p>
        <ul className="review-list">
          {lines.map((l, i) => {
            const date = l.pkg.orgOnly ? val(`i${i}_launch_at`).slice(0, 10) : val(`i${i}_latest_date`)
            return (
              <li key={l.id}>
                <div>
                  <b>{many ? `Video ${i + 1}: ` : ''}{l.pkg.name}</b>
                  <span className="muted">{val(`i${i}_promoting`).slice(0, 90) || '—'}</span>
                  <span className="muted">Style: {labelOf(STYLES, watch.items?.[i]?.style)}{date ? ` · ${l.pkg.orgOnly ? 'Launch' : 'Needed by'} ${formatDate(date)}` : ''}</span>
                  {xfCost(i) > 0 && <span className="muted">+ Extra format{watch.items[i].xf.length > 1 ? 's' : ''}: {watch.items[i].xf.join(', ')} ({formatPrice(xfCost(i))})</span>}
                  {watch.items?.[i]?.extras?.length > 0 && <span className="muted">+ {CHECKOUT_EXTRAS.filter(a => watch.items[i].extras.includes(a.key)).map(a => a.label + (a.price == null ? ' (quote)' : '')).join(', ')}{exCost(i) > 0 ? ` (${formatPrice(exCost(i))})` : ''}</span>}
                </div>
                <div className="review-side">
                  {l.pkg.price ? <b>{formatPrice(l.pkg.price + xfCost(i) + exCost(i))}</b> : <b>Quote</b>}
                  <button type="button" className="link-btn" onClick={() => go(2 + i)}>Edit</button>
                </div>
              </li>
            )
          })}
          {offTotal > 0 && <li className="review-discount"><span>Discount <span className="muted">{discount.rule.code} · {describeDiscount(discount.rule)}</span></span><b>−{money(offTotal)}</b></li>}
          <li className="review-tax">{taxed
            ? <><span>{exempt ? 'Sales tax' : SALES_TAX_LABEL}</span><b>{exempt ? 'Exempt' : money(taxTotal)}</b></>
            : <><span>Sales tax <span className="muted">(billing address outside New Jersey)</span></span><b>None</b></>}</li>
          <li className="review-total"><span>Total <span className="intro-tag">Introductory pricing</span></span><b>{money(total)}</b></li>
        </ul>
        <div className="discount-box">
          {discount.rule ? (
            <p className="discount-on">
              <span><b>{discount.rule.code}</b> applied{offTotal > 0 ? `: −${money(offTotal)}` : ', but it doesn’t apply to what’s in this order'}</span>
              <button type="button" className="link-btn" onClick={() => setDiscount({rule: null, error: '', busy: false})}>Remove</button>
            </p>
          ) : (
            <>
              <label htmlFor="discount-code" className="discount-label">Have a discount code?</label>
              <div className="discount-row">
                <input id="discount-code" name="discount_code" autoComplete="off" autoCapitalize="characters" placeholder="Enter code"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyCode() } }} />
                <button type="button" className="btn btn-ghost btn-sm" disabled={discount.busy} onClick={applyCode}>{discount.busy ? 'Checking…' : 'Apply'}</button>
              </div>
              {discount.error && <p className="form-error" role="alert">{discount.error}</p>}
            </>
          )}
        </div>
        {taxed && <div className="exempt-box">
          <label className="check"><input type="checkbox" name="tax_exempt" checked={exempt} onChange={e => setExempt(e.target.checked)} /><span>My organization is tax-exempt (for example, a nonprofit)</span></label>
          {exempt && (
            <div className="exempt-fields">
              <label>Why are you exempt?
                <select id="tax-reason" name="tax_reason" required defaultValue="" data-label="Tax exemption reason">
                  <option value="" disabled>Choose one</option>
                  {EXEMPT_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </label>
              <UploadCard name="tax_doc" icon="form" title="Exemption certificate" accept="image/*,.pdf"
                hint="Your exempt organization certificate (for example, NJ form ST-5) or other proof." />
            </div>
          )}
        </div>}
        <p className="review-edit"><button type="button" className="link-btn" onClick={() => go(0)}>Edit contact details</button> · <button type="button" className="link-btn" onClick={() => go(1)}>Edit brand</button></p>

        <section className="addons-card checkout-extras" aria-labelledby="extras-title">
          <div className="addons-head">
            <h3 id="extras-title">Add extras</h3>
            <p className="muted">Optional, and you can also add these later from your project page. Priced extras are added to your total. For quoted ones, we&rsquo;ll confirm a price with you before anything is charged.</p>
          </div>
          {lines.map((l, i) => (
            <div key={l.id}>
              {many && <p className="xtra-for">Video {i + 1}: {l.pkg.name}</p>}
              <ul className="addons-list">
                {CHECKOUT_EXTRAS.map(a => {
                  const videos = l.pkg.videos || 1
                  return (
                    <li key={a.key}>
                      <label>
                        <input type="checkbox" name={`i${i}_x_${a.key}`} />
                        <span><b>{a.label}</b><span className="muted">{a.desc}</span></span>
                      </label>
                      <span className="addons-price">{a.price != null ? <>{formatPrice(a.price * videos)}{videos > 1 && <small> ({formatPrice(a.price)} × {videos})</small>}</> : 'Quote'}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </section>

        {tokenUrl && <CardFields />}

        <div className="before">
          <h3>Before you submit</h3>
          <ul className="ticks">
            <li>Double-check names, prices, dates and phone numbers.</li>
            {lines.some(l => !l.pkg.orgOnly) && <li>Each video includes one approval step and one revision round.</li>}
            {lines.some(l => l.pkg.orgOnly) && <li>The Momentum Pack includes one sample video to approve and one revision round on the first video. The other 4 follow the approved look.</li>}
            <li>Your card is saved now and charged in full when we start your project. Cancel free anytime before then.</li>
          </ul>
        </div>

        <fieldset className="disclaimer-accept">
          <legend>AI Production Disclaimer</legend>
          <div className="disclaimer-box" tabIndex={0} ref={el => { if (el && !read && el.scrollHeight <= el.clientHeight + 8 && step === last) setRead(true) }}
            onScroll={e => { const el = e.currentTarget; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) { setRead(true); if (el.classList.contains('is-missing')) { el.classList.remove('is-missing'); setMissing(m => { const items = (m?.items || []).filter(i => i.key !== 'disclaimer-read'); return items.length ? {...m, items} : null }) } } }}>
            <DisclaimerText />
          </div>
          {!read && <p className="hint">Scroll to the end of the disclaimer to continue.</p>}
          <div className="checks-col disclaimer-points">
            {DISCLAIMER_POINTS.map((t, n) => (
              <label key={n} className="check check-block"><input type="checkbox" name={`dp${n}`} required data-label={`Disclaimer point ${n + 1}`} /><span>{t}</span></label>
            ))}
          </div>
          <label className={`check accept${read ? '' : ' is-locked'}`}>
            <input type="checkbox" name="accept_disclaimer" disabled={!read} required data-label="Accept the disclaimer" />
            <span>I&rsquo;ve read and accept the AI Production Disclaimer.</span>
          </label>
        </fieldset>

        {TURNSTILE_KEY && <div ref={humanBox} className="human-check" />}
        <p className="checkout-terms">By submitting, you agree to our <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>.</p>

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
