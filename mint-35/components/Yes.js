// Tick list; an item can be {text, info} to open a popup explaining it.
export default function Yes({items}) {
  return (
    <ul className="yes">
      {items.map(i => typeof i === 'string' ? <li key={i}>{i}</li> : (
        <li key={i.text}>
          <button type="button" className="info-link" data-open={i.info}>{i.text}<span className="info-i" aria-hidden="true">i</span></button>
        </li>
      ))}
    </ul>
  )
}
