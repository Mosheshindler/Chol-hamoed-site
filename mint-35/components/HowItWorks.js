const icon = {
  form: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M9 10h6M9 14h6M9 18h3" /></>,
  approve: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="m9 14 2 2 4-4" /></>,
  produce: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3z" /></>,
  deliver: <><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></>,
}

// One process for every package (single videos, campaigns and the Momentum Pack).
const STEPS = [
  {who: 'You', icon: 'form', title: 'Tell us.', text: 'One short form: what it’s for, who it’s for, your logo and images.'},
  {who: 'You', icon: 'approve', title: 'Approve the direction.', text: 'We send a script or a sample video. You sign off.'},
  {who: 'We', icon: 'produce', title: 'We make it.', text: 'AI production with a Mint Media finish. First cut in 3 business days.*'},
  {who: 'You', icon: 'deliver', title: 'Notes, then done.', text: 'One round of notes. Then your video is ready to post.'},
]

export default function HowItWorks() {
  return (
    <>
      <ol className="timeline">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <span className="step-num">0{i + 1}</span>
            <span className="dot" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon[s.icon]}</svg>
            </span>
            <span className={`who who-${s.who.toLowerCase()}`}>{s.who === 'You' ? 'Your part' : 'Our part'}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
      <p id="how-note" className="how-note">*First cut in 3 business days, counted from when your order enters production, not including weekends and holidays.</p>
    </>
  )
}
