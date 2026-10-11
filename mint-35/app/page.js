import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ProjectForm from '@/components/ProjectForm'
import Footer from '@/components/Footer'

const formats = [
  {ratio: '9:16', label: 'Reels · TikTok · Shorts · WhatsApp Status'},
  {ratio: '1:1', label: 'Social'},
  {ratio: '16:9', label: 'YouTube · Web · Digital'},
]

const builtFor = [
  'Launch a product', 'Promote an event', 'Advertise an offer', 'Announce something new', 'Explain a service',
  'Create fresh social content', 'Promote a campaign', 'Test a new marketing idea', 'Keep your brand active between larger productions',
]

const notIncluded = [
  'Creative discovery meetings', 'Lengthy strategy calls', 'Multiple creative concepts', 'Client-directed storyboarding',
  'Live production or filming', 'Ongoing creative collaboration', 'Multiple rounds of creative revisions',
  'Frame-by-frame client direction', 'Unlimited email or phone back-and-forth',
]

const process = [
  'You tell us about your project.', 'We develop the concept and script.', 'You approve the script.',
  'We create the commercial.', 'You receive one round of creative revisions.', 'We deliver it.',
]

const revisionExamples = [
  'I’d rather use a different scene.', 'Can we adjust the pacing?', 'Let’s try another voice.',
  'Can we change the opening?', 'Can we adjust the music?',
]

const compare = {
  mint35: ['Fixed scope', 'Online project questionnaire', 'AI-led production', 'Minimal back-and-forth', 'One script approval', 'One creative revision round', 'Built for short commercial content'],
  mintMedia: ['Fully custom', 'Collaborative creative process', 'Strategy & planning', 'Live production available', 'Custom direction', 'Collaborative revision process', 'Built for higher-touch productions and campaigns'],
}

const reasons = [
  {title: 'Simple by design', body: ['Mint 35 streamlines the meetings, scheduling and logistics involved in producing commercial content through a more focused process.']},
  {title: 'A defined price', body: ['You know what you’re buying before the project begins.', 'No sprawling production scope.', 'No accumulating production days.']},
  {title: 'More creative, more often', body: ['Because each commercial requires less production overhead, businesses can create content around more launches, offers and moments throughout the year.']},
  {title: 'Built by Mint', body: ['Mint 35 isn’t a self-service AI generator.', 'Your project still goes through Mint Media’s creative and production team.', 'We’ve simply built a much leaner way for you to work with us.']},
  {title: 'You don’t have to manage it', body: ['You shouldn’t need to learn prompting, AI video tools, editing platforms or voice software.', 'Fill out the project questionnaire.', 'We’ll handle the rest.']},
]

const packages = [
  {
    name: 'Single 35',
    blurb: ['One focused commercial for one message, offer or campaign.'],
    items: ['One 30–60 second Mint 35 commercial', 'Creative concept selected by Mint 35', 'Script', 'One script review and approval', 'AI production', 'Voice and music as needed', 'Mint Media edit and finishing', 'Your logo and supplied brand assets', 'One platform export of your choice', 'One creative revision round'],
    cta: 'Start My Commercial',
  },
  {
    name: 'Campaign 3',
    featured: true,
    blurb: ['Three commercials built around one campaign, product or brand.', 'A smarter option when you want more creative to run, test and rotate.'],
    items: ['Three Mint 35 commercials', 'Shared campaign direction', 'Slightly different hooks or messages', 'Consistent visual language', 'Script review and approval for each commercial', 'One standard platform export', 'One creative revision round per commercial'],
    cta: 'Build My Campaign',
  },
  {
    name: 'Mint 35 Always On',
    blurb: ['Fresh commercial creative delivered throughout the year.', 'For brands that constantly have products, promotions, events, offers or announcements to market.'],
    items: ['A set number of Mint 35 spots each month', 'Priority production queue', 'Ongoing use of your saved brand assets', 'Seasonal and promotional creative', 'Campaign variations', 'Predictable monthly cost', 'Same streamlined Mint 35 workflow', 'Script approval and one creative revision round per commercial'],
    outro: ['Submit your project details.', 'We make the spot.', 'You keep marketing.'],
    cta: 'Go Always On',
  },
]

const faqs = [
  {q: 'Do I have to have a meeting?', a: <>
    <p><strong>Usually, no.</strong></p>
    <p>Mint 35 is intentionally built around an online project questionnaire. You’ll complete our questionnaire, upload your assets and give us the information we need to create your commercial.</p>
    <p>If your project requires significant discussion before we can understand it, it may be better suited for a traditional Mint Media engagement.</p>
  </>},
  {q: 'Can I give you ideas?', a: <>
    <p><strong>Absolutely.</strong></p>
    <p>There’s a place in the project questionnaire to share references, ideas and anything you want us to know.</p>
    <p>We’ll take those into account when developing the commercial.</p>
    <p>However, Mint 35 is not a collaborative creative-development process.</p>
  </>},
  {q: 'Will I approve the script or storyboard first?', a: <>
    <p>You will have one opportunity to review and approve the script before we proceed.</p>
    <p>Once you receive the script, you can send any feedback or requested corrections by voice note, email or message. Once we receive your approval, your project will move into production according to our current production schedule.</p>
    <p>One of the ways we keep Mint 35 simple and affordable is by eliminating multiple approval stages. Our team uses the information supplied in your project questionnaire to make the creative decisions and build the spot.</p>
  </>},
  {q: 'How long does it take to receive my commercial?', a: <>
    <p>Once your project enters production, your first completed commercial will be delivered within three business days.</p>
    <p>Here’s how it works:</p>
    <ol>
      <li>After submitting your project details and brand assets, your project is placed into our production queue.</li>
      <li>Our team will develop your script and send it to you for approval.</li>
      <li>Once your script is approved and your project officially begins production, the three-business-day turnaround begins.</li>
    </ol>
    <p>Production start dates depend on our current schedule and workload.</p>
    <p>The three-business-day turnaround applies to your first completed version. Final delivery follows your included revision round, if revisions are requested.</p>
  </>},
  {q: 'Can I request changes?', a: <>
    <p>Yes. Mint 35 includes one round of creative revisions.</p>
    <p>After you receive the first draft, you can provide one consolidated round of feedback. This is your opportunity to request changes to the creative direction, scenes, pacing, voices, script, music or stylistic choices, provided the changes remain within the original project scope.</p>
    <p>If we’ve made a factual mistake based on the information you correctly supplied — such as using an incorrect price, URL or phone number — we’ll correct it separately.</p>
    <p>Additional rounds of revisions, significant changes to the original concept or changes requested after the included revision round are not included.</p>
    <p>When possible, additional changes can be quoted separately.</p>
  </>},
  {q: 'Why is there only one revision round?', a: <>
    <p>Because Mint 35 is designed to simplify the traditional production process.</p>
    <p>Meetings, alternate concepts, multiple approvals, revision rounds and ongoing client direction all require additional production time.</p>
    <p>By keeping the process streamlined — with one script approval and one consolidated revision round — we’re able to offer a much leaner product while still giving you an opportunity to fine-tune the final spot.</p>
    <p>If you need a more collaborative process with multiple rounds of feedback and creative development, we’d be happy to build your project through Mint Media instead.</p>
  </>},
  {q: 'Is Mint 35 completely automated?', a: <>
    <p><strong>No.</strong></p>
    <p>Mint 35 uses AI heavily in the production process, but real creatives are still making decisions, assembling the spot and finishing the final piece.</p>
    <p>What we’ve automated and streamlined is much of the client process around the production.</p>
  </>},
  {q: 'What should I send you?', a: <>
    <p>The more accurate information we receive at the start, the better.</p>
    <p>Your project questionnaire may ask for:</p>
    <ul className="cols">
      {['Logo files', 'Website', 'Brand colors', 'Photos', 'Product images', 'Offer details', 'Exact wording', 'Contact information', 'Required disclaimers', 'Examples you like'].map(i => <li key={i}>{i}</li>)}
    </ul>
    <p>The key is to give us everything before production begins.</p>
  </>},
  {q: 'What happens if I forget something?', a: <>
    <p>Because Mint 35 follows a streamlined revision process, please review your submitted information carefully before approving your script.</p>
    <p>Information added after production has begun may be accommodated within your included revision round, depending on the scope of the change.</p>
    <p>Significant additions or changes may require an additional charge or a new project.</p>
  </>},
  {q: 'Is Mint 35 right for every project?', a: <>
    <p><strong>No.</strong></p>
    <p>And that’s intentional.</p>
    <p>Mint 35 is built for clear, focused short-form commercial projects.</p>
    <p>If your project requires interviews, filming, a complicated story, multiple decision-makers, extensive strategic development or a highly collaborative process, we’ll recommend traditional Mint Media production instead.</p>
  </>},
]

function Ticks({items, className = ''}) {
  return <ul className={`ticks ${className}`}>{items.map(i => <li key={i}>{i}</li>)}</ul>
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        <section className="formats" aria-label="Formats">
          <div className="container formats-row">
            <span className="formats-title">Ready wherever you want to run it.</span>
            {formats.map(f => (
              <div key={f.ratio} className="format">
                <span className={`format-frame r${f.ratio.replace(':', '-')}`} aria-hidden="true" />
                <span><strong>{f.ratio}</strong> {f.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* What is Mint 35 */}
        <section id="about" className="section">
          <div className="container split">
            <div>
              <p className="eyebrow">A different kind of Mint Media product</p>
              <h2>Great creative. Smaller process.</h2>
            </div>
            <div className="prose">
              <p>For more than a decade, Mint Media has produced fully customized films and commercials built around strategy sessions, creative development, production crews, interviews, shoots, edits and client collaboration.</p>
              <p className="big">Mint 35 is intentionally different.</p>
              <p>It’s designed for projects that don’t need all of that.</p>
              <p>Instead of hiring Mint Media for a full production, you give us what we need through a structured online questionnaire.</p>
              <p>We take your information, your brand and your goal and turn it into a short commercial using a simplified creative and AI production workflow.</p>
              <p>That means:</p>
              <Ticks items={['Less coordination.', 'Less back-and-forth.', 'Less production overhead.', 'A lower price.']} />
              <p>And a very different process from a traditional Mint Media project.</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="section section-alt">
          <div className="container">
            <p className="eyebrow">How Mint 35 works</p>
            <h2>Your information in. Commercial out.</h2>
            <p className="lead">Mint 35 is designed to be simple.</p>
            <div className="steps">
              <div className="step">
                <span className="step-n">01</span>
                <h3>Tell us about your project</h3>
                <p>You’ll fill out our guided project questionnaire.</p>
                <p>Tell us:</p>
                <Ticks items={['What you’re promoting', 'Who you’re trying to reach', 'What you want them to know', 'What you want them to do', 'Where the commercial will run']} />
                <p className="note">No discovery meeting required.</p>
              </div>
              <div className="step">
                <span className="step-n">02</span>
                <h3>Upload your assets</h3>
                <p>Send us whatever applies:</p>
                <Ticks items={['Logo', 'Brand colors', 'Product photos', 'Website', 'Offer details', 'Existing photography', 'Brand guidelines', 'Required copy or disclaimers']} />
                <p className="note">The better the information you give us, the better we can build the spot.</p>
              </div>
              <div className="step">
                <span className="step-n">03</span>
                <h3>Mint 35 builds the commercial</h3>
                <p>Our team uses your project information to determine the concept, script and visual direction.</p>
                <p>You’ll have one opportunity to review and approve the script before production begins.</p>
                <p>Once approved, your project will move into production according to our current production queue.</p>
                <p>Then we use AI production tools, editing, sound, graphics and your brand assets to create the finished spot.</p>
                <p><strong>Once production begins, your first completed commercial will be delivered within three business days.</strong></p>
                <p>There are no creative presentations, storyboard meetings or multiple concepts to choose from.</p>
                <p className="note">You give us the information.<br />We make the creative decisions.</p>
              </div>
              <div className="step">
                <span className="step-n">04</span>
                <h3>You get your commercial</h3>
                <p>We deliver your first completed Mint 35 spot for review.</p>
                <p>You’ll have one included round of creative revisions to request adjustments.</p>
                <p>Once the revisions are completed, we deliver your finished commercial in the formats included with your package.</p>
                <p className="note">Ready to post.<br />Ready to advertise.<br />Ready to use.<br /><span className="accent">That’s the point.</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* Built for */}
        <section className="section">
          <div className="container split">
            <div>
              <p className="eyebrow">Simple. Professional. Focused.</p>
              <h2>Not every commercial needs a full production.</h2>
              <p className="lead">Not every message requires a full-scale production.</p>
              <p className="lead accent strong">Sometimes you just need a commercial.</p>
            </div>
            <div>
              <p className="label">Mint 35 is ideal when you need to:</p>
              <div className="chips">{builtFor.map(b => <span key={b} className="chip">{b}</span>)}</div>
            </div>
          </div>
        </section>

        {/* Fixed scope */}
        <section id="included" className="section section-alt">
          <div className="container">
            <p className="eyebrow">Fixed-scope production</p>
            <h2>The simplicity is part of the product.</h2>
            <p className="lead">Mint 35 costs less because we’ve streamlined much of the traditional production process.</p>
            <div className="scope-grid">
              <div className="card">
                <h3>A Mint 35 project does not include:</h3>
                <ul className="crosses">{notIncluded.map(i => <li key={i}>{i}</li>)}</ul>
              </div>
              <div className="card">
                <h3>Instead, Mint 35 follows a structured process:</h3>
                <ol className="numbered">{process.map(i => <li key={i}>{i}</li>)}</ol>
              </div>
            </div>
            <p className="lead center">That’s what allows us to make high-quality short-form creative without the time and cost of a traditional production.</p>

            <div className="card wrong">
              <h3>What if something is wrong?</h3>
              <div className="wrong-grid">
                <div className="prose">
                  <p>If we make an objective mistake — for example, an incorrect phone number, URL, price, spelling or logo based on information you correctly supplied — we’ll fix it.</p>
                  <p>Mint 35 also includes one round of creative revisions after you receive your first completed commercial.</p>
                  <p>This is your opportunity to provide one consolidated round of feedback.</p>
                  <p>These types of changes can be requested as part of your included revision round, provided they remain within the original project scope.</p>
                  <p>Requests for entirely new concepts, significant changes in direction, or additional revision rounds are not included.</p>
                  <p>Additional creative changes can be quoted separately when possible.</p>
                </div>
                <div>
                  <p className="label">Examples include:</p>
                  <ul className="quotes">{revisionExamples.map(q => <li key={q}>“{q}”</li>)}</ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Want more control */}
        <section className="section">
          <div className="container">
            <p className="eyebrow">Full-service production</p>
            <h2>Need collaboration instead?</h2>
            <div className="prose wide-prose">
              <p>Mint 35 isn’t meant to replace Mint Media.<br />It’s another way to work with us.</p>
              <p>If your project needs strategy meetings, script collaboration, interviews, filming, casting, custom production, multiple stakeholders or multiple rounds of creative revisions, that’s a Mint Media project.</p>
              <p>With Mint Media, our team works closely with you from concept through final delivery to create a completely customized production.</p>
            </div>
            <div className="compare">
              <div className="card compare-35">
                <h3>Mint 35</h3>
                <Ticks items={compare.mint35} />
              </div>
              <div className="card">
                <h3>Mint Media</h3>
                <Ticks items={compare.mintMedia} />
              </div>
            </div>
            <div className="full-service">
              <span>Need full-service production?</span>
              <a className="btn btn-outline" href="https://mintmediallc.com" target="_blank" rel="noopener noreferrer">Talk to Mint Media →</a>
            </div>
          </div>
        </section>

        {/* Why */}
        <section id="why" className="section section-alt">
          <div className="container">
            <p className="eyebrow">Why it works</p>
            <h2>Less production doesn’t have to mean boring creative.</h2>
            <div className="reasons">
              {reasons.map(r => (
                <div key={r.title} className="reason">
                  <h3>{r.title}</h3>
                  {r.body.map(p => <p key={p}>{p}</p>)}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section id="packages" className="section">
          <div className="container">
            <p className="eyebrow">Choose your Mint 35</p>
            <h2>Simple packages. Clear scope.</h2>
            <div className="packages">
              {packages.map(p => (
                <div key={p.name} className={`package${p.featured ? ' featured' : ''}`}>
                  {p.featured && <span className="badge">Most popular</span>}
                  <h3>{p.name}</h3>
                  {p.blurb.map(b => <p key={b} className="package-blurb">{b}</p>)}
                  <p className="label">Includes:</p>
                  <Ticks items={p.items} className="package-list" />
                  {p.outro && <p className="package-outro">{p.outro.map(o => <span key={o}>{o}</span>)}</p>}
                  <a href="#start" className={`btn ${p.featured ? 'btn-primary' : 'btn-outline'}`}>{p.cta}</a>
                </div>
              ))}
            </div>

            <div className="card always-on">
              <div>
                <p className="eyebrow">Why Always On?</p>
                <h3>Stop starting from zero every month.</h3>
                <p>Once you’re set up with Mint 35, we already have your logos, colors, brand information and basic creative requirements.</p>
                <p>Instead of starting a traditional production every time your marketing calendar changes, Mint 35 becomes a simple creative pipeline your team can use all year.</p>
              </div>
              <ul className="qa">
                {['Have a sale next week?', 'Launching something new?', 'Need a holiday spot?'].map(q => (
                  <li key={q}><span>{q}</span><strong>Submit your project details.</strong></li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Work */}
        <section id="work" className="section section-alt">
          <div className="container">
            <p className="eyebrow">Mint 35 work</p>
            <h2>See what your idea can become.</h2>
            <div className="samples">
              {['01', '02', '03', '04'].map((n, i) => (
                <div key={n} className={`sample s${i + 1}`}>
                  <span className="play" aria-hidden="true" />
                  <span className="sample-label">Commercial {n}</span>
                </div>
              ))}
            </div>
            <p className="lead center strong">The finished work is the pitch.</p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section">
          <div className="container narrow">
            <p className="eyebrow">Questions, answered</p>
            <h2>FAQ</h2>
            <div className="faqs">
              {faqs.map(f => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <div className="faq-a">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Start */}
        <section id="start" className="section section-alt start">
          <div className="container start-grid">
            <div className="start-copy">
              <p className="eyebrow">Ready?</p>
              <h2>Tell us your idea.<br /><span className="accent">We’ll make the spot.</span></h2>
              <ul className="nots">
                <li>No production meeting.</li>
                <li>No need to write the script.</li>
                <li>No need to learn AI.</li>
                <li>No need to manage the creative process.</li>
              </ul>
              <p className="lead">Tell us what you’re selling, give us the information we need and let Mint 35 do the rest.</p>
              <a href="#project-form" className="btn btn-primary">Start My Mint 35</a>
            </div>
            <ProjectForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
