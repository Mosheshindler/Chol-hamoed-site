/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Thumbnails come from Vimeo/YouTube's CDNs (full-size, e.g. 1280x720) or our own
    // Supabase storage bucket for custom uploads. Letting next/image optimize these
    // resizes them down to whatever a card actually displays at and serves modern
    // formats (WebP/AVIF), instead of shipping the full-size source image to every card.
    remotePatterns: [
      {protocol: 'https', hostname: 'i.vimeocdn.com'},
      {protocol: 'https', hostname: 'i.ytimg.com'},
      {protocol: 'https', hostname: 'qqytekjvhdrdxmogeeln.supabase.co'},
    ],
  },
}

module.exports = nextConfig
