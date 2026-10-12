'use client'

import {useCallback, useEffect, useState} from 'react'
import {PACKAGES, NOT_SURE} from './packages'

// The order ("cart") lives in this browser only, until it's submitted.
const KEY = 'mint35-cart'
const EVENT = 'mint35-cart-change'
const VALID = new Set([...PACKAGES, NOT_SURE].map(p => p.slug))

function read() {
  try {
    const items = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(items) ? items.filter(i => i && VALID.has(i.slug) && i.id) : []
  } catch {
    return []
  }
}

function write(items) {
  try { localStorage.setItem(KEY, JSON.stringify(items)) } catch {}
  window.dispatchEvent(new Event(EVENT))
}

const newId = () => Math.random().toString(36).slice(2, 10)

export function addToCart(slug) {
  write([...read(), {id: newId(), slug}])
}

export function useCart() {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const sync = () => setItems(read())
    sync()
    setReady(true)
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const add = useCallback(slug => addToCart(slug), [])
  const remove = useCallback(id => write(read().filter(i => i.id !== id)), [])
  const clear = useCallback(() => write([]), [])

  return {items, ready, add, remove, clear}
}
