import Modal from './Modal'

const rows = [
  ['How we start', 'Online questionnaire', 'Strategy meetings'],
  ['Who decides the creative', 'Our team', 'Together with you'],
  ['Filming', 'No', 'Yes'],
  ['Script approvals', 'One', 'Collaborative'],
  ['Revision rounds', 'One', 'Multiple'],
  ['Price', 'Fixed package', 'Custom quote'],
  ['Best for', 'Short, focused videos', 'Custom films and campaigns'],
]

export default function CompareModal() {
  return (
    <>
      <button type="button" className="tell-more" data-open="compare-dialog">
        <span className="tell-more-text">
          <b>Need a full production?</b>
          <span>Filming, strategy calls, more revisions. That&rsquo;s Mint Media.</span>
        </span>
        <span className="tell-more-cta">Compare <span className="arrow">→</span></span>
      </button>

      <Modal id="compare-dialog" titleId="compare-title">
        <p className="eyebrow">Compare</p>
        <h2 id="compare-title">Mint 35 or Mint Media?</h2>
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
      </Modal>
    </>
  )
}
