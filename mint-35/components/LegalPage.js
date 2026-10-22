import Header from './Header'
import Footer from './Footer'

export const LEGAL_EFFECTIVE = 'October 22, 2026'

// Shared layout for the Terms and Privacy pages.
export default function LegalPage({eyebrow, title, children}) {
  return (
    <>
      <Header />
      <main className="section">
        <div className="container narrow legal">
          <a href="/" className="back-link">← Back to Mint 35</a>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="page-title">{title}</h1>
          <p className="legal-date">Effective {LEGAL_EFFECTIVE}</p>
          {children}
        </div>
      </main>
      <Footer />
    </>
  )
}
