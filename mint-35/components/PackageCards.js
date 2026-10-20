import {PACKAGES, formatPrice} from '@/lib/packages'
import Yes from './Yes'
import AddToCart from './AddToCart'

// Package cards. The button adds the package to the visitor's order.
export default function PackageCards() {
  return (
    <div className="packages">
      {PACKAGES.map(p => (
        <div key={p.slug} className={`package${p.featured ? ' featured' : ''}`}>
          {p.featured && <span className="badge">Most popular</span>}
          {p.tag && <span className="badge badge-org">{p.tag}</span>}
          <h3>{p.name}</h3>
          <p className="price"><b>{formatPrice(p.price)}</b>{p.priceNote && <span>{p.priceNote}</span>}</p>
          <p className="package-blurb">{p.blurb}</p>
          {p.why && <p className="package-why"><b>Why it costs less</b>{p.why}</p>}
          {p.milestones && (
            <ol className="milestones" aria-label="The five videos">
              {p.milestones.map(m => <li key={m}><span aria-hidden="true" />{m}</li>)}
            </ol>
          )}
          <Yes items={p.items} />
          {p.footnote && <p className="package-foot">{p.footnote}</p>}
          <AddToCart slug={p.slug} label="Add to order" primary={p.featured} />
        </div>
      ))}
    </div>
  )
}
