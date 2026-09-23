'use client'
import Link from 'next/link'

const TABS=[
  {key:'videos',label:'Video Library',href:'/admin'},
  {key:'links',label:'Link Builder',href:'/admin/links'}
]

export default function AdminTabs({active}){
  return <nav className="adminTabs">{TABS.map(t=><Link key={t.key} href={t.href} className={`adminTab${t.key===active?' active':''}`}>{t.label}</Link>)}</nav>
}
