import {DISCLAIMER} from '@/lib/disclaimer'

export default function DisclaimerText() {
  return (
    <div className="disclaimer-text">
      {DISCLAIMER.map((p, i) => <p key={i}>{p.lead && <b>{p.lead} </b>}{p.text}</p>)}
    </div>
  )
}
