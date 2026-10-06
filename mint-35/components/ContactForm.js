// Uses FormSubmit (no backend needed). The first submission sends a one-time
// confirmation email to info@mintmediallc.com; after confirming, messages arrive there.
export default function ContactForm() {
  return (
    <form className="form" action="https://formsubmit.co/info@mintmediallc.com" method="POST">
      <input type="hidden" name="_subject" value="New Mint 35 inquiry" />
      <input type="hidden" name="_template" value="table" />
      <input type="text" name="_honey" className="hp" tabIndex={-1} autoComplete="off" />
      <div className="form-row">
        <label>Name<input name="name" required /></label>
        <label>Email<input type="email" name="email" required /></label>
      </div>
      <div className="form-row">
        <label>Company<input name="company" /></label>
        <label>Length
          <select name="length" defaultValue="30 seconds">
            <option>15 seconds</option>
            <option>30 seconds</option>
            <option>45 seconds</option>
            <option>60 seconds</option>
            <option>Not sure yet</option>
          </select>
        </label>
      </div>
      <label>What are you promoting?<textarea name="message" rows={5} required /></label>
      <button type="submit" className="btn btn-primary">Send inquiry</button>
    </form>
  )
}
