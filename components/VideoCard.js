import Link from 'next/link'
import Image from 'next/image'

// Thumbnails used to be a plain CSS background-image, which the browser can't resize or
// prioritize intelligently — every card shipped the full-size source image (Vimeo/YouTube
// thumbnails run 100-200KB+ each) regardless of how small it actually renders on screen.
// next/image resizes to the real display size and serves modern formats, and only the
// first row (priority) skips lazy-loading so it doesn't compete with everything below it.
//
// TEMPORARY: `unoptimized` — Vercel's free-tier Image Optimization quota (5,000
// transformations/month) is exhausted for this billing cycle, so any new (image, size)
// combination the optimizer hasn't already cached now errors instead of loading. This skips
// Vercel's resizing entirely and serves each thumbnail's source URL directly (Vimeo/YouTube's
// CDN already serves a reasonably-sized image), trading a little extra download weight for
// thumbnails that reliably load. Remove `unoptimized` once the quota resets or the plan is
// upgraded, to get resizing/format-conversion back.
export default function VideoCard({video,priority=false}){
  // Driven entirely by the video's own "Featured on Homepage" + "Show Just Minted" admin
  // checkboxes, so the badge follows the video wherever its thumbnail shows up — homepage,
  // category pages, collections, search — not just the one row it was originally built for.
  const justMinted=video.featuredHome && video.showJustMintedHome!==false
  return <Link href={`/watch/${video.slug}`} className="card">
    <div className="thumb">
      <Image
        src={video.thumbnail}
        alt={video.title}
        fill
        sizes="(max-width:600px) 45vw,(max-width:900px) 30vw,(max-width:1200px) 22vw,18vw"
        style={{objectFit:'cover'}}
        priority={priority}
        unoptimized
      />
      {video.premium?<span className="premiumCardBadge">YIDLY PREMIUM</span>:(justMinted?<span className="justMintedCardBadge">JUST MINTED</span>:null)}
      {video.duration ? <span className="duration">{video.duration}</span> : null}
    </div>
    <div className="cardTitle">{video.title}</div>
    <div className="cardMeta">{video.category}</div>
  </Link>
}
