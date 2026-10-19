const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mint35.com').replace(/\/$/, '')

export default function sitemap() {
  return ['', '/start', '/ai-disclaimer', '/terms', '/privacy'].map(path => ({
    url: `${SITE}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.5,
  }))
}
