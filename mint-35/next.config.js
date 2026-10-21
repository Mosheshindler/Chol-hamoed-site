/** @type {import('next').NextConfig} */
const nextConfig = {
  // This app lives in a subfolder of a repo that has its own lockfile at the root;
  // pin the build root here so Next doesn't pick the parent folder.
  turbopack: {root: __dirname},
  // Logos and hero frames get a new file name when they change, so browsers can keep them for a week.
  async headers() {
    const cache = [{key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400'}]
    return [{source: '/brand/:path*', headers: cache}, {source: '/hero/:path*', headers: cache}]
  },
}

module.exports = nextConfig
