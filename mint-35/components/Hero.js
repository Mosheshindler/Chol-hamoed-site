export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="container hero-grid">
        <div>
          <p className="eyebrow">A new product from Mint Media</p>
          <h1>Your next commercial.<br /><span className="accent">Without the whole production.</span></h1>
          <p className="lead">Mint 35 is a streamlined way to create a polished 30–60 second commercial.</p>
          <ol className="hero-steps">
            <li>You fill out our project questionnaire.</li>
            <li>Upload your brand assets.</li>
            <li>We take it from there.</li>
          </ol>
          <ul className="nots">
            <li>No shoot days.</li>
            <li>No production meetings.</li>
            <li>No complicated production process.</li>
          </ul>
          <p className="hero-just">Just a focused commercial created by Mint Media using a streamlined AI-powered production process.</p>
          <div className="hero-ctas">
            <a href="#start" className="btn btn-primary">Start a Project</a>
            <a href="#how" className="btn btn-outline">See How It Works</a>
          </div>
          <p className="hero-tagline">Less process. Professional creative. One finished spot.</p>
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
