'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'

const TABS = [['', 'Overview'], ['/project', 'Project'], ['/billing', 'Billing'], ['/progress', 'Progress'], ['/communications', 'Communications']]

export default function JobTabs({base}) {
  const path = usePathname()
  return (
    <nav className="job-tabs" aria-label="Job sections">
      {TABS.map(([slug, label]) => (
        <Link key={label} href={base + slug} className={path === base + slug ? 'active' : undefined} aria-current={path === base + slug ? 'page' : undefined}>{label}</Link>
      ))}
    </nav>
  )
}
