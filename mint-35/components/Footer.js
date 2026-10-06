import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-row">
        <Logo />
        <p>AI commercials by <a href="https://mintmediallc.com" target="_blank" rel="noopener noreferrer">Mint Media</a></p>
        <p className="muted">© {new Date().getFullYear()} Mint Media LLC</p>
      </div>
    </footer>
  )
}
