// Site check: opens the live (or any) Mint 35 site on a phone and a desktop screen, takes screenshots
// and checks that pages load, nothing errors, images show, nothing spills sideways, and key content
// (packages and prices, the promise, How it works, the order form steps, the disclaimer lock) is right.
// It never places an order.
//
//   node scripts/site-check.mjs [base-url] [output-dir]
//   defaults: https://www.mint35.com  ./site-check-output
//
// Exit code 0 = all checks passed, 1 = something failed (see report.md in the output dir).
// Needs Playwright with Chromium (preinstalled in Claude Code cloud sessions).

import {mkdirSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {createRequire} from 'node:module'
import {PACKAGES, formatPrice} from '../lib/packages.js'

// require() also finds a globally installed Playwright (NODE_PATH), which a plain import does not.
const {chromium} = createRequire(import.meta.url)('playwright')

const BASE = (process.argv[2] || 'https://www.mint35.com').replace(/\/$/, '')
const OUT = process.argv[3] || 'site-check-output'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'

const DEVICES = [
  {name: 'phone', viewport: {width: 390, height: 844}, scale: 2, mobile: true},
  {name: 'desktop', viewport: {width: 1440, height: 900}, scale: 1, mobile: false},
]

const results = []
const pass = (device, check, detail = '') => results.push({device, check, ok: true, detail})
const fail = (device, check, detail = '') => results.push({device, check, ok: false, detail})
const expect = (device, check, cond, detail = '') => (cond ? pass : fail)(device, check, detail)

mkdirSync(OUT, {recursive: true})
const browser = await chromium.launch({executablePath: CHROMIUM}).catch(() => chromium.launch())

for (const d of DEVICES) {
  const ctx = await browser.newContext({viewport: d.viewport, deviceScaleFactor: d.scale, isMobile: d.mobile, hasTouch: d.mobile})
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(`page error: ${e.message}`))
  page.on('console', m => { if (m.type() === 'error' && !/youtube|ytimg|doubleclick|favicon/i.test(m.text())) errors.push(`console: ${m.text()}`) })
  page.on('response', r => { if (r.url().startsWith(BASE) && r.status() >= 400 && !r.url().includes('/api/')) errors.push(`${r.status()} ${r.url()}`) })

  const shot = async (name, full = false) => {
    await page.waitForTimeout(400)
    await page.screenshot({path: join(OUT, `${d.name}-${name}.png`), fullPage: full})
  }
  const text = async () => page.locator('body').innerText()

  // Generic page health: loads, images render, no sideways scroll.
  async function health(path, label) {
    const res = await page.goto(BASE + path, {waitUntil: 'networkidle'}).catch(e => ({status: () => 0, err: e}))
    expect(d.name, `${label}: loads`, res.status() === 200, `status ${res.status()}`)
    await page.waitForTimeout(800)
    const broken = await page.$$eval('img', imgs => imgs.filter(i => i.complete && i.naturalWidth === 0 && !i.src.includes('ytimg')).map(i => i.src))
    expect(d.name, `${label}: images load`, broken.length === 0, broken.join(', '))
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(d.name, `${label}: no sideways scrolling`, overflow <= 1, `${overflow}px too wide`)
  }

  // Homepage
  await health('/', 'Homepage')
  await shot('01-homepage-top')
  await shot('00-homepage-full', true)
  const home = await text()
  const has = t => home.toLowerCase().includes(t.toLowerCase()) // some labels are shown in capitals
  for (const t of ['Powerful video.', 'Simplified.', 'Mint Media creativity. AI-powered.', 'No film shoots', 'No meetings', 'No hassle', 'Introductory pricing']) {
    expect(d.name, `Homepage shows "${t}"`, has(t))
  }
  for (const p of PACKAGES) {
    expect(d.name, `Package ${p.name} at ${formatPrice(p.price)}`, home.includes(p.name) && home.includes(formatPrice(p.price)))
  }
  const steps = await page.locator('#how .timeline > li').count()
  expect(d.name, 'How it works has 5 steps', steps === 5, `found ${steps}`)
  const logoOk = await page.$$eval('img[src*="mint35-logo"]', imgs => imgs.length > 0 && imgs.every(i => i.naturalWidth > 0))
  expect(d.name, 'Logo shows', logoOk)
  for (const id of ['how', 'packages', 'work', 'faq']) {
    const el = page.locator(`#${id}`)
    if (await el.count()) { await el.scrollIntoViewIfNeeded(); await shot(`02-section-${id}`) } else fail(d.name, `Section #${id} exists`)
  }
  const samples = await page.locator('#work iframe, #work img, #work button').count()
  expect(d.name, 'Sample videos section has videos', samples > 0)

  // Order builder → form
  await health('/start', 'Order page')
  await shot('03-order-builder')
  await page.locator('.mini-package button.btn').first().click()
  await page.waitForTimeout(500)
  await page.goto(BASE + '/start?step=details', {waitUntil: 'networkidle'})
  const wizard = await page.waitForSelector('.wizard-head', {timeout: 15000}).then(() => true).catch(() => false)
  expect(d.name, 'Order form opens', wizard)
  if (wizard) {
    await page.evaluate(() => { try { Object.keys(localStorage).filter(k => k.startsWith('mint35-intake')).forEach(k => localStorage.removeItem(k)) } catch {} })
    await page.reload({waitUntil: 'networkidle'}); await page.waitForSelector('.wizard-head')
    const count = await page.locator('.wizard-count').innerText()
    expect(d.name, 'Form shows step counter', /STEP 1 OF \d/i.test(count), count)
    await shot('04-form-step1')
    // Pressing Continue with nothing filled in must show the missing-fields list.
    await page.locator('.wizard-step:not([hidden]) .step-nav .btn-primary').click()
    await page.waitForTimeout(600)
    const missing = await page.locator('.missing-box li').count()
    expect(d.name, 'Missing-fields list appears', missing >= 5, `${missing} items`)
    await shot('05-form-missing-fields')
    // Fill step 1 with test data and move on, to see each step render (no order is submitted).
    await page.fill('[name=first_name]', 'Site'); await page.fill('[name=last_name]', 'Check')
    await page.fill('[name=email]', 'site-check@example.com'); await page.fill('[name=phone]', '7325550000')
    await page.fill('[name=company]', 'Site Check')
    if (await page.locator('.alert-opt').count()) await page.locator('.alert-opt').last().click()
    await page.locator('.wizard-step:not([hidden]) .step-nav .btn-primary').click(); await page.waitForTimeout(500)
    expect(d.name, 'Form step 2 (brand) opens', /brand/i.test(await page.locator('#form-title').innerText()))
    await shot('06-form-step2-brand')
    await page.locator('.mini-check').click(); await page.waitForTimeout(200)
    await page.locator('.wizard-step:not([hidden]) .step-nav .btn-primary').click(); await page.waitForTimeout(500)
    expect(d.name, 'Form step 3 (video) opens', /video/i.test(await page.locator('#form-title').innerText()))
    await shot('07-form-step3-video')
    const styles = await page.locator('.wizard-step:not([hidden]) .choice').count()
    expect(d.name, 'Style choices show', styles >= 5, `${styles}`)
    await page.evaluate(() => { localStorage.removeItem('mint35-cart') })
  }

  // Disclaimer page
  await health('/ai-disclaimer', 'Disclaimer page')
  expect(d.name, 'Disclaimer text shows', (await text()).includes('AI Production Disclaimer'))
  await shot('08-disclaimer')

  // Terms and Privacy (Intuit needs both live for payments)
  await health('/terms', 'Terms page')
  expect(d.name, 'Terms text shows', (await text()).includes('All sales are final'))
  await shot('08b-terms')
  await health('/privacy', 'Privacy page')
  expect(d.name, 'Privacy text shows', (await text()).includes('What we collect'))
  await shot('08c-privacy')

  // Admin login page (no sign-in)
  await health('/admin/login', 'Admin login')
  await shot('09-admin-login')

  expect(d.name, 'No errors in the browser', errors.length === 0, errors.slice(0, 8).join(' | '))
  // The order API must refuse an order without the disclaimer (nothing is created). Sent from the page,
  // so it uses the same network path as a real visitor.
  if (d.name === 'desktop') {
    const status = await page.evaluate(() => fetch('/api/projects', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{}'}).then(r => r.status).catch(() => 0))
    expect('server', 'Order API refuses an incomplete order', status === 400, `status ${status}`)
  }

  await ctx.close()
}

await browser.close()

const failed = results.filter(r => !r.ok)
const lines = [
  `# Mint 35 site check`,
  ``,
  `${BASE} · ${new Date().toLocaleString('en-US', {timeZone: 'America/New_York'})} ET`,
  ``,
  failed.length ? `**${failed.length} of ${results.length} checks failed.**` : `**All ${results.length} checks passed.**`,
  ``,
  `| Device | Check | Result | Detail |`,
  `| --- | --- | --- | --- |`,
  ...[...failed, ...results.filter(r => r.ok)].map(r => `| ${r.device} | ${r.check} | ${r.ok ? 'pass' : '**FAIL**'} | ${(r.detail || '').replace(/\|/g, '/')} |`),
]
writeFileSync(join(OUT, 'report.md'), lines.join('\n') + '\n')
console.log(lines.slice(0, 5).join('\n'))
for (const f of failed) console.log(`FAIL [${f.device}] ${f.check}${f.detail ? ` — ${f.detail}` : ''}`)
console.log(`Screenshots and report.md in ${OUT}`)
process.exit(failed.length ? 1 : 0)
