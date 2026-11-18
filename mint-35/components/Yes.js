// Tick list. An item can be {text, info} to open a popup, or {text, tip} for a hover/tap explanation.
export default function Yes({items}) {
  return (
    <ul className="yes">
      {items.map(i => typeof i === 'string' ? <li key={i}>{i}</li> : i.tip ? (
        <li key={i.text}>
          <span className="tip">
            {i.text}
            <button type="button" className="tip-btn" aria-label={`What does "${i.text}" mean?`}>?</button>
            <span className="tip-bubble" role="tooltip">{i.tip}</span>
          </span>
        </li>
      ) : (
        <li key={i.text}>
          <button type="button" className="info-link" data-open={i.info}>{i.text}<span className="info-i" aria-hidden="true">i</span></button>
        </li>
      ))}
    </ul>
  )
}
