'use client'

import {useEffect} from 'react'

// Opens any <dialog id="x"> from a button with data-open="x", closes it from data-close
// or a click on the backdrop.
export default function DialogController() {
  useEffect(() => {
    const onClick = e => {
      const opener = e.target.closest('[data-open]')
      if (opener) {
        e.preventDefault()
        document.getElementById(opener.dataset.open)?.showModal()
        return
      }
      if (e.target.closest('[data-close]')) e.target.closest('dialog')?.close()
      else if (e.target.tagName === 'DIALOG') e.target.close()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return null
}
