'use client'

import {useEffect, useRef, useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useCart, addToCart} from '@/lib/cart'
import {PACKAGES, NOT_SURE, packageBySlug, formatPrice} from '@/lib/packages'
import Yes from '@/components/Yes'
import ProjectForm from '@/components/ProjectForm'

export default function StartFlow({step, legacyPackage}) {
  const router = useRouter()
  const {items, ready, add, remove, clear} = useCart()
  const handledLegacy = useRef(false)
  const [done, setDone] = useState(null)

  // Old links like /start?package=single-35 add that package, then go to the form.
  useEffect(() => {
    if (!legacyPackage || handledLegacy.current) return
    handledLegacy.current = true
    if (packageBySlug(legacyPackage)) addToCart(legacyPackage)
    router.replace('/start?step=details')
  }, [legacyPackage, router])

  const lines = items.map(i => ({...i, pkg: packageBySlug(i.slug)}))
  const total = lines.reduce((s, l) => s + (l.pkg.price || 0), 0)
  const hasUnpriced = lines.some(l => !l.pkg.price)

  if (done) {
    return (
      <div className="form form-done" role="status">
        <span className="done-check" aria-hidden="true">✓</span>
        <h1>Got it. We&rsquo;re on it.</h1>
        {done.refs?.length > 0 && (
          <p className="done-ref">Your reference number{done.refs.length > 1 ? 's are' : ' is'} <b>{done.refs.join(', ')}</b>.</p>
        )}
        <p>We&rsquo;ll review your order and email you. Your card is only charged once your order enters our production queue.</p>
        {done.missed > 0 && <p className="form-error">{done.missed} file(s) didn&rsquo;t upload. Reply to our email and attach them there.</p>}
        <Link href="/" className="btn btn-ghost">Back to home</Link>
      </div>
    )
  }

  return (
    <>
      <ol className="stepper" aria-label="Progress">
        <li className={step === 'order' ? 'current' : 'done'}><span>1</span>Build your order</li>
        <li className={step === 'details' ? 'current' : undefined}><span>2</span>Project details</li>
      </ol>

      {step === 'order' ? (
        <div className="order-grid">
          <section aria-labelledby="choose-title" className="order-choose">
            <h1 id="choose-title">Build your order</h1>
            <p className="lead">Add one or more packages. You can add the same package more than once.</p>
            <div className="mini-packages">
              {PACKAGES.map(p => {
                const n = items.filter(i => i.slug === p.slug).length
                return (
                  <div key={p.slug} className={`mini-package${n ? ' in' : ''}`}>
                    <div className="mini-head">
                      <h3>{p.name}{p.tag && <span className="mini-tag">{p.tag}</span>}</h3>
                      <b className="mini-price">{formatPrice(p.price)}</b>
                    </div>
                    <p className="package-blurb">{p.blurb}</p>
                    <Yes items={p.items} />
                    <button type="button" className={`btn btn-sm ${n ? 'btn-ghost' : 'btn-primary'}`} onClick={() => add(p.slug)}>
                      {n ? `Add another (${n} in order)` : 'Add to order'} <span aria-hidden="true">+</span>
                    </button>
                  </div>
                )
              })}
            </div>
            <p className="package-note">
              Not sure which fits? <button type="button" className="link-btn" onClick={() => add(NOT_SURE.slug)}>Add a project and we&rsquo;ll recommend a package</button>
            </p>
          </section>

          <aside className="order-summary" aria-label="Your order">
            <h2>Your order</h2>
            {!ready ? null : lines.length === 0 ? (
              <p className="muted">Nothing added yet. Add a package to get started.</p>
            ) : (
              <ul className="order-lines">
                {lines.map(l => (
                  <li key={l.id}>
                    <span>{l.pkg.name}</span>
                    <b>{l.pkg.price ? formatPrice(l.pkg.price) : 'Quote'}</b>
                    <button type="button" className="remove" onClick={() => remove(l.id)} aria-label={`Remove ${l.pkg.name}`}>✕</button>
                  </li>
                ))}
              </ul>
            )}
            <div className="order-total"><span>Total</span><b>{formatPrice(total)}{hasUnpriced ? ' + quote' : ''}</b></div>
            <p className="order-fine">Your card is saved when you place your order. We only charge it once your order enters our production queue.</p>
            {lines.length > 0
              ? <Link href="/start?step=details" className="btn btn-primary order-continue">Continue to project details →</Link>
              : <button type="button" className="btn btn-primary order-continue" disabled>Continue to project details →</button>}
          </aside>

          {lines.length > 0 && (
            <div className="order-bar">
              <span><b>{formatPrice(total)}</b>{hasUnpriced ? ' + quote' : ''} · {lines.length} item{lines.length > 1 ? 's' : ''}</span>
              <Link href="/start?step=details" className="btn btn-primary btn-sm">Continue →</Link>
            </div>
          )}
        </div>
      ) : !ready ? null : lines.length === 0 ? (
        <div className="empty-order">
          <h1>Your order is empty</h1>
          <p className="lead">Add at least one package to continue.</p>
          <Link href="/start" className="btn btn-primary">Choose packages →</Link>
        </div>
      ) : (
        <section className="start-form" aria-labelledby="form-title">
          <div className="chosen">
            <span className="chosen-label">Your order</span>
            <b>{lines.map(l => l.pkg.name).join(' + ')}</b>
            <span className="chosen-price">{formatPrice(total)}{hasUnpriced ? ' + quote' : ''}</span>
            <Link href="/start" className="chosen-change">Edit order</Link>
          </div>
          {lines.some(l => l.pkg.orgOnly) && (
            <p className="org-note">{lines.find(l => l.pkg.orgOnly).pkg.name} is for organizations running a fundraising campaign. Please include your organization&rsquo;s name.</p>
          )}
          <ProjectForm lines={lines} onDone={result => { setDone(result); clear() }} />
        </section>
      )}
    </>
  )
}
