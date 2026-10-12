import Logo from './Logo'
import CartLink from './CartLink'

export default function Header() {
  return (
    <header className="header">
      <div className="container header-row">
        <a href="/" aria-label="Mint 35 home"><Logo /></a>
        <nav className="nav" aria-label="Main">
          <a href="/#how">How It Works</a>
          <a href="/#work">Work</a>
          <a href="/#included">What&rsquo;s Included</a>
          <a href="/#packages">Packages</a>
          <a href="/#faq">FAQ</a>
        </nav>
        <div className="header-actions">
          <CartLink />
          <a href="/start" className="btn btn-primary btn-sm">Start<span className="hide-sm"> a Project</span></a>
        </div>
      </div>
    </header>
  )
}
