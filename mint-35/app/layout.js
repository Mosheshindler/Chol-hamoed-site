import './globals.css'

export const metadata = {
  title: 'Mint 35 — AI Commercials by Mint Media',
  description: 'Short, scroll-stopping 30–60 second AI commercials, scripted and directed by the Mint Media team.',
  openGraph: {
    title: 'Mint 35 — AI Commercials by Mint Media',
    description: 'Short, scroll-stopping 30–60 second AI commercials, scripted and directed by the Mint Media team.',
    type: 'website',
  },
}

export const viewport = {themeColor: '#0b0d0b'}

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
