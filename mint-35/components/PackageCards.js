import Link from 'next/link'
import {PACKAGES, formatPrice} from '@/lib/packages'
import Yes from './Yes'

// Package cards. Each button opens the Start page with that package chosen.
export default function PackageCards({selected, ctaLabel}) {
  return (
    <div className="packages">
      {PACKAGES.map(p => (
        <div key={p.slug} className={`package${p.featured ? ' featured' : ''}${selected === p.slug ? ' selected' : ''}`}>
          {p.featured && <span className="badge">Most popular</span>}
          {p.tag && <span className="badge badge-org">{p.tag}</span>}
          <h3>{p.name}</h3>
          <p className="price"><b>{formatPrice(p.price)}</b>{p.priceNote && <span>{p.priceNote}</span>}</p>
          <p className="package-blurb">{p.blurb}</p>
          {p.milestones && (
            <ol className="milestones" aria-label="The five videos">
              {p.milestones.map(m => <li key={m}><span aria-hidden="true" />{m}</li>)}
            </ol>
          )}
          <Yes items={p.items} />
          {p.footnote && <p className="package-foot">{p.footnote}</p>}
          <Link href={`/start?package=${p.slug}`} scroll className={`btn ${p.featured ? 'btn-primary' : 'btn-outline'}`}>
            {ctaLabel || p.cta} <span className="arrow">→</span>
          </Link>
        </div>
      ))}
    </div>
  )
}
