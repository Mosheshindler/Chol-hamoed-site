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
    // Left at Next's defaults, this generates candidate widths up to 3840px — no thumbnail
    // on this site is ever displayed wider than a few hundred pixels (video cards, "Up
    // Next" thumbnails). Every new (image, size) combination a visitor's browser requests
    // counts against Vercel's Image Optimization quota, so a much smaller, tailored list
    // means far fewer distinct combinations ever get created as the library grows — same
    // visual result, since Next always serves the nearest size at or above what's needed.
    deviceSizes: [420, 768, 1080],
    imageSizes: [96, 145, 256, 384],
  },
}

module.exports = nextConfig
