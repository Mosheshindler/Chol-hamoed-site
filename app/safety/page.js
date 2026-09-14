import Header from '../../components/Header'
import Footer from '../../components/Footer'

// Not linked from the header nav on purpose — reachable only via the small link in the
// footer, for content-filtering companies reviewing our policies. Placeholder copy below;
// swap in the real policy text whenever it's ready.
export default function Safety(){return <><Header/><main className="wide safetyPage">
  <div className="eyebrow">SAFETY &amp; CONTENT POLICIES</div>
  <h1>Safety &amp; Content Policies</h1>
  <div className="safetyBody">
    <p>This page will outline Mint Media's safety and content review policies. Full details coming soon.</p>
    <p>For questions in the meantime, please <a href="/contact">contact us</a>.</p>
  </div>
</main><Footer/></>}
