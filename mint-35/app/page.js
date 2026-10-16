import Header from '@/components/Header'
import Hero from '@/components/Hero'
import PackageCards from '@/components/PackageCards'
import Yes from '@/components/Yes'
import VideoSample from '@/components/VideoSample'
import {SAMPLES} from '@/lib/samples'
import Footer from '@/components/Footer'
import CompareModal from '@/components/CompareModal'
import DisclaimerModal from '@/components/DisclaimerModal'
import FormatsModal from '@/components/FormatsModal'
import DialogController from '@/components/DialogController'

const formats = [
  {ratio: '9:16', label: 'Vertical'},
  {ratio: '1:1', label: 'Square'},
  {ratio: '16:9', label: 'Wide'},
]

const icon = {
  form: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M9 10h6M9 14h6M9 18h3" /></>,
  approve: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="m9 14 2 2 4-4" /></>,
  produce: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3z" /></>,
  deliver: <><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></>,
}

const steps = [
  {icon: 'form', title: 'Tell us.', text: 'One form. What it’s for, who it’s for. Add your logo and images.'},
  {icon: 'approve', title: 'Approve.', text: 'We write the script. You sign off.'},
  {icon: 'produce', title: 'We make it.', text: 'AI production. Mint Media finish. First cut in 3 business days.*'},
  {icon: 'deliver', title: 'Post it.', text: 'One round of notes. Then it’s ready to run.'},
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
  'Meetings',
  'Multiple concepts',
  'Filming',
  'Extra revisions',
  'Endless back-and-forth',
]

const faqs = [
  {q: 'Do I need a meeting?', a: 'No. It all starts with one form.'},
  {q: 'Can I share my ideas?', a: 'Yes. Add ideas and links in the form. We make the final creative call.'},
  {q: 'How fast is it?', a: 'First cut in 3 business days, once your script is approved and production starts. Start dates depend on our queue.'},
  {q: 'What if something’s wrong?', a: 'Our mistake? Fixed free. That covers any fact you gave us, like a price, link or phone number. Creative changes use your revision round.'},
  {q: 'Will the AI get every detail perfect?', a: 'Not always. AI isn’t an exact science, so small imperfections or variations can happen. See our AI Production Disclaimer.', dialog: 'disclaimer-dialog'},
  {q: 'Can I get a refund?', a: 'No. Mint 35 is a budget-friendly, fixed-scope service, so all sales are final and we don’t offer refunds. Your card is charged in full once your order moves to production. Need full customization and control? That’s a Mint Media production.', href: 'https://mintmediallc.com'},
  {q: 'Is it fully automated?', a: 'No. AI does the heavy lifting. Real Mint Media creatives write, build and finish every video.'},
]

const No = ({items}) => <ul className="no">{items.map(i => <li key={i}>{i}</li>)}</ul>

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        <section className="formats" aria-label="Formats">
          <div className="container formats-row">
            <span className="formats-title">Every screen.</span>
            <div className="format-list">
              {formats.map(f => (
                <div key={f.ratio} className="format">
                  <span className={`format-frame r${f.ratio.replace(':', '-')}`} aria-hidden="true" />
                  <span><strong>{f.ratio}</strong> {f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="section">
          <div className="container">
            <p className="eyebrow">How it works</p>
            <h2>Your idea in. Video out.</h2>
            <ol className="timeline">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <span className="step-num">0{i + 1}</span>
                  <span className="dot" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon[s.icon]}</svg>
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
            <p id="how-note" className="how-note">*First cut in 3 business days, counted from when your order enters production. Weekends and holidays are skipped.</p>
          </div>
        </section>

        <section id="included" className="section section-alt">
          <div className="container">
            <p className="eyebrow">What&rsquo;s included</p>
            <h2>Fixed scope. Smaller price.</h2>
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
          </div>
        </section>

        <section id="work" className="section">
          <div className="container">
            <p className="eyebrow">Work</p>
            <h2>Made with Mint 35.</h2>
            <div className="work-grid">
              {SAMPLES.map(v => <VideoSample key={v.id} {...v} />)}
            </div>
          </div>
        </section>

        <section id="faq" className="section section-alt">
          <div className="container narrow">
            <p className="eyebrow">FAQ</p>
            <h2>Questions. Answered.</h2>
            <div className="faqs">
              {faqs.map(f => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p className="faq-a">{f.a}{f.dialog && <> <button type="button" className="link-btn faq-link" data-open={f.dialog}>Read it →</button></>}{f.href && <> <a className="faq-link" href={f.href} target="_blank" rel="noopener noreferrer">Visit Mint Media →</a></>}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="start" className="section start">
          <div className="container start-band">
            <p className="eyebrow">Ready?</p>
            <h2>Less complexity.<br /><span className="accent">Faster results.</span></h2>
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
