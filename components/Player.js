export default function Player({video}){
  const hash = video.vimeoHash ? `&h=${encodeURIComponent(video.vimeoHash)}` : ''
  const src=video.provider==='vimeo'
    ? `https://player.vimeo.com/video/${video.videoId}?title=0&byline=0&portrait=0&dnt=1${hash}`
    : `https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0&modestbranding=1&playsinline=1`
  return <div className="playerShell"><iframe src={src} title={video.title} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen /></div>
}
