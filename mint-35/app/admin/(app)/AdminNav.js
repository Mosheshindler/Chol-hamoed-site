'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'

const links = [{href: '/admin', label: 'Jobs'}, {href: '/admin/team', label: 'Team'}, {href: '/admin/settings', label: 'Settings'}]

export default function AdminNav() {
  const path = usePathname()
  return (
    <nav className="admin-nav">
      {links.map(l => {
        const active = l.href === '/admin' ? path === '/admin' || path.startsWith('/admin/projects') : path.startsWith(l.href)
        return <Link key={l.href} href={l.href} className={active ? 'active' : undefined}>{l.label}</Link>
      })}
    </nav>
  )
}
