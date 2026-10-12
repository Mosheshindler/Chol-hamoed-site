const scenes = [
  {tag: 'Hook', line: 'Stop scrolling.'},
  {tag: 'Product', line: 'Meet your product.'},
  {tag: 'Offer', line: '20% off this week.'},
  {tag: 'Call to action', line: 'Shop now →'},
]

export default function Hero() {
  return (
    <section id="top" className="hero">
      <span className="hero-ghost" aria-hidden="true">35</span>
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">A new product from Mint Media</p>
          <h1>Your next commercial.<br /><span className="accent">Without the whole production.</span></h1>
          <p className="lead">Fill out one questionnaire. Get back a finished 30–60 second commercial.</p>
          <ul className="nots">
            <li>No shoot days</li>
            <li>No meetings</li>
            <li>No AI skills needed</li>
          </ul>
          <div className="hero-ctas">
            <a href="/start" className="btn btn-primary">Start a Project <span className="arrow">→</span></a>
            <a href="#how" className="btn btn-ghost">See How It Works</a>
          </div>
          <dl className="facts">
            <div><dt>30–60</dt><dd>second spot</dd></div>
            <div><dt>1</dt><dd>questionnaire</dd></div>
            <div><dt>3<sup>*</sup></dt><dd>business days to first cut</dd></div>
          </dl>
          <p className="footnote">*After script approval, once your project enters production.</p>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="phone">
            <div className="phone-screen">
              {scenes.map((s, i) => (
                <div key={s.tag} className={`shot shot-${i + 1}`}>
                  <span className="shot-tag">{s.tag}</span>
                  <span className="shot-line">{s.line}</span>
                </div>
              ))}
              <div className="progress"><span /></div>
              <div className="rec"><i />REC</div>
              <div className="timecode">0:<span className="tc" /></div>
            </div>
          </div>
          <div className="float-card fc-1"><b>Script</b><span>Approved ✓</span></div>
          <div className="float-card fc-2"><b>9:16 · 1:1 · 16:9</b><span>Exported</span></div>
        </div>
      </div>
    </section>
  )
}
