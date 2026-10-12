'use client'

import Link from 'next/link'
import {useCart} from '@/lib/cart'

export default function AddToCart({slug, label, primary}) {
  const {items, add} = useCart()
  const count = items.filter(i => i.slug === slug).length
  return (
    <div className="add-cart">
      <button type="button" className={`btn ${primary ? 'btn-primary' : 'btn-outline'}`} onClick={() => add(slug)}>
        {count ? 'Add another' : label} <span className="plus" aria-hidden="true">+</span>
      </button>
      {count > 0 && (
        <Link href="/start" className="in-cart" aria-live="polite">
          ✓ {count} in your order · Review order →
        </Link>
      )}
    </div>
  )
}
