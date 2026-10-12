import {NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase/admin'
import {sendEmail, esc} from '@/lib/email'
import {projectRef} from '@/lib/status'

// Step 2 of a public submission: after the browser has uploaded files, record what actually
// landed in storage and send the confirmation emails. Guarded by the project's intake token.
export async function POST(request, ctx) {
  const {id} = await ctx.params
  let body
  try { body = await request.json() } catch { return NextResponse.json({error: 'Invalid request.'}, {status: 400}) }

  const db = createAdminClient()
  const {data: project} = await db.from('projects')
    .select('id, number, name, email, company, promoting, package, intake_token, files_received')
    .eq('id', id).maybeSingle()
  if (!project || project.intake_token !== body.intakeToken) return NextResponse.json({error: 'Not found.'}, {status: 404})
  if (project.files_received) return NextResponse.json({ok: true})

  const kinds = new Map((Array.isArray(body.files) ? body.files : []).map(f => [f.path, f]))
  const {data: listed} = await db.storage.from('project-files').list(`${id}/intake`, {limit: 100})
  const rows = (listed || []).map(o => {
    const path = `${id}/intake/${o.name}`
    const meta = kinds.get(path)
    return {
      project_id: id,
      path,
      name: meta?.name || o.name.replace(/^\d+-/, ''),
      kind: meta?.kind === 'logo' ? 'logo' : 'brand_image',
      size: o.metadata?.size ?? null,
    }
  })
  if (rows.length) await db.from('project_files').insert(rows)
  await db.from('projects').update({files_received: true}).eq('id', id)

  const ref = projectRef(project.number)
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://mint35.com'
  await Promise.all([
    sendEmail({
      to: process.env.TEAM_NOTIFY_EMAIL || 'info@mintmediallc.com',
      replyTo: project.email,
      subject: `New Mint 35 request ${ref}: ${project.company || project.name}`,
      html: `<p><b>${esc(project.name)}</b>${project.company ? ` (${esc(project.company)})` : ''} submitted a project.</p>
<p><b>Promoting:</b> ${esc(project.promoting)}<br><b>Package:</b> ${esc(project.package || 'Not chosen')}<br><b>Files:</b> ${rows.length}</p>
<p><a href="${site}/admin/projects/${id}">Open ${ref} in the admin</a></p>`,
    }),
    sendEmail({
      to: project.email,
      subject: `We got your Mint 35 project (${ref})`,
      html: `<p>Hi ${esc(project.name.split(' ')[0])},</p>
<p>Thanks for sending your project details. Our team will review them and get back to you with a price. Nothing is charged until we start your job.</p>
<p>Your reference number is <b>${ref}</b>.</p>
<p>— The Mint 35 team</p>`,
    }),
  ])

  return NextResponse.json({ok: true, files: rows.length})
}
