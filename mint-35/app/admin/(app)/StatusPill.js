import {STATUSES} from '@/lib/status'

export default function StatusPill({status}) {
  const s = STATUSES[status]
  return <span className={`pill pill-${s.tone}`}>{s.label}</span>
}
