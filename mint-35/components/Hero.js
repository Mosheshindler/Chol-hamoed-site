export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="container hero-grid">
        <div>
          <p className="eyebrow">A new product from Mint Media</p>
          <h1>Your next commercial.<br /><span className="accent">Without the whole production.</span></h1>
          <p className="lead">Fill out one questionnaire. Get back a finished 30–60 second commercial.</p>
          <ul className="nots">
            <li>No shoot days</li>
            <li>No meetings</li>
            <li>No AI skills needed</li>
          </ul>
          <div className="hero-ctas">
            <a href="#start" className="btn btn-primary">Start a Project</a>
            <a href="#how" className="btn btn-outline">See How It Works</a>
          </div>
          <dl className="facts">
            <div><dt>30–60</dt><dd>second spot</dd></div>
            <div><dt>1</dt><dd>questionnaire</dd></div>
            <div><dt>3</dt><dd>business days to first cut*</dd></div>
          </dl>
          <p className="footnote">*After script approval, once your project enters production.</p>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="phone">
            <div className="phone-screen">
              <div className="scene" />
              <div className="progress"><span /></div>
              <div className="timer">0:35</div>
            </div>
          </div>
          <div className="wide">
            <div className="wide-screen"><span className="play" /></div>
          </div>
        </div>
      </div>
    </section>
  )
}
