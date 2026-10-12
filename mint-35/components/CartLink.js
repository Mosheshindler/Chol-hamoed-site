'use client'

import Link from 'next/link'
import {useCart} from '@/lib/cart'

export default function CartLink() {
  const {items} = useCart()
  if (!items.length) return null
  return (
    <Link href="/start" className="cart-link" aria-label={`Your order: ${items.length} item${items.length > 1 ? 's' : ''}`}>
      Order <span className="cart-count">{items.length}</span>
    </Link>
  )
}
