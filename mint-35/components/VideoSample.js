'use client'

import {useState} from 'react'

// Shows the YouTube thumbnail and only loads the player when clicked, to keep the page fast.
export default function VideoSample({id, title}) {
  const [playing, setPlaying] = useState(false)
  return (
    <figure className="work-item">
      <div className="work-frame">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button type="button" className="work-poster" onClick={() => setPlaying(true)} aria-label={`Play ${title}`}>
            <img src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`} alt="" loading="lazy" />
            <span className="play" aria-hidden="true" />
          </button>
        )}
      </div>
      <figcaption>{title}</figcaption>
    </figure>
  )
}
