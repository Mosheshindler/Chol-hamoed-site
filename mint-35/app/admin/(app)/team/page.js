import {createClient} from '@/lib/supabase/server'
import {formatDate} from '@/lib/dates'
import TeamForms, {RemoveButton} from './TeamForms'

export default async function TeamPage() {
  const supabase = await createClient()
  const {data: {user}} = await supabase.auth.getUser()
  const {data: team} = await supabase.from('team_members').select('*').order('created_at')
  const me = team.find(t => t.id === user.id)
  const isOwner = me?.role === 'owner'

  return (
    <>
      <div className="page-head"><h1>Team</h1></div>
      <div className="project-grid">
        <div className="col-main">
          <section className="panel">
            <h2>People</h2>
            <ul className="people">
              {team.map(t => (
                <li key={t.id}>
                  <span className="avatar" aria-hidden="true">{t.name.slice(0, 1).toUpperCase()}</span>
                  <span><b>{t.name}</b>{t.id === me?.id && <span className="muted"> (you)</span>}<small>{t.email}</small></span>
                  <span className={`pill ${t.role === 'owner' ? 'pill-go' : 'pill-off'}`}>{t.role === 'owner' ? 'Owner' : 'Team'}</span>
                  <small className="muted">Added {formatDate(t.created_at)}</small>
                  {isOwner && t.id !== me.id && <RemoveButton id={t.id} name={t.name} />}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="col-side">
          <TeamForms isOwner={isOwner} />
        </aside>
      </div>
    </>
  )
}
