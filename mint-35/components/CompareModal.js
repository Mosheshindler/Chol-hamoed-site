'use client'

import {useRef} from 'react'

const rows = [
  ['How we start', 'Online questionnaire', 'Strategy meetings'],
  ['Who decides the creative', 'Our team', 'Together with you'],
  ['Filming', 'No', 'Yes'],
  ['Script approvals', 'One', 'Collaborative'],
  ['Revision rounds', 'One', 'Multiple'],
  ['Price', 'Fixed package', 'Custom quote'],
  ['Best for', 'Short, focused commercials', 'Custom films and campaigns'],
]

export default function CompareModal() {
  const ref = useRef(null)
  const open = () => ref.current?.showModal()
  const close = () => ref.current?.close()

  return (
    <>
      <button type="button" className="tell-more" data-open-compare onClick={open}>
        <span className="tell-more-icon" aria-hidden="true">?</span>
        <span><b>Need more control?</b> See how Mint 35 compares to Mint Media</span>
        <span className="tell-more-cta">Tell me more <span className="arrow">→</span></span>
      </button>

      <dialog ref={ref} id="compare-dialog" className="modal" aria-labelledby="compare-title"
        onClick={e => { if (e.target === e.currentTarget) close() }}>
        <div className="modal-body">
          <button type="button" className="modal-close" data-close-compare onClick={close} aria-label="Close">✕</button>
          <p className="eyebrow">Mint 35 or Mint Media?</p>
          <h2 id="compare-title">Need more control? That&rsquo;s a Mint Media project.</h2>
          <div className="table-wrap">
            <table className="compare-table">
              <thead><tr><th /><th className="hl">Mint 35</th><th>Mint Media</th></tr></thead>
              <tbody>
                {rows.map(([k, a, b]) => (
                  <tr key={k}><th scope="row">{k}</th><td className="hl">{a}</td><td>{b}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="compare-cta">Need full-service production? <a href="https://mintmediallc.com" target="_blank" rel="noopener noreferrer">Talk to Mint Media →</a></p>
        </div>
      </dialog>
    </>
  )
}
