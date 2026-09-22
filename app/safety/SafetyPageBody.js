// Approved "Content Standards" body content, provided as a ready-made package. Styles are
// merged into globals.css (Next.js only allows global CSS imports from the root layout) —
// this stays purely presentational, reusing the site's real Header/Footer from page.js.
const controls = [
  {
    title: "Mint Media productions only",
    lead: "Every video is created by Mint Media.",
    detail: "No third-party submissions or outside creators can publish content on the platform.",
  },
  {
    title: "No public comments",
    lead: "Visitors cannot post public content.",
    detail: "The viewing experience remains controlled, clean, and professionally managed.",
  },
  {
    title: "Manual content review",
    lead: "Nothing is published automatically.",
    detail: "Every video and thumbnail is reviewed and approved by Mint Media before publication.",
  },
];

export default function SafetyPageBody() {
  return (
    <main className="safetyPage">
      <section className="safetyHero" aria-labelledby="safety-title">
        <div className="safetyShell safetyHeroInner">
          <div className="safetyHeroCopy">
            <p className="safetyEyebrow">Content Safety</p>
            <h1 id="safety-title">Content<br />Standards</h1>
            <span className="safetyRule" aria-hidden="true" />
            <p className="safetyTagline">Curated for the whole family</p>
          </div>

          <div className="safetySeal" aria-label="100% Mint Media produced">
            <strong>100%</strong>
            <span>Mint Media<br />Produced</span>
          </div>
        </div>
      </section>

      <div className="safetyShell safetyContent">
        <section className="safetyIntro" aria-labelledby="exclusive-title">
          <p className="safetyEyebrow">Exclusively Mint Media</p>
          <h2 id="exclusive-title">Every video is produced by Mint Media.</h2>
          <p>
            The platform features exclusively Mint Media content—there are no
            third-party videos, public uploads, or outside content creators.
          </p>
          <p className="safetyIntroNote">
            Each video and thumbnail is reviewed and approved by Mint Media before publication.
          </p>
        </section>

        <section className="safetyControls" aria-labelledby="controls-title">
          <p className="safetyEyebrow">How the platform is controlled</p>
          <h2 id="controls-title">A curated destination—not an open network.</h2>

          <div className="safetyGrid">
            {controls.map((item) => (
              <article className="safetyCard" key={item.title}>
                <div className="safetyCheck" aria-hidden="true">✓</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.lead}</p>
                </div>
                <p className="safetyCardDetail">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="safetyContact" aria-labelledby="verification-title">
          <div>
            <p className="safetyEyebrow">Site review &amp; verification</p>
            <h2 id="verification-title">Questions from a filtering provider?</h2>
            <p>Mint Media welcomes review requests and can provide additional information.</p>
          </div>
          <a href="mailto:info@mintmediallc.com">info@mintmediallc.com <span aria-hidden="true">→</span></a>
        </section>
      </div>
    </main>
  );
}
