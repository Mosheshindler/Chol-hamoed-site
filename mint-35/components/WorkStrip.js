'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import VideoSample from './VideoSample'
import {WORK} from '@/lib/samples'

// The homepage samples as one swipeable row: every card the same height, wide videos and Shorts side by side, captions
// over the video. A Momentum Pack series is one card holding its videos, each with a short label. Arrows scroll on larger screens.
export default function WorkStrip() {
  const ref = useRef(null)
  const [edge, setEdge] = useState({start: true, end: false})
  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setEdge({start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8})
  }, [])
  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update])
  const go = dir => ref.current?.scrollBy({left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth'})

  return (
    <div className={`work-strip-wrap${edge.start ? ' at-start' : ''}${edge.end ? ' at-end' : ''}`}>
      <div className="work-strip-nav">
        <button type="button" onClick={() => go(-1)} disabled={edge.start} aria-label="Previous videos">‹</button>
        <button type="button" onClick={() => go(1)} disabled={edge.end} aria-label="More videos">›</button>
      </div>
      <div className="work-strip" ref={ref} onScroll={update}>
        {WORK.map(w => w.series ? (
          <section key={w.title} className="work-series" aria-label={`${w.title}: ${w.kind}`}>
            <div className="series-head">
              <b>{w.title}</b>
              <span className="series-tag">{w.kind}</span>
            </div>
            <div className="series-videos">
              {w.videos.map(v => (
                <div key={v.id} className="series-video">
                  <VideoSample id={v.id} title={`${w.title}: ${v.label}`} vertical />
                  <span className="series-cap">{v.label}</span>
                </div>
              ))}
            </div>
          </section>
        ) : <VideoSample key={w.id} {...w} />)}
      </div>
    </div>
  )
}
