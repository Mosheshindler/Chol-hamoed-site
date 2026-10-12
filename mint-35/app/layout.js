import './globals.css'

const title = 'Mint 35 — AI-Powered Commercials by Mint Media'
const description = 'A streamlined, fixed-scope way to create short commercials. Submit your project details and brand assets, and Mint 35 turns them into a finished 30–60 second spot.'

export const metadata = {
  title,
  description,
  openGraph: {title, description, type: 'website'},
  // Hidden from search engines until launch. Set NEXT_PUBLIC_ALLOW_INDEXING=true in Vercel to go public.
  robots: process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true' ? undefined : {index: false, follow: false},
}

export const viewport = {themeColor: '#0a0c0a'}

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Onest:wght@400;500;600;700&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  )
}
