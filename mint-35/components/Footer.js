import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo variant="full" />
          <p className="footer-tag">Short-form video. Simplified.</p>
        </div>
        <div className="footer-col">
          <p className="footer-head">Contact</p>
          <a href="mailto:info@mintmediallc.com">info@mintmediallc.com</a>
          <a href="tel:+17328134222">(732) 813-4222</a>
        </div>
        <div className="footer-col">
          <p className="footer-head">Full production</p>
          <a href="https://mintmediallc.com" target="_blank" rel="noopener noreferrer">Visit Mint Media →</a>
        </div>
      </div>
      <div className="container footer-copy">
        <span>© {new Date().getFullYear()} Mint Media LLC · Payments processed by Intuit Payments Inc.</span>
        <span className="legal-links">
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="/ai-disclaimer">AI Production Disclaimer</a>
        </span>
      </div>
    </footer>
  )
}
