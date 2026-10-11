import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ProjectForm from '@/components/ProjectForm'
import Footer from '@/components/Footer'

const formats = [
  {ratio: '9:16', label: 'Reels · TikTok · Shorts · WhatsApp Status'},
  {ratio: '1:1', label: 'Social'},
  {ratio: '16:9', label: 'YouTube · Web · Digital'},
]

const steps = [
  {title: 'Fill out the questionnaire', text: 'What you’re promoting, who it’s for, what they should do. Upload your logo and images.'},
  {title: 'Approve the script', text: 'We write it. You review it once and approve.'},
  {title: 'We produce it', text: 'AI production plus Mint Media editing. First cut in 3 business days.'},
  {title: 'One revision, then delivery', text: 'Send one round of notes. We finish it, ready to post.'},
]

const included = [
  'Concept and script by our team',
  'One script approval',
  'AI visuals, voice and music',
  'Mint Media edit and finishing',
  'Your logo and brand assets',
  'One round of revisions',
]

const notIncluded = [
  'Meetings or strategy calls',
  'Multiple concepts to choose from',
  'Filming or live production',
  'Extra revision rounds',
  'Ongoing back-and-forth',
]

const compare = [
  ['How we start', 'Online questionnaire', 'Strategy meetings'],
  ['Who decides the creative', 'Our team', 'Together with you'],
  ['Filming', 'No', 'Yes'],
  ['Script approvals', 'One', 'Collaborative'],
  ['Revision rounds', 'One', 'Multiple'],
  ['Price', 'Fixed package', 'Custom quote'],
  ['Best for', 'Short, focused commercials', 'Custom films and campaigns'],
]

const uses = ['Product launches', 'Events', 'Sales & offers', 'Announcements', 'Services', 'Social content', 'Testing new ideas']

const packages = [
  {name: 'Single 35', blurb: 'One commercial, one message.', items: ['1 commercial, 30–60 sec', '1 platform export', '1 revision round'], cta: 'Start My Commercial'},
  {name: 'Campaign 3', featured: true, blurb: 'Three spots around one campaign.', items: ['3 commercials', 'Shared look, different hooks', '1 revision round each'], cta: 'Build My Campaign'},
  {name: 'Always On', blurb: 'Fresh spots every month.', items: ['Set number of spots per month', 'Priority production queue', 'Your brand assets on file'], cta: 'Go Always On'},
]

const faqs = [
  {q: 'Do I need a meeting?', a: 'No. Everything starts with the online questionnaire.'},
  {q: 'Can I share my ideas?', a: 'Yes. The questionnaire has space for ideas and reference links. Our team makes the final creative calls.'},
  {q: 'How fast is it?', a: 'Your first cut arrives within 3 business days after you approve the script and production begins. Start dates depend on our queue.'},
  {q: 'What if something is wrong?', a: 'If we get a fact wrong that you supplied correctly, like a price, URL or phone number, we fix it free. Creative changes go into your one revision round.'},
  {q: 'Is it fully automated?', a: 'No. AI does the production work. Real Mint Media creatives write, assemble and finish every spot.'},
]

const Yes = ({items}) => <ul className="yes">{items.map(i => <li key={i}>{i}</li>)}</ul>
const No = ({items}) => <ul className="no">{items.map(i => <li key={i}>{i}</li>)}</ul>

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        <section className="formats" aria-label="Formats">
          <div className="container formats-row">
            <span className="formats-title">Ready wherever you run it</span>
            {formats.map(f => (
              <div key={f.ratio} className="format">
                <span className={`format-frame r${f.ratio.replace(':', '-')}`} aria-hidden="true" />
                <span><strong>{f.ratio}</strong> {f.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="marquee" aria-label="Perfect for">
          <span className="marquee-label">Perfect for</span>
          <div className="marquee-track">
            {[0, 1].map(k => (
              <div key={k} className="marquee-group" aria-hidden={k === 1 ? 'true' : undefined}>
                {uses.map(u => <span key={u}>{u}</span>)}
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="section">
          <div className="container">
            <p className="eyebrow">How it works</p>
            <h2>Your information in. Commercial out.</h2>
            <ol className="timeline">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <span className="dot">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="included" className="section section-alt">
          <div className="container">
            <p className="eyebrow">What&rsquo;s included</p>
            <h2>Fixed scope. That&rsquo;s why it costs less.</h2>
            <div className="yesno">
              <div className="card card-yes"><h3>Included</h3><Yes items={included} /></div>
              <div className="card card-no"><h3>Not included</h3><No items={notIncluded} /></div>
            </div>
          </div>
        </section>

        <section id="compare" className="section">
          <div className="container narrow">
            <p className="eyebrow">Mint 35 or Mint Media?</p>
            <h2>Need more control? That&rsquo;s a Mint Media project.</h2>
            <div className="table-wrap">
              <table className="compare-table">
                <thead><tr><th /><th className="hl">Mint 35</th><th>Mint Media</th></tr></thead>
                <tbody>
                  {compare.map(([k, a, b]) => (
                    <tr key={k}><th scope="row">{k}</th><td className="hl">{a}</td><td>{b}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="compare-cta">Need full-service production? <a href="https://mintmediallc.com" target="_blank" rel="noopener noreferrer">Talk to Mint Media →</a></p>
          </div>
        </section>

        <section id="packages" className="section section-alt">
          <div className="container">
            <p className="eyebrow">Packages</p>
            <h2>Simple packages. Clear scope.</h2>
            <div className="packages">
              {packages.map(p => (
                <div key={p.name} className={`package${p.featured ? ' featured' : ''}`}>
                  {p.featured && <span className="badge">Most popular</span>}
                  <h3>{p.name}</h3>
                  <p className="package-blurb">{p.blurb}</p>
                  <Yes items={p.items} />
                  <a href="#start" className={`btn ${p.featured ? 'btn-primary' : 'btn-outline'}`}>{p.cta} <span className="arrow">→</span></a>
                </div>
              ))}
            </div>
            <p className="package-note">Every package includes script approval and one revision round per commercial.</p>
          </div>
        </section>

        <section id="work" className="section">
          <div className="container">
            <p className="eyebrow">Work</p>
            <h2>See what your idea can become.</h2>
            <div className="samples">
              {['01', '02', '03', '04'].map((n, i) => (
                <div key={n} className={`sample s${i + 1}`}>
                  <span className="play" aria-hidden="true" />
                  <span className="sample-label">Commercial {n}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="section section-alt">
          <div className="container narrow">
            <p className="eyebrow">FAQ</p>
            <h2>Quick answers</h2>
            <div className="faqs">
              {faqs.map(f => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p className="faq-a">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="start" className="section start">
          <div className="container start-grid">
            <div className="start-copy">
              <p className="eyebrow">Ready?</p>
              <h2>Tell us your idea.<br /><span className="accent">We&rsquo;ll make the spot.</span></h2>
              <ul className="nots">
                <li>No meeting</li>
                <li>No script to write</li>
                <li>No AI to learn</li>
              </ul>
              <a href="#project-form" className="btn btn-primary">Start My Mint 35 <span className="arrow">→</span></a>
            </div>
            <ProjectForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
