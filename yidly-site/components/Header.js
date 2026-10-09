import Image from 'next/image'
import Link from 'next/link'

export default function Header(){
  return (
    <header className="header">
      <div className="wrap headerInner">
        <Link href="/" className="brand" aria-label="Yidly home">
          <Image src="/images/logo.png" alt="Yidly" width={350} height={167} priority/>
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href="/gadget-guy">Gadget Guy</Link>
          <Link href="/#videos">Videos</Link>
          <Link href="/#contact">Contact</Link>
          <Link href="/#club" className="btn btnYellow btnSmall">Join the Club</Link>
        </nav>
      </div>
    </header>
  )
}
