import Icon from './Icon'

// Hero phone plays real frames from Mint 35 work (see /public/hero), ending on a CTA card.
const scenes = [
  {tag: 'Hook', line: 'Big news.', img: '/hero/allfit.webp'},
  {tag: 'Story', line: 'Show what’s new.', img: '/hero/due5.webp'},
  {tag: 'Call to action', line: 'Learn more →', end: true},
]

export default function Hero() {
  return (
    <section id="top" className="hero">
      <span className="hero-ghost" aria-hidden="true">35</span>
      <div className="container hero-grid">
        <div className="hero-copy">
          <h1>Powerful video.<br /><span className="accent">Simplified.</span></h1>
          <p className="hero-sub">Mint Media creativity. AI-powered.</p>
          <p className="hero-what">Short promo videos for businesses and organizations.</p>
          <ul className="nots-big">
            <li><Icon name="camera-off" />No film shoots</li>
            <li><Icon name="calendar-off" />No meetings</li>
            <li><Icon name="smile" />No hassle</li>
          </ul>
          <div className="hero-ctas">
            <a href="/start" className="btn btn-primary">Start a Project <span className="arrow">→</span></a>
            <a href="#work" className="btn btn-ghost">Watch Our Work</a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="phone">
            <div className="phone-screen">
              {scenes.map((s, i) => (
                <div key={s.tag} className={`shot shot-${i + 1}`}>
                  {s.img && <img src={s.img} alt="" className="shot-img" />}
                  {s.end && <img src="/brand/mint35-logo-v3.webp" alt="" className="shot-logo" />}
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
        </div>
      </div>
    </section>
  )
}
