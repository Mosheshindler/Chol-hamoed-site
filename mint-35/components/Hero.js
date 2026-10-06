export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="container hero-grid">
        <div>
          <p className="eyebrow">A new product from Mint Media</p>
          <h1>AI commercials that sell in <span className="accent">30–60 seconds</span>.</h1>
          <p className="lead">Mint 35 turns your product, service or offer into a polished, scroll-stopping commercial. Written and directed by people, produced with AI, delivered ready to post.</p>
          <div className="hero-ctas">
            <a href="#contact" className="btn btn-primary">Start a project</a>
            <a href="#how" className="btn btn-outline">See how it works</a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="phone">
            <div className="phone-screen">
              <div className="scene" />
              <div className="scene-caption">Your product.<br />Your story.</div>
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
