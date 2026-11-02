'use client'

import {useState} from 'react'

// Shows the YouTube thumbnail and only loads the player when clicked, to keep the page fast.
// The thumbnail stays on top until the player has loaded, so there's no black box while it starts.
export default function VideoSample({id, title, kind, vertical}) {
  // Shorts use YouTube's tall cover image; wide videos the 16:9 one.
  const thumb = vertical ? 'oardefault' : 'maxresdefault'
  const [playing, setPlaying] = useState(false)
  const [loaded, setLoaded] = useState(false)
  return (
    <figure className="work-item">
      <div className={`work-frame${vertical ? ' work-frame-vertical' : ''}`}>
        {playing && (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&cc_load_policy=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setTimeout(() => setLoaded(true), 900)}
          />
        )}
        {!loaded && (
          <button type="button" className={`work-poster${playing ? ' is-loading' : ''}`} onClick={() => setPlaying(true)} aria-label={`Play ${title}`} disabled={playing}>
            <picture>
              <source srcSet={`https://i.ytimg.com/vi_webp/${id}/${thumb}.webp`} type="image/webp" />
              <img src={`https://i.ytimg.com/vi/${id}/${thumb}.jpg`} alt={`${title} video`} loading="lazy" />
            </picture>
            <span className="play" aria-hidden="true" />
          </button>
        )}
      </div>
      <figcaption><b>{title}</b>{kind && <span>{kind}</span>}</figcaption>
    </figure>
  )
}
