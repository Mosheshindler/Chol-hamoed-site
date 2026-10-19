import {ADDONS} from '@/lib/addons'
import {formatPrice} from '@/lib/packages'

// The extras price list. Informational: customers request extras from their project page after approval.
export default function AddonsCard({className = ''}) {
  return (
    <div className={`addons-card ${className}`}>
      <div className="addons-head">
        <h3>Extras</h3>
        <p className="muted">Add any of these after you approve your video. Nothing is charged until we confirm it with you.</p>
      </div>
      <ul className="addons-list">
        {ADDONS.map(a => (
          <li key={a.key}>
            <span><b>{a.label}</b><span className="muted">{a.desc}</span></span>
            <span className="addons-price">{a.price != null ? <>{formatPrice(a.price)}{a.perVideo && <small> / video</small>}</> : 'Quote'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
