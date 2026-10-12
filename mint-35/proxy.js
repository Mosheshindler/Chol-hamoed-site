import {NextResponse} from 'next/server'
import {createServerClient} from '@supabase/ssr'

const PUBLIC_ADMIN = ['/admin/login', '/admin/setup']

// Keeps the Supabase session cookie fresh and sends signed-out visitors to the login page.
// Pages still check membership on the server; this is only the first gate.
export async function proxy(request) {
  let response = NextResponse.next({request})
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: list => {
        list.forEach(({name, value}) => request.cookies.set(name, value))
        response = NextResponse.next({request})
        list.forEach(({name, value, options}) => response.cookies.set(name, value, options))
      },
    },
  })
  const {data: {user}} = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  if (!user && !PUBLIC_ADMIN.some(p => path.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = ''
    return NextResponse.redirect(url)
  }
  return response
}

export const config = {matcher: ['/admin/:path*']}
