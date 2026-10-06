import Logo from './Logo'

export default function Header() {
  return (
    <header className="header">
      <div className="container header-row">
        <a href="#top" aria-label="Mint 35 home"><Logo /></a>
        <nav className="nav" aria-label="Main">
          <a href="#how">How it works</a>
          <a href="#work">Work</a>
          <a href="#packages">Packages</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a href="#contact" className="btn btn-primary btn-sm">Start a project</a>
      </div>
    </header>
  )
}
