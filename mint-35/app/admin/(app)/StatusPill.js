import {STATUSES, forPackage} from '@/lib/status'

export default function StatusPill({status, pkg}) {
  const s = STATUSES[status]
  return <span className={`pill pill-${s.tone}`}>{forPackage(s.label, pkg)}</span>
}
