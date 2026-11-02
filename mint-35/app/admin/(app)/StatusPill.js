import {STATUSES, forPackage} from '@/lib/status'

// Pass the job (`job`) so Momentum jobs show the right step (script or sample video); `pkg` alone reads as the old flow.
export default function StatusPill({status, pkg, job}) {
  const s = STATUSES[status]
  return <span className={`pill pill-${s.tone}`}>{forPackage(s.label, job || pkg)}</span>
}
