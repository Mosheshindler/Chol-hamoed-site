import Image from 'next/image'
import Link from 'next/link'
import {LINKS} from '../lib/site'

export default function Footer(){
  return (
    <footer className="footer">
      <div className="wrap footerInner">
        <div className="footerLinks">
          <Link href="/gadget-guy">The Gadget Guy</Link>
          <Link href="/#videos">All Videos</Link>
          <Link href="/#club">Join the Club</Link>
          <Link href="/#contact">Contact</Link>
          <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
        </div>
        <a className="poweredBy" href={LINKS.mintMedia} target="_blank" rel="noopener noreferrer">
          <span>Powered by</span>
          <Image src="/images/mint-media.png" alt="Mint Media" width={210} height={66}/>
        </a>
        <p className="copyright">© {new Date().getFullYear()} Yidly. Family entertainment from Mint Media.</p>
      </div>
    </footer>
  )
}
