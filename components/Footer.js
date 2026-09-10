import Link from 'next/link'
import {SITE_LINKS} from '../lib/site'

function YouTube(){return <svg viewBox="0 0 28 28" aria-hidden="true"><rect x="2.5" y="6" width="23" height="16" rx="4"/><path d="M11.5 10l7 4-7 4z" className="socialCut"/></svg>}
function Instagram(){return <svg viewBox="0 0 28 28" aria-hidden="true"><rect x="3.5" y="3.5" width="21" height="21" rx="6"/><circle cx="14" cy="14" r="5.2" className="socialCut"/><circle cx="20.3" cy="7.8" r="1.3" className="socialCut"/></svg>}
function Vimeo(){return <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M4 9.3c2.6-2.4 5.9-4.7 8.2-4.9 2.7-.2 4.2 1.5 4.8 4.8.5 3.5.9 5.7 1.2 6.6.6 2.9 1.3 4.3 2.1 4.3.6 0 1.4-.9 2.6-2.8 1.1-1.8 1.7-3.2 1.8-4.1.1-1.7-.5-2.5-1.9-2.5-.7 0-1.4.1-2.2.4 1.4-4.5 4.1-6.7 8-6.6l-.7 4.4c-.8 4.3-3.9 9.1-8.9 14.5-3.2 3.5-5.9 5.2-8.1 5.2-1.4 0-2.6-1.3-3.5-3.8L5.6 18c-.8-2.6-1.7-3.8-2.6-3.8-.2 0-.9.4-2.1 1.3L0 13.8z" transform="scale(.78) translate(2 0)"/></svg>}
function WhatsApp(){return <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 3.4a10.5 10.5 0 0 0-8.9 16.1L3.5 25l5.7-1.5A10.5 10.5 0 1 0 14 3.4Z"/><path d="M9.5 8.7c.4-.3.9-.3 1.2.3l1.2 2.4c.2.4.1.8-.2 1.1l-.8.9c1.1 2.1 2.8 3.8 5 4.9l.9-.9c.3-.3.7-.4 1.1-.2l2.4 1.2c.6.3.6.8.3 1.3-.6 1-1.7 1.7-2.9 1.6-4.1-.3-9.2-4.9-9.6-9.1-.1-1.3.5-2.6 1.4-3.5Z" className="socialCut"/></svg>}

const social=[['YouTube',SITE_LINKS.youtube,YouTube],['Instagram',SITE_LINKS.instagram,Instagram],['Vimeo',SITE_LINKS.vimeo,Vimeo],['WhatsApp',SITE_LINKS.whatsapp,WhatsApp]]
export default function Footer(){return <footer className="footer"><div className="wide footerInner">
  <Link href="/" className="footerLogo"><img src="/assets/mint-media-logo.png" alt="Mint Media"/></Link>
  <nav className="footerNav"><Link href="/">Browse</Link><Link href="/category/all-videos">Categories</Link><Link href="/collections">Collections</Link><Link href="/category/all-videos">All Videos</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></nav>
  <div className="socials">{social.map(([label,href,Comp])=><a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}><Comp/></a>)}</div>
</div><div className="wide footerLegal"><span>© 2026 Mint Media. All rights reserved.</span><span>Strategic Video Production</span></div></footer>}
