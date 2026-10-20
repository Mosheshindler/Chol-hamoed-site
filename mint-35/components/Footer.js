import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <a href="https://mintmediallc.com" className="footer-powered" target="_blank" rel="noopener noreferrer">
            <span>Powered by</span>
            <img src="/brand/mint-media-logo.png" alt="Mint Media" width="1201" height="190" />
          </a>
          <p className="footer-tag">Powerful video. Simplified.</p>
        </div>
        <div className="footer-col">
          <p className="footer-head">Contact</p>
          <a href="mailto:info@mintmediallc.com">info@mintmediallc.com</a>
          <a href="tel:+17328134222">(732) 813-4222</a>
        </div>
      </div>
      <div className="container footer-copy">
        <span>© {new Date().getFullYear()} Mint Media LLC <span className="footer-dot">·</span> <span className="footer-pay">Payments processed by Intuit Payments Inc.</span></span>
        <span className="legal-links">
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="/ai-disclaimer">AI Production Disclaimer</a>
        </span>
      </div>
    </footer>
  )
}
