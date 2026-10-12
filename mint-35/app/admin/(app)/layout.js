import Link from 'next/link'
import Logo from '@/components/Logo'
import {redirect} from 'next/navigation'
import {createClient} from '@/lib/supabase/server'
import {signOut} from '../actions'
import AdminNav from './AdminNav'
import '../admin.css'

export const metadata = {title: 'Mint 35 Admin', robots: {index: false}}
export const dynamic = 'force-dynamic'

export default async function AdminLayout({children}) {
  const supabase = await createClient()
  const {data: {user}} = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const {data: me} = await supabase.from('team_members').select('name, role').eq('id', user.id).maybeSingle()
  if (!me) {
    await supabase.auth.signOut()
    redirect('/admin/login')
  }

  return (
    <div className="admin">
      <header className="admin-bar">
        <Link href="/admin" aria-label="Mint 35 admin home"><Logo /></Link>
        <AdminNav />
        <div className="admin-me">
          <span>{me.name}</span>
          <form action={signOut}><button className="link-btn">Sign out</button></form>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  )
}
