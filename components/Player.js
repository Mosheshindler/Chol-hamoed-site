export default function Player({video,aspect}){
  const hash = video.vimeoHash ? `&h=${encodeURIComponent(video.vimeoHash)}` : ''
  const src=video.provider==='vimeo'
    ? `https://player.vimeo.com/video/${video.videoId}?title=0&byline=0&portrait=0&dnt=1${hash}`
    : `https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0&modestbranding=1&playsinline=1`
  const width=aspect?.width||16
  const height=aspect?.height||9
  const isVertical=height>width
  const style={aspectRatio:`${width} / ${height}`}
  return <div className={`playerShell${isVertical?' playerVertical':''}`} style={style}><iframe src={src} title={video.title} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen /></div>
}
