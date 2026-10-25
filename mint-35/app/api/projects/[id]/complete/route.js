import {NextResponse} from 'next/server'
import {taxCents, jobTaxRate, exemptLabel} from '@/lib/tax'
import {createAdminClient} from '@/lib/supabase/admin'
import {sendEmail, esc} from '@/lib/email'
import {projectRef, formatMoney} from '@/lib/status'
import {customerLink} from '@/lib/site'
import {UPLOAD_KINDS, MAX_UPLOAD_MB} from '@/lib/intake'
import {DISCLAIMER, DISCLAIMER_TITLE} from '@/lib/disclaimer'

// Step 2 of a submission: after the browser has uploaded files, link order-wide files (logo, brand
// materials) to every job and each video's own files to its job, then send one confirmation email.
// Guarded by the first job's intake token.
export async function POST(request, ctx) {
  const {id} = await ctx.params
  let body
  try { body = await request.json() } catch { return NextResponse.json({error: 'Invalid request.'}, {status: 400}) }

  const db = createAdminClient()
  const {data: first} = await db.from('projects')
    .select('id, order_id, intake_token, files_received')
    .eq('id', id).maybeSingle()
  if (!first || first.intake_token !== body.intakeToken) return NextResponse.json({error: 'Not found.'}, {status: 404})
  if (first.files_received) return NextResponse.json({ok: true})

  const {data: jobs} = first.order_id
    ? await db.from('projects').select('id, number, name, first_name, email, company, promoting, package, price_cents, customer_token, brief').eq('order_id', first.order_id).order('order_item')
    : await db.from('projects').select('id, number, name, first_name, email, company, promoting, package, price_cents, customer_token, brief').eq('id', id)

  const meta = new Map((Array.isArray(body.files) ? body.files : []).map(f => [f.path, f]))
  const rows = []
  let fileCount = 0
  for (const job of jobs) {
    const {data: listed} = await db.storage.from('project-files').list(`${job.id}/intake`, {limit: 200})
    for (const o of listed || []) {
      const path = `${job.id}/intake/${o.name}`
      const m = o.name.match(/^(shared|video)-([a-z_]+)-\d+-(.*)$/)
      const kind = m && UPLOAD_KINDS[m[2]] ? m[2] : 'brand_image' // files from the older form
      const file = {path, name: meta.get(path)?.name || (m ? m[3] : o.name.replace(/^\d+-/, '')), kind, size: o.metadata?.size ?? null}
      fileCount++
      // Order-wide files sit under the first job and belong to every job in the order.
      const owners = !m || m[1] === 'shared' ? jobs : [job]
      for (const j of owners) rows.push({...file, project_id: j.id})
    }
  }
  if (rows.length) await db.from('project_files').insert(rows)
  await db.from('projects').update({files_received: true}).in('id', jobs.map(j => j.id))

  const c = jobs[0]
  const site = new URL(request.url).origin
  const total = jobs.reduce((s, j) => s + (j.price_cents || 0), 0)
  const tax = jobs.reduce((s, j) => s + taxCents(j.price_cents, jobTaxRate(j)), 0)
  const exempt = jobs[0]?.brief?.tax?.exempt
  const taxLine = exempt ? `<p><b>Sales tax:</b> exempt (${esc(exemptLabel(jobs[0].brief.tax.reason))})</p>` : tax ? `<p><b>Sales tax:</b> ${formatMoney(tax)}</p>` : ''
  const refs = jobs.map(j => projectRef(j.number))
  // Files that were too big to upload and have no link yet: remind the client how to send them.
  const skipped = c.brief?.skipped_files || []
  const page = customerLink(site, c.customer_token)
  const reminder = skipped.length ? `<div style="border:1px solid #88C040;border-radius:10px;padding:14px 16px;margin:18px 0">
<p style="margin:0 0 8px"><b>Still to send: ${skipped.length > 1 ? `${skipped.length} files that were` : 'a file that was'} too big to upload</b></p>
<ul style="margin:0 0 8px">${skipped.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
<p style="margin:0 0 6px">Files over ${MAX_UPLOAD_MB} MB can be shared from your own Google Drive or Dropbox:</p>
<ol style="margin:0 0 8px">
<li>Upload ${skipped.length > 1 ? 'them' : 'it'} to Google Drive or Dropbox (a folder works too).</li>
<li>Set sharing to <b>&ldquo;Anyone with the link&rdquo;</b> can view.</li>
<li>Open <a href="${page}">your project page</a> and paste the link under <b>Add more photos &amp; files</b>.</li>
</ol>
<p style="margin:0;color:#666;font-size:13px">You can add files until production starts.</p></div>` : ''
  const lines = jobs.map(j => `<li><b>${projectRef(j.number)}</b> · ${esc(j.package || 'Package not chosen')} · ${j.price_cents ? formatMoney(j.price_cents) : 'quote'}<br>${esc(j.promoting)}</li>`).join('')
  const teamLinks = jobs.map(j => `<li><a href="${site}/admin/projects/${j.id}">Open ${projectRef(j.number)}</a></li>`).join('')

  await Promise.all([
    sendEmail({
      to: process.env.TEAM_NOTIFY_EMAIL || 'info@mintmediallc.com',
      replyTo: c.email,
      subject: `New Mint 35 ${jobs.length > 1 ? `order (${jobs.length} projects)` : 'request'} ${refs.join(', ')}: ${c.company || c.name}`,
      html: `<p><b>${esc(c.name)}</b>${c.company ? ` (${esc(c.company)})` : ''} submitted ${jobs.length > 1 ? `an order with ${jobs.length} projects` : 'a project'}.</p>
<ul>${lines}</ul>${skipped.length ? `<p><b>Still to come (too big to upload, no link yet):</b> ${esc(skipped.join(', '))}</p>` : ''}<p><b>Total:</b> ${formatMoney(total)}${tax ? ` + ${formatMoney(tax)} sales tax` : exempt ? ` · tax-exempt (${esc(exemptLabel(jobs[0].brief.tax.reason))})` : ''} · <b>Files:</b> ${fileCount}</p><ul>${teamLinks}</ul>`,
    }),
    sendEmail({
      to: c.email,
      subject: `We got your Mint 35 order (${refs.join(', ')})`,
      html: `<p>Hi ${esc(c.first_name || c.name.split(' ')[0])},</p>
<p>Thanks for your order. Here's what we received:</p><ul>${lines}</ul>
${tax || exempt ? `<p><b>Subtotal:</b> ${formatMoney(total)}</p>${taxLine}` : ''}<p><b>Total:</b> ${formatMoney(total + tax)}</p>
<p>Our team will review it and email you next steps. Your card will be charged in full when we start your project. You can cancel free before then; once we start, all sales are final.</p>
${reminder}<p><a href="${page}">Track your order on your project page</a></p>
<p>— The Mint 35 team</p>
<hr><p style="color:#666;font-size:13px"><b>${esc(DISCLAIMER_TITLE)}</b> (accepted with your order)</p>
${DISCLAIMER.map(d => `<p style="color:#666;font-size:13px">${d.lead ? `<b>${esc(d.lead)}</b> ` : ''}${esc(d.text)}</p>`).join('')}`,
    }),
  ])

  return NextResponse.json({ok: true, files: fileCount})
}
