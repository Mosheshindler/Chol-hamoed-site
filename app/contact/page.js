import Header from '../../components/Header'
import Footer from '../../components/Footer'
import {SITE_LINKS,SITE_URL} from '../../lib/site'

export const metadata={
  title:'Contact',
  description:'Get in touch with Mint Media — email, call, or send us a message about your next video project.',
  alternates:{canonical:`${SITE_URL}/contact`}
}

function ContactIcon({type}){
  const common={viewBox:'0 0 32 32','aria-hidden':true}
  if(type==='mail') return <svg {...common}><rect x="4.5" y="7.5" width="23" height="17" rx="2"/><path d="M6 10l10 8 10-8"/></svg>
  if(type==='phone') return <svg {...common}><path d="M10 5.5l4 5-3 3c1.8 4 4.8 7 8.8 8.8l3-3 4.7 4.2c.5.5.5 1.3.1 1.8-1.1 1.5-3 2.3-5 1.8C12.8 25.3 6.7 19.2 4.9 9.4c-.4-2 .4-3.8 1.8-4.9.7-.5 1.7-.4 2.3.2Z"/></svg>
  return <svg {...common}><circle cx="16" cy="16" r="11"/><path d="M5 16h22M16 5c3.1 3.2 4.7 6.9 4.7 11S19.1 23.8 16 27c-3.1-3.2-4.7-6.9-4.7-11S12.9 8.2 16 5Z"/></svg>
}

export default function Contact(){return <><Header/><main className="contactPage">
  <section className="contactHero"><div className="contactShell contactHeroInner"><h1>Let’s<br/>Connect</h1><i></i><p>WE’D LOVE TO HEAR FROM YOU</p></div></section>
  <section className="contactShell contactMethods"><a href={`mailto:${SITE_LINKS.email}`}><b><ContactIcon type="mail"/></b><strong>Email</strong><span>{SITE_LINKS.email}</span></a><a href={`tel:${SITE_LINKS.phone.replace(/-/g,'')}`}><b><ContactIcon type="phone"/></b><strong>Call</strong><span>(732) 813-4222</span></a><a href={SITE_LINKS.website} target="_blank" rel="noreferrer"><b><ContactIcon type="web"/></b><strong>Website</strong><span>www.mintmediallc.com</span></a></section>
  <section className="contactShell contactFormPanel"><div className="eyebrow">SEND US A MESSAGE</div><h2>We’d Love to Hear From You</h2><p>Have a project in mind, a question, or just want to say hello?<br/>Fill out the form and we’ll get back to you soon.</p><form action="https://formsubmit.co/info@mintmediallc.com" method="POST" className="contactForm"><input type="hidden" name="_subject" value="New message from Mint Media video site"/><input type="hidden" name="_captcha" value="false"/><label>Name *<input name="name" required placeholder="Your name"/></label><label>Email *<input name="email" type="email" required placeholder="Your email"/></label><label>Subject<input name="subject" placeholder="How can we help?"/></label><label>Message *<textarea name="message" required placeholder="Your message..."/></label><button className="btn primary" type="submit">Send Message&nbsp; →</button></form></section>
  <section className="contactShell contactSignups"><div className="signupCard"><div><div className="eyebrow">STAY UPDATED</div><h2>Join Our Newsletter</h2><p>Get the latest videos, stories, and updates straight to your inbox.</p></div><a className="btn primary" href={SITE_LINKS.newsletter} target="_blank" rel="noreferrer">Subscribe&nbsp; →</a></div><div className="signupCard whatsappCard"><div><div className="eyebrow">JOIN OUR COMMUNITY</div><h2>Follow Us on WhatsApp</h2><p>Be the first to see new videos, behind the scenes, and special updates.</p></div><a className="btn primary" href={SITE_LINKS.whatsapp} target="_blank" rel="noreferrer">Follow on WhatsApp&nbsp; →</a></div></section>
</main><Footer/></>}
