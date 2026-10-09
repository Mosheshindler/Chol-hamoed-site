import {LINKS,MAILCHIMP} from '../lib/site'

export default function JoinClub({id='club',title='Join the Yidly Club',text}){
  return (
    <section className="club" id={id}>
      <div className="wrap clubInner">
        <div>
          <h2>{title}</h2>
          <p>{text||'Be the first to hear about new videos, behind-the-scenes peeks and special surprises for your family.'}</p>
        </div>
        <div className="clubActions">
          <form action={MAILCHIMP.action} method="post" target="_blank" className="clubForm">
            <label htmlFor={`${id}-email`} className="srOnly">Email address</label>
            <input id={`${id}-email`} type="email" name="EMAIL" placeholder="Your email address" required/>
            {/* Mailchimp's bot trap — real people never fill this in. */}
            <div aria-hidden="true" className="srOnly"><input type="text" name={MAILCHIMP.honeypot} tabIndex={-1} defaultValue=""/></div>
            <button type="submit" className="btn btnYellow">Sign Up</button>
          </form>
          {LINKS.whatsapp && <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btnOutline">Follow on WhatsApp</a>}
        </div>
      </div>
    </section>
  )
}
