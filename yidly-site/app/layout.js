import {DM_Sans,Fredoka} from 'next/font/google'
import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import {SITE_URL,SITE_NAME,TAGLINE} from '../lib/site'

const body=DM_Sans({subsets:['latin'],variable:'--font-body'})
const display=Fredoka({subsets:['latin'],weight:['500','600','700'],variable:'--font-display'})

export const metadata={
  metadataBase:new URL(SITE_URL),
  title:{default:`${SITE_NAME} | ${TAGLINE}`,template:`%s | ${SITE_NAME}`},
  description:'Yidly brings the fun home: wholesome videos, gameshows and adventures for the whole family, from Mint Media.',
  icons:{apple:'/images/apple-touch-icon.png'},
  openGraph:{type:'website',siteName:SITE_NAME,images:[{url:'/images/gadget-guy/banner.jpg',width:2000,height:553}]},
}

export default function RootLayout({children}){
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body>
        <Header/>
        <main>{children}</main>
        <Footer/>
      </body>
    </html>
  )
}
