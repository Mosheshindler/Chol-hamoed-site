import Modal from './Modal'
import {formats} from './formats'

export default function FormatsModal() {
  return (
    <Modal id="formats-dialog" titleId="formats-title">
      <p className="eyebrow">Video format</p>
      <h2 id="formats-title">Which shape is right for you?</h2>
      <p className="modal-lead">Every package includes one video format. Pick the shape that matches where your video will run most.</p>
      <div className="format-cards">
        {formats.map(f => (
          <div key={f.ratio} className="format-card">
            <div className="format-stage">
              <span className={`frame frame-${f.ratio.replace(':', '-')}`}><span className="play-mini" /></span>
            </div>
            <h3><span className="ratio">{f.ratio}</span> {f.name}</h3>
            <p>{f.what}</p>
            <p className="best-for">Best for</p>
            <ul className="yes">{f.uses.map(u => <li key={u}>{u}</li>)}</ul>
          </div>
        ))}
      </div>
      <p className="modal-foot">Not sure? Choose &ldquo;Recommend one for me&rdquo; on the form and we&rsquo;ll pick based on where it&rsquo;s running.</p>
    </Modal>
  )
}
