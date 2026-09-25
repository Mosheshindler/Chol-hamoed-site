import './globals.css'
import './launch.css'
import {GoogleAnalytics} from '@next/third-parties/google'
import {SITE_URL} from '../lib/site'

const SITE_TITLE='Entertain-Mint - a collection of Mint Media content'
const SITE_DESCRIPTION='Watch stories, documentaries, events, entertainment and more from Mint Media.'
const SITE_IMAGE='/assets/about-hero.jpg'

// title.template applies "%s | Entertain-Mint" to any page-level `title` string automatically
// — pages below just set a short title (e.g. 'Stories') instead of repeating the suffix.
export const metadata={
  metadataBase:new URL(SITE_URL),
  title:{default:SITE_TITLE,template:'%s | Entertain-Mint'},
  description:SITE_DESCRIPTION,
  openGraph:{
    type:'website',
    siteName:'Entertain-Mint',
    title:SITE_TITLE,
    description:SITE_DESCRIPTION,
    url:SITE_URL,
    images:[{url:SITE_IMAGE,width:1024,height:476}]
  },
  twitter:{
    card:'summary_large_image',
    title:SITE_TITLE,
    description:SITE_DESCRIPTION,
    images:[SITE_IMAGE]
  }
}
export default function RootLayout({children}){return <html lang="en"><body>{children}</body><GoogleAnalytics gaId="G-Q53CBD5P39"/></html>}
