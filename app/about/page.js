import Header from '../../components/Header'
import Footer from '../../components/Footer'

function StatIcon({type}){
  const common={viewBox:'0 0 32 32','aria-hidden':true}
  if(type==='calendar') return <svg {...common}><rect x="6" y="8" width="20" height="18" rx="2"/><path d="M10 5v6M22 5v6M6 13h20M11 17h2M16 17h2M21 17h2M11 21h2M16 21h2M21 21h2"/></svg>
  if(type==='team') return <svg {...common}><circle cx="12" cy="11" r="4"/><circle cx="21" cy="12" r="3.5"/><path d="M4.5 26c.8-5.8 4-9 7.5-9s6.7 3.2 7.5 9M18 19c1-.8 2-1.2 3.2-1.2 3 0 5.6 2.4 6.3 6.2"/></svg>
  if(type==='event') return <svg {...common}><rect x="5" y="9" width="22" height="15" rx="2"/><path d="M10 6v6M22 6v6M5 13h22M12 18l3 2 5-5"/></svg>
  return <svg {...common}><path d="M3.5 16s4.7-7 12.5-7 12.5 7 12.5 7-4.7 7-12.5 7S3.5 16 3.5 16Z"/><circle cx="16" cy="16" r="4"/></svg>
}

export default function About(){return <><Header/><main className="aboutPage">
  <section className="aboutHero"><div className="aboutShell aboutHeroInner"><div><h1>Stories<br/>That Matter</h1><p>We believe in the power of video to inform, inspire, and create real impact.</p></div></div></section>
  <section className="aboutShell aboutStats"><div><StatIcon type="calendar"/><small>Since</small><strong>2014</strong></div><div><StatIcon type="team"/><small>A Team of</small><strong>11</strong></div><div><StatIcon type="event"/><small>Annual Events</small><strong>100K+</strong><small>Attendees</small></div><div><StatIcon type="eye"/><small>One Video</small><strong>200K+</strong><small>Views</small></div></section>
  <section className="aboutShell aboutStory"><div className="aboutStoryCopy"><div className="eyebrow">ABOUT MINT MEDIA</div><h2>A Passion for<br/>Meaningful Video</h2><p>Mint Media was founded in 2014 in Lakewood, NJ with a simple idea: use the power of video to share important stories and make a positive impact.</p><p>What started as a small, passionate team has grown into a full-service video production company, creating videos for large-scale events, organizations, businesses, and individuals.</p><p>We’re grateful for the opportunity to do what we love every day.</p></div><div className="aboutChair" aria-hidden="true"/></section>
  <section className="aboutShell aboutConnect"><div><div className="eyebrow">LET’S CONNECT</div><h2>Have a project in mind<br/>or just want to say hello?</h2></div><a href="/contact" className="btn primary">Get in Touch&nbsp; →</a></section>
</main><Footer/></>}
