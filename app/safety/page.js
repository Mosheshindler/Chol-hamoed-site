import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SafetyPageBody from './SafetyPageBody'

// Deliberately kept off every nav, footer, search, and sitemap — reachable only by
// visiting this URL directly (e.g. a filtering provider reviewing the site). noindex
// keeps it out of search results too, without blocking direct access.
export const metadata = {
  title: "Content Standards | Entertain-Mint",
  description: "Content safety and platform standards for Entertain-Mint.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

export default function Safety(){return <><Header/><SafetyPageBody/><Footer/></>}
