// Official Mint 35 logo (transparent PNGs made from the supplied artwork).
// "full" includes the "Powered by mintmedia" line.
const LOGOS = {
  mark: {src: '/brand/mint35-logo.png', w: 640, h: 143},
  full: {src: '/brand/mint35-logo-full.png', w: 900, h: 255},
}

export default function Logo({variant = 'mark', className = ''}) {
  const l = LOGOS[variant]
  return <img src={l.src} width={l.w} height={l.h} alt="Mint 35" className={`logo-img logo-${variant} ${className}`} />
}
