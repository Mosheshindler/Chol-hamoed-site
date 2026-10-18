// Official Mint 35 logo (transparent, made from the supplied artwork; lossless WebP of the v2 PNGs, same pixels).
// "full" includes the "Powered by mintmedia" line.
const LOGOS = {
  mark: {src: '/brand/mint35-logo-v3.webp', w: 640, h: 143},
  full: {src: '/brand/mint35-logo-full-v3.webp', w: 510, h: 144},
}

export default function Logo({variant = 'mark', className = ''}) {
  const l = LOGOS[variant]
  return <img src={l.src} width={l.w} height={l.h} alt="Mint 35" className={`logo-img logo-${variant} ${className}`} />
}
