import Icon from './Icon'

// Hero phone plays real frames from Mint 35 work (see /public/hero), ending on a CTA card.
const scenes = [
  {tag: 'Hook', line: 'Stop scrolling.', img: '/hero/allfit.jpg'},
  {tag: 'Story', line: 'Show what’s new.', img: '/hero/due5.jpg'},
  {tag: 'Call to action', line: 'Learn more →', end: true},
]

export default function Hero() {
  return (
    <section id="top" className="hero">
      <span className="hero-ghost" aria-hidden="true">35</span>
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Mint 35 · by Mint Media</p>
          <h1>Powerful video.<br /><span className="accent">Simplified.</span></h1>
          <p className="lead">Short videos that stop the scroll.</p>
          <ul className="nots">
            <li>No shoots</li>
            <li>No meetings</li>
            <li>No hassle</li>
          </ul>
          <div className="hero-ctas">
            <a href="/start" className="btn btn-primary">Start a Project <span className="arrow">→</span></a>
            <a href="#how" className="btn btn-ghost">How It Works</a>
          </div>
          <dl className="stats">
            <div><Icon name="clock" /><dt>30–60</dt><dd>seconds</dd></div>
            <div><Icon name="form" /><dt>1</dt><dd>simple form</dd></div>
            <div><Icon name="bolt" /><dt>3</dt><dd>business days to first cut<small>once in production</small></dd></div>
          </dl>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="phone">
            <div className="phone-screen">
              {scenes.map((s, i) => (
                <div key={s.tag} className={`shot shot-${i + 1}`}>
                  {s.img && <img src={s.img} alt="" className="shot-img" />}
                  {s.end && <img src="/brand/mint35-logo-v2.png" alt="" className="shot-logo" />}
                  <span className="shot-tag">{s.tag}</span>
                  <span className={s.end ? 'shot-btn' : 'shot-line'}>{s.line}</span>
                </div>
              ))}
              <div className="progress"><span /></div>
              <div className="screen-brand">mint<b>:35</b></div>
              <div className="timecode">0:35</div>
            </div>
          </div>
          <div className="float-card fc-1"><b>Script</b><span>Approved ✓</span></div>
          <div className="float-card fc-2"><b>9:16 · 1:1 · 16:9</b><span>Exported</span></div>
        </div>
      </div>
    </section>
  )
}
