import Link from 'next/link'
import Image from 'next/image'

// Thumbnails used to be a plain CSS background-image, which the browser can't resize or
// prioritize intelligently — every card shipped the full-size source image (Vimeo/YouTube
// thumbnails run 100-200KB+ each) regardless of how small it actually renders on screen.
// next/image resizes to the real display size and serves modern formats, and only the
// first row (priority) skips lazy-loading so it doesn't compete with everything below it.
export default function VideoCard({video,justMinted=false,priority=false}){
  return <Link href={`/watch/${video.slug}`} className="card">
    <div className="thumb">
      <Image
        src={video.thumbnail}
        alt={video.title}
        fill
        sizes="(max-width:600px) 45vw,(max-width:900px) 30vw,(max-width:1200px) 22vw,18vw"
        style={{objectFit:'cover'}}
        priority={priority}
      />
      {video.premium?<span className="premiumCardBadge">YIDLY PREMIUM</span>:(justMinted?<span className="justMintedCardBadge">JUST MINTED</span>:null)}
      {video.duration ? <span className="duration">{video.duration}</span> : null}
    </div>
    <div className="cardTitle">{video.title}</div>
    <div className="cardMeta">{video.category}</div>
  </Link>
}
