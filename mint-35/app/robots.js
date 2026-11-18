// Search engines are kept out until launch (NEXT_PUBLIC_ALLOW_INDEXING=true); admin and customer pages always.
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mint35.com').replace(/\/$/, '')

export default function robots() {
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'true') return {rules: {userAgent: '*', disallow: '/'}}
  return {rules: {userAgent: '*', allow: '/', disallow: ['/admin', '/p/', '/api/']}, sitemap: `${SITE}/sitemap.xml`}
}
