import './globals.css'
import './launch.css'
import {SITE_URL,SITE_IMAGE,SITE_IMAGE_DIMENSIONS} from '../lib/site'
import SignupPopup from '../components/SignupPopup'
import Analytics from '../components/Analytics'

const SITE_TITLE='Entertain-Mint - a collection of Mint Media content'
const SITE_DESCRIPTION='Watch stories, documentaries, events, entertainment and more from Mint Media.'

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
    images:[{url:SITE_IMAGE,...SITE_IMAGE_DIMENSIONS}]
  },
  twitter:{
    card:'summary_large_image',
    title:SITE_TITLE,
    description:SITE_DESCRIPTION,
    images:[SITE_IMAGE]
  }
}
export default function RootLayout({children}){return <html lang="en"><body>{children}<SignupPopup/></body><Analytics/></html>}
