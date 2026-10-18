import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {title: 'Page not found · Mint 35'}

// Shown for unknown URLs and for project links that don't match an order.
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="section">
        <div className="container narrow">
          <p className="eyebrow">Page not found</p>
          <h1 className="page-title">This link doesn&rsquo;t go anywhere.</h1>
          <p className="lead">If you followed a link to your project, check that it was copied in full, or email us at <a href="mailto:info@mintmediallc.com">info@mintmediallc.com</a> and we&rsquo;ll send it again.</p>
          <a href="/" className="btn btn-primary">Go to the homepage</a>
        </div>
      </main>
      <Footer />
    </>
  )
}
