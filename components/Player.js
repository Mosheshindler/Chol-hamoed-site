export default function Player({video,aspect}){
  const hash = video.vimeoHash ? `&h=${encodeURIComponent(video.vimeoHash)}` : ''
  const src=video.provider==='vimeo'
    ? `https://player.vimeo.com/video/${video.videoId}?title=0&byline=0&portrait=0&dnt=1${hash}`
    // loop=1 + playlist=<same id> treats the video as a one-item playlist — without it,
    // YouTube's embed autoplays an unrelated suggested video once this one ends.
    : `https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${video.videoId}`
  const width=aspect?.width||16
  const height=aspect?.height||9
  const isVertical=height>width
  const style={aspectRatio:`${width} / ${height}`}
  return <div className={`playerShell${isVertical?' playerVertical':''}`} style={style}><iframe src={src} title={video.title} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen /></div>
}
