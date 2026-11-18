'use client'

import {useState} from 'react'

// Downloads every file in a batch, one after another. The browser may ask once to allow
// several downloads from this site.
export default function DownloadAll({files}) {
  const [busy, setBusy] = useState(false)
  const ready = files.filter(f => f.url)
  if (!ready.length) return null
  async function run() {
    setBusy(true)
    for (const f of ready) {
      const a = document.createElement('a')
      a.href = f.url
      a.download = f.name
      document.body.appendChild(a)
      a.click()
      a.remove()
      await new Promise(r => setTimeout(r, 700))
    }
    setBusy(false)
  }
  return <button type="button" className="btn btn-ghost btn-sm" onClick={run} disabled={busy}>{busy ? 'Downloading…' : ready.length > 1 ? `Download all ${ready.length}` : 'Download'}</button>
}
