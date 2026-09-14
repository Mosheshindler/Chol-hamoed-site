import Link from 'next/link'
import {SITE_LINKS} from '../lib/site'

const social=[
  ['YouTube',SITE_LINKS.youtube,'/assets/social/youtube.svg'],
  ['Instagram',SITE_LINKS.instagram,'/assets/social/instagram.svg'],
  ['Vimeo',SITE_LINKS.vimeo,'/assets/social/vimeo.svg'],
  ['WhatsApp',SITE_LINKS.whatsapp,'/assets/social/whatsapp.svg'],
  ['Website',SITE_LINKS.website,'/assets/social/website.svg'],
]
export default function Footer(){return <footer className="footer"><div className="wide footerInner">
  <Link href="/" className="footerLogo"><img src="/assets/mint-media-logo.png" alt="Mint Media"/></Link>
  <nav className="footerNav"><Link href="/">Browse</Link><Link href="/category/all-videos">Categories</Link><Link href="/collections">Collections</Link><Link href="/category/all-videos">All Videos</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></nav>
  <div className="socials">{social.map(([label,href,icon])=><a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}><img src={icon} alt="" aria-hidden="true"/></a>)}</div>
</div><div className="wide footerLegal"><span>© 2026 Mint Media. All rights reserved.</span><Link href="/safety" className="footerSafetyLink">Safety &amp; Content Policies</Link></div></footer>}
