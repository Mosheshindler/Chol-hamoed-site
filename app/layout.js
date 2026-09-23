import './globals.css'
import './launch.css'
import {GoogleAnalytics} from '@next/third-parties/google'
export const metadata={title:'Entertain-Mint - a collection of Mint Media content',description:'Watch stories, documentaries, events, entertainment and more from Mint Media.'}
export default function RootLayout({children}){return <html lang="en"><body>{children}</body><GoogleAnalytics gaId="G-Q53CBD5P39"/></html>}
