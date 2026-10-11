// Posts to FormSubmit (no backend needed). The first submission sends a one-time
// confirmation email to info@mintmediallc.com; after confirming, projects arrive there
// with uploaded files attached.
import {formats} from './formats'

const placements = ['Social', 'Paid Advertising', 'YouTube', 'Website', 'Digital Signage', 'Streaming', 'Other']

export default function ProjectForm() {
  return (
    <form id="project-form" className="form" action="https://formsubmit.co/info@mintmediallc.com" method="POST" encType="multipart/form-data">
      <input type="hidden" name="_subject" value="New Mint 35 project" />
      <input type="hidden" name="_template" value="table" />
      <input type="text" name="_honey" className="hp" tabIndex={-1} autoComplete="off" />

      <h2>Tell us what we&rsquo;re making.</h2>

      <div className="form-row">
        <label>Name<input name="Name" required /></label>
        <label>Email<input type="email" name="Email" required /></label>
      </div>
      <div className="form-row">
        <label>Company / Organization<input name="Company / Organization" /></label>
        <label>Website<input name="Website" placeholder="https://" /></label>
      </div>

      <label>What are you promoting?<textarea name="What are you promoting" rows={3} required /></label>
      <label>Who is your target audience?
        <span className="hint">Age range, gender, location, interests, community.</span>
        <textarea name="Target audience" rows={3} required />
      </label>
      <label>What&rsquo;s the single most important thing they should know?<textarea name="Most important thing to know" rows={2} required /></label>
      <label>What do you want them to do after watching?<textarea name="Desired action" rows={2} required /></label>
      <label>What offer, price or information MUST appear?<textarea name="Must-appear information" rows={3} /></label>

      <fieldset>
        <legend>Where will the commercial run?</legend>
        <div className="checks">
          {placements.map(p => (
            <label key={p} className="check"><input type="checkbox" name={`Runs on: ${p}`} value="Yes" />{p}</label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="legend-row">
          <span>Which orientation do you need?</span>
          <button type="button" className="info-link" data-open="formats-dialog">What&rsquo;s the difference?<span className="info-i" aria-hidden="true">i</span></button>
        </legend>
        <div className="orient">
          {formats.map(f => (
            <label key={f.ratio} className="orient-opt">
              <input type="radio" name="Orientation" value={`${f.ratio} ${f.name}`} required />
              <span className={`frame frame-${f.ratio.replace(':', '-')}`} aria-hidden="true" />
              <b>{f.ratio}</b>
              <span className="orient-name">{f.name}</span>
            </label>
          ))}
          <label className="orient-opt">
            <input type="radio" name="Orientation" value="Not sure - recommend one" />
            <span className="frame frame-unsure" aria-hidden="true">?</span>
            <b>Not sure</b>
            <span className="orient-name">Recommend one for me</span>
          </label>
        </div>
      </fieldset>

      <label>When would you ideally like it delivered?
        <span className="hint">Subject to availability. First cut arrives 3 business days after production begins.</span>
        <input type="date" name="Ideal delivery date" />
      </label>

      <div className="form-row">
        <label>Upload your logo<input type="file" name="Logo" accept="image/*,.pdf,.svg,.ai,.eps" /></label>
        <label>Upload product / brand images<input type="file" name="Product / brand images" accept="image/*" multiple /></label>
      </div>
      <label>Brand colors<input name="Brand colors" placeholder="e.g. #88C040, deep green, white" /></label>
      <label>Required text / legal language<textarea name="Required text / legal language" rows={3} /></label>
      <label>Anything we absolutely cannot do?<textarea name="Cannot do" rows={2} /></label>
      <label><span>Creative references or links <span className="optional">— optional</span></span><textarea name="Creative references or links" rows={2} /></label>

      <div className="before">
        <h3>Before you submit</h3>
        <ul className="ticks">
          <li>Double-check names, prices, dates, URLs and phone numbers.</li>
          <li>You get one script approval and one revision round.</li>
          <li>The 3-day clock starts after script approval.</li>
          <li>Extra revisions or scope changes are quoted separately.</li>
        </ul>
      </div>

      <button type="submit" className="btn btn-primary">Submit My Project</button>
    </form>
  )
}
