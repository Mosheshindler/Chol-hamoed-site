'use client'

import {useState} from 'react'

const icon = {
  form: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M9 10h6M9 14h6M9 18h3" /></>,
  approve: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="m9 14 2 2 4-4" /></>,
  produce: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3z" /></>,
  deliver: <><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
}

// Two versions of the process: classic videos, and the Momentum Pack's five milestone videos.
const FLOWS = {
  classic: {
    tab: 'Single & Campaign',
    steps: [
      {who: 'You', icon: 'form', title: 'Tell us.', text: 'One short form: what you’re promoting, who it’s for, your logo and images.'},
      {who: 'You', icon: 'approve', title: 'Approve the script.', text: 'We write it. You read it and sign off.'},
      {who: 'We', icon: 'produce', title: 'We make it.', text: 'AI production with a Mint Media finish. First cut in 3 business days.*'},
      {who: 'You', icon: 'deliver', title: 'Notes, then done.', text: 'One round of notes. We finish it, ready to post.'},
    ],
  },
  momentum: {
    tab: 'Momentum Pack',
    steps: [
      {who: 'You', icon: 'form', title: 'Tell us your campaign.', text: 'Your cause, goal, launch date and campaign link.'},
      {who: 'You', icon: 'approve', title: 'Approve the sample.', text: 'We make your “Live Now” video first. You approve the look, with one round of notes.'},
      {who: 'We', icon: 'produce', title: 'We make the rest.', text: '25%, 50%, 75% and “We Made It!”, all in the look you approved.'},
      {who: 'You', icon: 'chart', title: 'Post as you climb.', text: 'All 5 are ready before launch. Share each one as you hit the milestone.'},
    ],
  },
}

export default function HowItWorks() {
  const [flow, setFlow] = useState('classic')
  const f = FLOWS[flow]
  return (
    <>
      <div className="how-tabs" role="tablist" aria-label="Choose a package">
        {Object.entries(FLOWS).map(([key, v]) => (
          <button key={key} type="button" role="tab" aria-selected={flow === key} className={flow === key ? 'on' : ''} onClick={() => setFlow(key)}>{v.tab}</button>
        ))}
      </div>
      <ol className="timeline" key={flow}>
        {f.steps.map((s, i) => (
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
      <p id="how-note" className="how-note">
        {flow === 'classic'
          ? '*First cut in 3 business days, counted from when your order enters production, not including weekends and holidays.'
          : 'The sample and all 5 videos are ready before your launch date. Pick a launch at least 3 business days out, not including weekends and holidays.'}
      </p>
    </>
  )
}
