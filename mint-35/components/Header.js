import Logo from './Logo'
import CartLink from './CartLink'
import MobileMenu from './MobileMenu'

const LINKS = [
  ['/#how', 'How It Works'],
  ['/#included', 'What’s Included'],
  ['/#packages', 'Packages'],
  ['/#work', 'Work'],
  ['/#faq', 'FAQ'],
]

export default function Header() {
  return (
    <header className="header">
      <div className="container header-row">
        <a href="/" aria-label="Mint 35 home"><Logo /></a>
        <nav className="nav" aria-label="Main">
          {LINKS.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <div className="header-actions">
          <CartLink />
          <a href="/start" className="btn btn-primary btn-sm">Start<span className="hide-sm">a Project</span></a>
          <MobileMenu links={LINKS} />
        </div>
      </div>
    </header>
  )
}
