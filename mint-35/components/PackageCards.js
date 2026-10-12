import Link from 'next/link'
import {PACKAGES} from '@/lib/packages'
import Yes from './Yes'

// Package cards. Each button opens the Start page with that package chosen.
export default function PackageCards({selected, ctaLabel}) {
  return (
    <div className="packages">
      {PACKAGES.map(p => (
        <div key={p.slug} className={`package${p.featured ? ' featured' : ''}${selected === p.slug ? ' selected' : ''}`}>
          {p.featured && <span className="badge">Most popular</span>}
          <h3>{p.name}</h3>
          <p className="package-blurb">{p.blurb}</p>
          <Yes items={p.items} />
          <Link href={`/start?package=${p.slug}`} scroll className={`btn ${p.featured ? 'btn-primary' : 'btn-outline'}`}>
            {ctaLabel || p.cta} <span className="arrow">→</span>
          </Link>
        </div>
      ))}
    </div>
  )
}
