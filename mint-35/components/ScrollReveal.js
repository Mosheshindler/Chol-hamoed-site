'use client'

import {useEffect} from 'react'

// Fades homepage blocks up as they scroll into view. Without JS, or with reduced motion, everything just shows.
const TARGETS = [
  '.section .eyebrow', '.section h2', '.work-item', '.benefit', '.uses', '.mm-band > *', '.timeline > li',
  '.yesno > .card', '.tell-more', '.package', '.packages-note', '.formats-band', '.compare-hint', '.faqs > details', '.start-band > *',
].join(', ')

export default function ScrollReveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = [...document.querySelectorAll(TARGETS)].filter(el => !el.closest('.hero, dialog'))
    const seen = new Map()
    for (const el of els) {
      // Siblings arriving together come in one after another.
      const n = seen.get(el.parentElement) || 0
      seen.set(el.parentElement, n + 1)
      el.style.setProperty('--reveal-delay', `${Math.min(n, 5) * 70}ms`)
      el.classList.add('reveal')
    }
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const el = e.target
        el.classList.add('in')
        io.unobserve(el)
        // Hand back to the element's own hover/transition styles once it has arrived.
        setTimeout(() => { el.classList.remove('reveal', 'in'); el.style.removeProperty('--reveal-delay') }, 1100)
      }
    }, {rootMargin: '0px 0px -8% 0px'})
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
