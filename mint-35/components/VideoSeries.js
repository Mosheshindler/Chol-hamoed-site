import VideoSample from './VideoSample'
import {packageByName} from '@/lib/packages'

// A Momentum Pack shown as a series: the campaign's milestone videos side by side, numbered, with every milestone in the
// pack listed and the ones shown here marked. Videos are YouTube Shorts (9:16).
export default function VideoSeries({title, kind, videos}) {
  const milestones = packageByName('Momentum Pack')?.milestones || []
  const shown = new Set(videos.map(v => v.milestone))
  return (
    <section className="work-series" aria-label={`${title}: ${kind} series`}>
      <div className="series-info">
        <p className="series-tag">{kind} series</p>
        <h3>{title}</h3>
        <p className="muted">One production, updated for each milestone of the fundraising campaign: new numbers, photos and text, the same look.</p>
        <ol className="series-steps" aria-label="Campaign milestones">
          {milestones.map((m, n) => (
            <li key={m} className={shown.has(m) ? 'on' : undefined}>
              <span className="series-num">{n + 1}</span>{m}{shown.has(m) ? '' : <span className="sr-only"> (not shown)</span>}
            </li>
          ))}
        </ol>
      </div>
      <div className="series-videos">
        {videos.map(v => (
          <div key={v.id} className="series-video">
            <VideoSample id={v.id} title={`${title}: ${v.label}`} vertical caption={false} />
            <p className="series-cap"><span className="series-num">{milestones.indexOf(v.milestone) + 1}</span><b>{v.milestone}</b><span className="muted">{v.label}</span></p>
          </div>
        ))}
      </div>
    </section>
  )
}
