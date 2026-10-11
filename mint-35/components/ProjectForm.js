// Posts to FormSubmit (no backend needed). The first submission sends a one-time
// confirmation email to info@mintmediallc.com; after confirming, projects arrive there
// with uploaded files attached.
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
        <span className="hint">Who do you want watching this commercial? Please describe your ideal audience, including relevant details such as age range, gender, geographic location, interests, community or other important demographics.</span>
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

      <label>When would you ideally like it delivered?
        <span className="hint">Production dates are subject to availability. Once your project officially begins production, your first completed version will be delivered within three business days.</span>
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
        <h3>Before submitting</h3>
        <p>Please make sure all names, prices, dates, URLs, offers, phone numbers and required information are accurate.</p>
        <p>By submitting your project, you understand that Mint 35 is a fixed-scope production service that includes one script approval opportunity and one consolidated round of creative revisions.</p>
        <p>Your project will enter our production queue after submission and acceptance. The three-business-day turnaround begins only when your project officially enters production, following script approval.</p>
        <p>Additional creative revisions or major changes to the original project scope are not included and may be quoted separately.</p>
      </div>

      <button type="submit" className="btn btn-primary">Submit My Project</button>
    </form>
  )
}
