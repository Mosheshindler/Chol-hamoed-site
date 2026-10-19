'use client'

import {useEffect, useRef, useState} from 'react'

// Menu button for narrow screens, where the header's nav links are hidden.
export default function MobileMenu({links}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc) }
  }, [open])
  return (
    <div className="menu-wrap" ref={ref}>
      <button type="button" className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(o => !o)}>
        <span aria-hidden="true" className={`menu-icon${open ? ' is-open' : ''}`}><i /><i /><i /></span>
      </button>
      {open && (
        <nav id="mobile-menu" className="menu-panel" aria-label="Main">
          {links.map(([href, label]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        </nav>
      )}
    </div>
  )
}
