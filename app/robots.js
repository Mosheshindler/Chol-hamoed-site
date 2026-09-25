import {SITE_URL} from '../lib/site'

// /admin is behind login anyway, but keeping crawlers out of it entirely saves crawl
// budget; /safety stays crawlable (it opts out of indexing itself via its own noindex
// meta tag — see app/safety/page.js — which is the correct way to hide a page that still
// needs to be reachable by direct link).
export default function robots(){
  return {
    rules:[{userAgent:'*',allow:'/',disallow:['/admin','/admin/']}],
    sitemap:`${SITE_URL}/sitemap.xml`
  }
}
