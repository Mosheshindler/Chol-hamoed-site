'use client'
import {GoogleAnalytics} from '@next/third-parties/google'
import {usePathname} from 'next/navigation'

// /admin has no metadata/title of its own, so every page view there was getting counted in
// Google Analytics under the site's generic default title — indistinguishable from real
// visitor traffic, and quietly skewing every report (engagement time, pageviews per user)
// with the site owner's own editing sessions. Same pathname-check pattern as SignupPopup.
export default function Analytics(){
  const pathname=usePathname()||''
  if(pathname.startsWith('/admin')) return null
  return <GoogleAnalytics gaId="G-Q53CBD5P39"/>
}
