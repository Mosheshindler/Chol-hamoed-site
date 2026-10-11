import './globals.css'

const title = 'Mint 35 — AI-Powered Commercials by Mint Media'
const description = 'A streamlined, fixed-scope way to create short commercials. Submit your project details and brand assets, and Mint 35 turns them into a finished 30–60 second spot.'

export const metadata = {
  title,
  description,
  openGraph: {title, description, type: 'website'},
}

export const viewport = {themeColor: '#0b0d0b'}

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
