import './globals.css'
import {Bricolage_Grotesque, Onest} from 'next/font/google'

// Fonts are downloaded at build time and served from our own domain (no Google request per visit).
const display = Bricolage_Grotesque({subsets: ['latin'], axes: ['opsz'], variable: '--font-display', display: 'swap'})
const body = Onest({subsets: ['latin'], variable: '--font-body', display: 'swap'})

const title = 'Mint 35 — Powerful video. Simplified.'
const description = 'Mint Media creativity. AI-powered. Short videos, promos and ads with no film shoots, no meetings and no hassle.'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mint35.com'),
  title,
  description,
  openGraph: {title, description, type: 'website', siteName: 'Mint 35'},
  twitter: {card: 'summary_large_image', title, description},
  // Hidden from search engines until launch. Set NEXT_PUBLIC_ALLOW_INDEXING=true in Vercel to go public.
  robots: process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true' ? undefined : {index: false, follow: false},
}

export const viewport = {themeColor: '#0a0c0a'}

export default function RootLayout({children}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
