import LegalPage from '@/components/LegalPage'

export const metadata = {title: 'Privacy Policy · Mint 35'}

const COLLECT = [
  ['Contact details', 'Name, title, email, cell phone, company, website', 'To run your order and reach you'],
  ['Project answers', 'What you promote, audience, messages, dates, style choices', 'To produce your video'],
  ['Files you upload', 'Logos, brand materials, photos, video, design files', 'To produce your video'],
  ['Payment details', 'Card brand and last 4 digits, charge records', 'To charge your order and add-ons'],
  ['Messages', 'Notes you send on your project page or by email', 'To answer you and track changes'],
  ['Basic site data', 'Pages visited, device and browser type, form answers and files saved in your own browser until you submit', 'To keep the site working'],
]

const PROVIDERS = [
  ['Intuit Payments Inc. (QuickBooks Payments)', 'Card processing and saved cards'],
  ['Supabase', 'Database and secure file storage'],
  ['Vercel', 'Website hosting'],
  ['Resend', 'Order emails'],
  ['YouTube', 'Plays the sample videos on our site'],
  ['Cloudflare Turnstile', 'Checks that orders come from a person, not a bot'],
]

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy">
      <p>We collect only what we need to make and deliver your videos, we never sell your information, and your card number never reaches our systems. Mint 35 is a service of Mint Media LLC.</p>

      <h2>What we collect</h2>
      <div className="legal-table-wrap">
        <table className="legal-table">
          <thead><tr><th>Information</th><th>Examples</th><th>Why</th></tr></thead>
          <tbody>{COLLECT.map(([a, b, c]) => <tr key={a}><td>{a}</td><td>{b}</td><td>{c}</td></tr>)}</tbody>
        </table>
      </div>
      <p>Your full card number is entered into a secure form from Intuit Payments Inc. (QuickBooks Payments) and goes straight to Intuit. We never see or store it.</p>

      <h2>How we use it</h2>
      <ul>
        <li>To produce, deliver and support your videos.</li>
        <li>To send emails about your order.</li>
        <li>To charge your saved card when we start your project, and for add-ons you confirm.</li>
        <li>To keep records required for accounting and legal purposes.</li>
      </ul>
      <p>We do not sell your information or use it for third-party advertising.</p>

      <h2>Who we share it with</h2>
      <p>We share information only with the service providers that run Mint 35, and only as needed for that service:</p>
      <div className="legal-table-wrap">
        <table className="legal-table">
          <thead><tr><th>Provider</th><th>What they do</th></tr></thead>
          <tbody>{PROVIDERS.map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}</tbody>
        </table>
      </div>
      <p>We may also share information if the law requires it, or to protect our rights or someone&rsquo;s safety.</p>

      <h2>How long we keep it</h2>
      <p>We keep order records and files while your project is active and for a reasonable time after delivery, so you can request add-ons or copies. Records needed for tax or legal reasons are kept as long as the law requires. You can ask us to delete your files sooner.</p>

      <h2>Security</h2>
      <p>Your files are stored privately and shared only through expiring links. Access to our admin tools is limited to the Mint Media team. No system is perfectly secure, but we take reasonable steps to protect your information.</p>

      <h2>Your choices</h2>
      <p>You can ask to see, correct or delete your information by emailing <a href="mailto:info@mintmediallc.com">info@mintmediallc.com</a>. Depending on where you live, you may have additional rights under local law.</p>

      <h2>Children</h2>
      <p>Mint 35 is a business service and is not meant for anyone under 18.</p>

      <h2>Changes and contact</h2>
      <p>We may update this policy and will post the new version on this page with its effective date. Questions: <a href="mailto:info@mintmediallc.com">info@mintmediallc.com</a> or <a href="tel:+17328134222">(732) 813-4222</a>.</p>
    </LegalPage>
  )
}
