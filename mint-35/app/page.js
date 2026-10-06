import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ContactForm from '@/components/ContactForm'
import Footer from '@/components/Footer'

const formats = [
  {ratio: '9:16', label: 'Reels · TikTok · Shorts'},
  {ratio: '1:1', label: 'Social feeds'},
  {ratio: '16:9', label: 'YouTube · CTV · Web'},
]

const steps = [
  {n: '01', title: 'Brief', text: 'Tell us what you are selling, who it is for and where it will run. A short call or form is all it takes.'},
  {n: '02', title: 'Script & storyboard', text: 'Our writers shape a 30–60 second story with a clear hook, message and call to action. You approve before we produce.'},
  {n: '03', title: 'AI production', text: 'We generate visuals, motion, voice and music with the latest AI tools, directed shot by shot by our producers.'},
  {n: '04', title: 'Polish & delivery', text: 'Human editors finish the cut, add your branding and export every format you need, ready to post.'},
]

const reasons = [
  {title: 'Fast turnaround', text: 'No location scouting, crews or reshoots. Concepts move from idea to finished spot in days, not weeks.'},
  {title: 'Budget friendly', text: 'AI production removes the biggest costs of a traditional shoot, so you can run more spots and test more ideas.'},
  {title: 'Directed by people', text: 'Every commercial is written, directed and edited by the Mint Media team, with more than a decade of video storytelling behind it.'},
  {title: 'Built for the feed', text: 'Short, hook-first edits designed to stop the scroll, with captions and cutdowns for every platform.'},
]

const packages = [
  {name: 'Single Spot', blurb: 'One commercial to launch a product, promote an event or test an idea.', items: ['One 30–60 second commercial', 'Script & storyboard', 'AI voiceover & music', 'Vertical, square & wide exports', 'Two rounds of revisions']},
  {name: 'Campaign Pack', blurb: 'A set of spots that tell one story across every channel.', items: ['Three commercials', 'Shared visual identity', '15-second cutdowns', 'Captioned versions', 'Priority turnaround'], featured: true},
  {name: 'Always On', blurb: 'A steady stream of fresh commercials, every month.', items: ['Monthly commercial allotment', 'Dedicated producer', 'Seasonal & promo spots', 'Performance-driven iterations', 'Flexible scheduling']},
]

const faqs = [
  {q: 'How long are the commercials?', a: 'Most Mint 35 spots run between 30 and 60 seconds. We can also deliver shorter 6–15 second cutdowns for ads and stories.'},
  {q: 'Can you use our logo, product and brand colors?', a: 'Yes. Send us your logo, product photos and brand guidelines and we build them into every frame.'},
  {q: 'Do real people work on these?', a: 'Absolutely. AI handles the heavy lifting in production, but our writers, producers and editors guide every step and finish every cut.'},
  {q: 'Where can I use the videos?', a: 'Anywhere you advertise: social media, YouTube, your website, email, digital signage and streaming TV. We export the formats each platform needs.'},
  {q: 'What do you need from me to get started?', a: 'A short brief: what you are promoting, who it is for, and any must-have messages or offers. We take it from there.'},
]

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        <section className="formats" aria-label="Formats">
          <div className="container formats-row">
            <span className="formats-title">Delivered in every format</span>
            {formats.map(f => (
              <div key={f.ratio} className="format">
                <span className={`format-frame r${f.ratio.replace(':', '-')}`} aria-hidden="true" />
                <span><strong>{f.ratio}</strong> {f.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="section">
          <div className="container">
            <p className="eyebrow">How it works</p>
            <h2>From brief to finished commercial in four steps</h2>
            <div className="steps">
              {steps.map(s => (
                <div key={s.n} className="step">
                  <span className="step-n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="why" className="section section-alt">
          <div className="container split">
            <div>
              <p className="eyebrow">Why Mint 35</p>
              <h2>Big-brand commercials without the big-brand shoot</h2>
              <p className="lead">Mint 35 combines AI production with the storytelling of the Mint Media team, so every spot looks premium and says exactly what it needs to, in under a minute.</p>
            </div>
            <div className="reasons">
              {reasons.map(r => (
                <div key={r.title} className="reason">
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="work" className="section">
          <div className="container">
            <p className="eyebrow">Our work</p>
            <h2>Sample commercials</h2>
            <div className="samples">
              {['Product launch', 'Restaurant promo', 'Event announcement'].map((t, i) => (
                <div key={t} className={`sample s${i + 1}`}>
                  <div className="sample-frame">
                    <span className="play" aria-hidden="true" />
                    <span className="sample-time">0:{[30, 45, 35][i]}</span>
                  </div>
                  <h3>{t}</h3>
                  <p>Sample coming soon</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="packages" className="section section-alt">
          <div className="container">
            <p className="eyebrow">Packages</p>
            <h2>Pick the plan that fits your campaign</h2>
            <div className="packages">
              {packages.map(p => (
                <div key={p.name} className={`package${p.featured ? ' featured' : ''}`}>
                  {p.featured && <span className="badge">Most popular</span>}
                  <h3>{p.name}</h3>
                  <p className="package-blurb">{p.blurb}</p>
                  <ul>{p.items.map(i => <li key={i}>{i}</li>)}</ul>
                  <a href="#contact" className={`btn ${p.featured ? 'btn-primary' : 'btn-outline'}`}>Request a quote</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="section">
          <div className="container narrow">
            <p className="eyebrow">FAQ</p>
            <h2>Questions, answered</h2>
            <div className="faqs">
              {faqs.map(f => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section section-alt">
          <div className="container split">
            <div>
              <p className="eyebrow">Start a project</p>
              <h2>Let&rsquo;s make your next commercial</h2>
              <p className="lead">Tell us a little about what you are promoting and we will get back to you with ideas and a quote.</p>
              <ul className="contact-info">
                <li><span>Email</span><a href="mailto:info@mintmediallc.com">info@mintmediallc.com</a></li>
                <li><span>Call</span><a href="tel:+17328134222">(732) 813-4222</a></li>
              </ul>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
