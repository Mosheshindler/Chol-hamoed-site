import Logo from './Logo'

export default function Header() {
  return (
    <header className="header">
      <div className="container header-row">
        <a href="#top" aria-label="Mint 35 home"><Logo /></a>
        <nav className="nav" aria-label="Main">
          <a href="#how">How It Works</a>
          <a href="#work">Work</a>
          <a href="#included">What&rsquo;s Included</a>
          <a href="#packages">Packages</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a href="#start" className="btn btn-primary btn-sm">Start a Project</a>
      </div>
    </header>
  )
}
