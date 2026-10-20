import Header from '@/components/Header'
import Hero from '@/components/Hero'
import PackageCards from '@/components/PackageCards'
import Yes from '@/components/Yes'
import VideoSample from '@/components/VideoSample'
import {SAMPLES} from '@/lib/samples'
import Footer from '@/components/Footer'
import CompareModal from '@/components/CompareModal'
import HowItWorks from '@/components/HowItWorks'
import DisclaimerModal from '@/components/DisclaimerModal'
import FormatsModal from '@/components/FormatsModal'
import DialogController from '@/components/DialogController'
import Icon from '@/components/Icon'

const formats = [
  {ratio: '9:16', label: 'Vertical'},
  {ratio: '1:1', label: 'Square'},
  {ratio: '16:9', label: 'Horizontal'},
]

const benefits = [
  {icon: 'sparkles', title: 'Pro creativity', text: 'Mint Media team. AI-powered.'},
  {icon: 'bolt', title: 'Fast turnaround', text: 'Days, not weeks.'},
  {icon: 'route', title: 'Simple process', text: 'One form. We take it from there.'},
]

const uses = [
  {icon: 'rocket', label: 'Launches'},
  {icon: 'calendar', label: 'Events'},
  {icon: 'megaphone', label: 'Campaigns'},
  {icon: 'heart', label: 'Fundraisers'},
  {icon: 'clock', label: 'Tight deadlines'},
]

const included = [
  'Concept and script',
  'Script approval',
  'AI visuals, voice and music',
  'Pro edit and finish',
  'Your logo and brand',
  'One revision round',
]

const notIncluded = [
  'Filming or photo shoots',
  'Strategy meetings',
  'Multiple concepts (we focus on one)',
  'Characters built to your specs',
  'Look-alikes of real people',
  'Celebrities or copyrighted characters',
]

const faqs = [
  {q: 'Do I need a meeting?', a: 'No. It all starts with one form.'},
  {q: 'Can I share my ideas?', a: 'Yes. Add ideas and links in the form. We make the final creative call.'},
  {q: 'How fast is it?', a: 'First cut in 3 business days, counted from when your order enters production. Plan on about 6 business days to have your final video in hand, including one revision round. Weekends and holidays aren’t counted, and start dates depend on our queue.'},
  {q: 'What if something’s wrong?', a: 'Our mistake? Fixed free. That covers any fact you gave us, like a price, link or phone number. Creative changes use your revision round.'},
  {q: 'Can you create a custom character or make someone look like a real person?', a: 'No. We don’t build characters to your specifications, we don’t match anyone’s likeness, and we never use celebrities or copyrighted characters. Reference photos guide the general style only.'},
  {q: 'Will my product look exactly right?', a: 'AI gets close, not exact. If your product needs to look exact, upload real photos or video of it and we’ll build around those.'},
  {q: 'Will the AI get every detail perfect?', a: 'Not always. AI is guided by prompts, not frame-by-frame control, so small imperfections can happen. Some requests aren’t possible, and once characters or scenes are set, some changes can’t be made. Revisions are limited to what your package includes. See our AI Production Disclaimer.', dialog: 'disclaimer-dialog'},
  {q: 'Can I cancel or get a refund?', a: 'Cancel free anytime before we start your project. Nothing is charged until then. Once we start, your card is charged in full, and because Mint 35 is a fixed-scope service, all sales are final. Need full customization and control? That’s a Mint Media production.', href: 'https://mintmediallc.com'},
  {q: 'Who owns the video? Can I run it as a paid ad?', a: 'Yes. Once your order is paid, you can use your videos to market your business, product or campaign, including paid ads on social media and YouTube.', terms: true},
  {q: 'Can I add extras?', a: 'Yes. When you order, you can add extra formats, subtitles, a 15-second cutdown, an extra revision round or rush delivery. You can also add them later from your project page.'},
  {q: 'Is it fully automated?', a: 'No. AI does the heavy lifting. Real Mint Media creatives write, build and finish every video.'},
  {q: 'Why the name Mint 35?', a: 'Many of our videos land around 35 seconds, a sweet spot for social. Every package runs 30 to 60 seconds, and we fit the length to your message.'},
]

const No = ({items}) => <ul className="no">{items.map(i => <li key={i}>{i}</li>)}</ul>

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        <section id="work" className="section">
          <div className="container">
            <p className="eyebrow">Work</p>
            <h2>See what&rsquo;s possible.</h2>
            <div className={`work-grid${SAMPLES.length > 2 ? ' work-grid-3' : ''}`}>
              {SAMPLES.map(v => <VideoSample key={v.id} {...v} />)}
            </div>
          </div>
        </section>

        <section id="why" className="section section-alt">
          <div className="container">
            <p className="eyebrow">Why Mint 35</p>
            <h2>Everything you need. Nothing you don&rsquo;t.</h2>
            <div className="benefits">
              {benefits.map(b => (
                <div key={b.title} className="benefit">
                  <Icon name={b.icon} />
                  <div><h3>{b.title}</h3><p>{b.text}</p></div>
                </div>
              ))}
            </div>
            <div className="uses">
              <span className="uses-label">Perfect for</span>
              <ul>{uses.map(u => <li key={u.label}><Icon name={u.icon} />{u.label}</li>)}</ul>
            </div>
          </div>
        </section>

        <section id="mint-media" className="section">
          <div className="container mm-band">
            <a href="https://mintmediallc.com" className="mm-powered" target="_blank" rel="noopener noreferrer" aria-label="Powered by Mint Media (opens mintmediallc.com)">
              <span>Powered by</span>
              <img src="/brand/mint-media-logo.png" alt="Mint Media" width="1201" height="190" />
            </a>
            <h2>The creative team you trust. <span className="accent">A new way to work.</span></h2>
            <p className="mm-note">Not a DIY generator. Every video is written and finished by the Mint Media team.</p>
          </div>
        </section>

        <section id="how" className="section section-alt">
          <div className="container">
            <p className="eyebrow">How it works</p>
            <h2>Your idea in. Video out.</h2>
            <HowItWorks />
            <p className="compare-hint">Want strategy meetings or a film shoot? <button type="button" className="link-btn" data-open="compare-dialog">Compare Mint 35 and Mint Media →</button></p>
          </div>
        </section>

        <section id="included" className="section">
          <div className="container">
            <p className="eyebrow">What&rsquo;s included</p>
            <h2>Fixed scope. Focused results.</h2>
            <div className="yesno">
              <div className="card card-yes"><h3>Included</h3><Yes items={included} /></div>
              <div className="card card-no"><h3>Not included</h3><No items={notIncluded} /></div>
            </div>
            <CompareModal />
          </div>
        </section>

        <section id="packages" className="section section-alt">
          <div className="container">
            <p className="eyebrow">Packages</p>
            <h2>Simple pricing. No surprises.</h2>
            <p className="intro-pricing"><span aria-hidden="true">🔥</span> <span><b>Introductory pricing.</b> Grab it while it lasts.</span></p>
            <PackageCards />
            <p className="packages-note">First cut in 3 business days once your project enters production.</p>
            <div className="formats-band">
              <div>
                <h3>Your video. Your format.</h3>
                <p className="muted">One format included with every package.</p>
              </div>
              <div className="format-list">
                {formats.map(f => (
                  <div key={f.ratio} className="format">
                    <span className={`format-frame r${f.ratio.replace(':', '-')}`} aria-hidden="true" />
                    <span><strong>{f.ratio}</strong> {f.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="compare-hint">Need something fully custom? <button type="button" className="link-btn" data-open="compare-dialog">Compare Mint 35 and Mint Media →</button></p>
          </div>
        </section>

        <section id="faq" className="section">
          <div className="container narrow">
            <p className="eyebrow">FAQ</p>
            <h2>Questions. Answered.</h2>
            <div className="faqs">
              {faqs.map(f => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p className="faq-a">{f.a}{f.dialog && <> <button type="button" className="link-btn faq-link" data-open={f.dialog}>Read it →</button></>}{f.href && <> <a className="faq-link" href={f.href} target="_blank" rel="noopener noreferrer">Visit Mint Media →</a></>}{f.terms && <> <a className="faq-link" href="/terms">See our Terms →</a></>}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="start" className="section start">
          <div className="container start-band">
            <p className="eyebrow">Ready?</p>
            <h2>Powerful video.<br /><span className="accent">Simplified.</span></h2>
            <a href="/start" className="btn btn-primary">Start My Mint 35 <span className="arrow">→</span></a>
          </div>
        </section>
      </main>
      <Footer />
      <FormatsModal />
      <DisclaimerModal />
      <DialogController />
    </>
  )
}
