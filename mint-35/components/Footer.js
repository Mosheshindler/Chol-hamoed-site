import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo variant="full" />
          <p className="footer-tag">Short-form video. Simplified.</p>
          <p className="muted">A product of Mint Media LLC</p>
        </div>
        <div>
          <p className="footer-head">Need a fully customized production?</p>
          <a className="link-arrow" href="https://mintmediallc.com" target="_blank" rel="noopener noreferrer">Visit Mint Media →</a>
        </div>
        <div className="footer-contact">
          <a href="mailto:info@mintmediallc.com">info@mintmediallc.com</a>
          <a href="tel:+17328134222">(732) 813-4222</a>
        </div>
      </div>
      <div className="container footer-copy muted">© {new Date().getFullYear()} Mint Media LLC</div>
    </footer>
  )
}
