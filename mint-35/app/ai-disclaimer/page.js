import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DisclaimerText from '@/components/DisclaimerText'
import {DISCLAIMER_TITLE} from '@/lib/disclaimer'

export const metadata = {title: 'AI Production Disclaimer · Mint 35'}

export default function DisclaimerPage() {
  return (
    <>
      <Header />
      <main className="section">
        <div className="container narrow">
          <a href="/" className="back-link">← Back to Mint 35</a>
          <p className="eyebrow">Good to know</p>
          <h1 className="page-title">{DISCLAIMER_TITLE}</h1>
          <DisclaimerText />
        </div>
      </main>
      <Footer />
    </>
  )
}
