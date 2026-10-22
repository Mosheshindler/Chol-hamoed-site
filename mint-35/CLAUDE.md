# Mint 35: notes for Claude

Mint Media's product for short (30–60 sec) AI commercials. Standalone Next.js 16 app in `mint-35/`,
separate from the Mint Media video site at the repo root (don't touch root files without asking).

## Stack
- Next.js 16 (app router, `proxy.js` instead of middleware), plain CSS (`app/globals.css`, `app/admin/admin.css`)
- Supabase (Postgres, auth, private storage bucket `project-files`); schema in `supabase/migrations/`
- Resend for email (`lib/email.js`); Vercel project `chol-hamoed-site-43jl`, Root Directory `mint-35`
- Live at https://www.mint35.com (mint35.com redirects there; DNS at GoDaddy), connected Oct 19 2026. The vercel.app
  link still works for testing. Production branch `main`. Email links use NEXT_PUBLIC_SITE_URL (https://www.mint35.com).

## Workflow the owner approved
- **Auto-merge:** for changes inside `mint-35/` only, Claude opens the PR and merges it after testing
  (build, click-through, desktop + phone screenshots), then checks the live review link and sends a screenshot.
- Anything touching files outside `mint-35/` (the Mint Media video site): ask first.
- mint35.com is connected, so merges go live to customers: ask before merging larger changes.
- Schema changes need the SQL run in Supabase's SQL Editor; tell the owner before merging code that depends on it.
- From Oct 30 2026 Supabase no longer auto-grants API access to NEW tables in `public` (existing tables keep theirs).
  Any new table's SQL must add grants, e.g. `grant select, insert, update, delete on public.x to authenticated, service_role;`
  (service_role for the server/order API, authenticated for the admin, which still goes through RLS). Never grant to anon.

## Brand
- Official logo: `public/brand/mint35-logo-v2.png` (wordmark), `mint35-logo-full-v2.png` (with "Powered by mintmedia").
  When replacing a logo, use a new file name (v3...) so phones do not keep showing a cached old copy. /brand and /hero files are
  cached for a week (next.config.js headers), so always use a new file name when one changes.
- Page weight (Oct 21): ~450 KB per homepage visit. Video posters use YouTube's WebP thumbnails; hero frames are WebP; icon.png is 192px.
  Current logo is "mint:35" (colon version, supplied Oct 2026). Made transparent from the supplied artwork; never recolor or redraw.
- Colors: lime `#88C040`, deep green `#107838`, near-black background.
- Hidden from search until `NEXT_PUBLIC_ALLOW_INDEXING=true`.

## Decisions so far
- Packages and prices live in `lib/packages.js` (Single 35 $2,800, Campaign 3 $7,200, Momentum Pack $3,800 [slug online-campaign];
  Momentum Pack is for online fundraisers (organizations), org name required).
- Orders: visitors add packages (repeats allowed) to a browser-side cart, then fill one form: contact + brand
  once, a brief per package. Each package becomes its own job sharing `order_id`.
- Payments: QuickBooks Payments only (`lib/qb.js`). Checkout tokenizes the card in the browser (Intuit tokens
  endpoint; numbers never hit our server), the server saves it as a card on file under customer id = order_id.
  Accepting a job with a card moves it to `card_saved`; "Start job & charge card" charges the job price;
  confirming an add-on charges it. Owner connects QuickBooks at /admin/settings (OAuth, tokens in `qb_connection`,
  service-role only; access tokens kept in memory only, refresh token AES-256-GCM encrypted with a key from QB_TOKEN_KEY or the client secret). Without keys/connection, checkout takes orders with no card.
- Email: Resend, mint35.com verified (Oct 12); sent from hello@mint35.com. mint35.com has no mailbox (no MX), so replies go to
  EMAIL_REPLY_TO (default info@mintmediallc.com).
- No WhatsApp. Plan: shared admin Inbox fed by a website chat bubble, email (hello@mint35.com) and a customer
  job page thread; AI drafts every reply and learns from approved answers.

- Customer project page `/p/[customer_token]` (no login; token per job, page shows the whole order):
  progress, files (script/first_cut/final), approve/request changes, messages, add-on requests at any stage (order to delivery; homepage says extras can be added anytime).
  Add-on list in `lib/addons.js`: extra format $450/video, 15-sec cutdown $175/video, subtitles $150/video;
  extra revision and rush are custom quotes. Team replies and confirms add-ons from the job page.
  Admin Files can share a deliverable as an upload, a link (e.g. Google Doc) or pasted text (`recordShared`; project_files.url /
  .body, migration 20261021000000_shared_links.sql, placeholder path with no storage object). The customer page opens links in a
  new tab and shows pasted text inline.

- AI Production Disclaimer (owner's wording) lives in `lib/disclaimer.js`: page /ai-disclaimer, footer link, FAQ,
  and a required checkbox at checkout. The API refuses orders without the current DISCLAIMER_VERSION and logs a
  `disclaimer_accepted` event per job. Bump the version when the wording changes.

- Business days skip weekends and closed holidays (`lib/holidays.js`, via @hebcal/core, diaspora): Yom Tov,
  all Chol Hamoed (incl. Hoshana Raba), Purim, Tisha B'Av, plus New Year's, Memorial Day, July 4, Labor Day,
  Thanksgiving, Christmas. Erev Yom Tov (RH, YK, Sukkot, Pesach, Shavuot) is closed; Chanukah, other fasts and other US holidays are working days. Orders at/after 5pm ET count
  from the next business day; earliest in-hand date = 6 business days after that (`earliestDelivery`, FINAL_LEAD_BUSINESS_DAYS in lib/dates.js; first cut is 3).

- Order form v2 (`components/ProjectForm.js`): steps 1 You, 2 Your brand, 3 one page per video (classic vs
  Momentum Pack questions), 4 Review & pay. Option lists in `lib/intake.js`. One point of contact (name,
  email, cell, company always required; no title field since Oct 21; alerts by email only for now). Step 1 opens with a "Have these handy" note.
  Campaign 3 ("3 different videos, one look"; owner: avoid "stories") asks "General direction only" vs "I have an idea for each video" (3 optional boxes) -> brief.stories / brief.video_ideas. Logo required unless "I only have a
  logo for what I'm promoting" (then each video's media upload is required). Per-video answers beyond the old
  columns live in `projects.brief` (jsonb); `latest_date` is the in-hand deadline (Momentum: launch date).
  Chosen files are also kept in the browser (IndexedDB, `lib/fileStash.js`) so a reload keeps them; cleared on submit or after 14 days.
  Disclaimer: 3 key points ticked + full text scrolled to the end before the accept box unlocks.

- Checkout has Cloudflare Turnstile (`lib/turnstile.js`, widget above Submit) when NEXT_PUBLIC_TURNSTILE_SITE_KEY and
  TURNSTILE_SECRET_KEY are set in Vercel; the order API refuses orders without a valid token. QuickBooks errors log intuit_tid.

- Terms of Service (/terms) and Privacy Policy (/privacy), owner-approved Oct 2026 (`components/LegalPage.js`, effective date there);
  linked in the footer and above Submit on checkout.

- Owner decisions Oct 19 (site review): no "budget-friendly"; FAQ says cancel free before we start the project;
  card charge phrase everywhere = "when we start your project"; earliest in-hand date 6 business days; extras are offered only at checkout (owner):
  an "Add extras" card on Review & pay above the card (CHECKOUT_EXTRAS in lib/packages.js, priced per video, quote ones
  flagged; saved in brief.extras and added to price_cents); the homepage only mentions it. Extra formats: checkboxes under
  Orientation (`extraFormatsCost`, $450 x videos, brief.extra_formats); style renamed "3D animated characters" (no Pixar);
  intro pricing stays open-ended; no testimonials yet. Header nav collapses into a menu button below 1120px.

- AI limits (owner decided): no custom characters to client specs, no look-alikes of real people, no celebrities or
  copyrighted characters; exact product looks need the client's real photos/footage. Shown in Not included, FAQ, form.

- Site check: `npm run check:site [url] [out-dir]` (scripts/site-check.mjs) screenshots the site on phone + desktop
  and checks loading, errors, images, sideways scroll, prices (from lib/packages.js), promise tiles, 5 How it works
  steps, order form steps, missing-field list, disclaimer, terms and privacy pages, admin login and that the order API refuses an empty
  order. It never submits an order. A weekly Routine (Mondays 8:56am ET) runs it against the live site and also reviews the screenshots
  by eye. Update the script's expectations when content changes on purpose.

- Homepage order (owner, Oct 20): hero, Work ("See what's possible", style captions), Why Mint 35 (3 icon benefits +
  "Perfect for" chips), Powered by Mint Media (real logo + link), How it works, What's included ("Fixed scope. Focused results."),
  Packages (+ formats box, "First cut in 3 business days once production starts. Final video in about 6."), FAQ (incl. "What counts as a revision?"), final CTA repeats "Powerful video. Simplified." Mint 35 vs Mint Media stays a pop-up
  (CompareModal), opened from How it works, What's included and Packages. Footer: Mint 35 logo + real Mint Media logo.
  Blocks fade up as they scroll in (`components/ScrollReveal.js`, homepage only, off for reduced motion); the site check scrolls
  through before its full-page shot.
- Scope wording (owner, Oct 21): Single 35 and Campaign 3 list "Script approval" (Campaign 3: one per video); Momentum Pack:
  1 sample video to approve, "1 revision round on the first video" (the other 4 follow the approved look; matches Terms §4).
  Customer word is "video format" (not orientation/export). Admin labels say "sample video" for Momentum (`forPackage` in lib/status.js).

- Team sign-in (Oct 21): owner adds a teammate with name + email only; they get an invite email (Resend, `lib/passwordLink.js`)
  with a one-time link to /admin/set-password. Login has "Forgot password?" (/admin/forgot). Links come from
  auth.admin.generateLink (recovery) as ?token=hashed_token; the token is only verified (verifyOtp) when the form is
  submitted, so email link scanners can't use it up. Team page has "Send set-password link" per teammate.

- Admin job pages (Oct 21): /admin/projects/[id] is an order hub with 4 tiles (Project overview, Billing & payment, Progress,
  Communications), each opening its own tab page (project/, billing/, progress/, communications/; tab bar in layout.js).
  All load the whole order via `_lib/order.js` (loadOrder, React cache). Progress holds the next-step buttons: steps that email
  the client show the exact email (`customerNotice` in lib/notices.js, same function moveStatus sends) plus an optional personal
  line (also saved as a team message); delivery steps (script/first cut/final) include the share box (link, text or file).
  updateJob only changes the fields a form sends (price on Billing, assignee on Communications, due date on Progress).
  Progress shows "First cut by" (due_date) and "Final by" (latest in-hand / launch) with business-day countdowns
  (`businessDaysUntil` in lib/dates.js), and a Deliverables checklist (`deliverables()` in _lib/text.js): script, first cut,
  final, plus extra formats (kind `extra_format`, labeled by shape) and the 15-sec cutdown (kind `cutdown`) as separate files;
  subtitles are noted as part of the video. Kinds added in migration 20261022000000_more_deliverables.sql.

## Planned (owner asked)
- Style samples still missing for "My own photos and videos only" and "Animated graphics & text" (owner will send);
  add the YouTube id as `sample` in STYLES (`lib/intake.js`).
- Twilio texting / WhatsApp alerts (after launch): the form's alert choice is hidden and sends 'email'; restore it
  in ProjectForm step 1, then send alerts per `alert_channel` at each job step. Add SMS wording back to /terms and /privacy.
- Automated customer emails at each job step, once the site is confirmed.
- QuickBooks accounting sync (owner asked Oct 22; waiting on the bookkeeper): on each charge, find/create the QBO customer,
  a project (or sub-customer) per job "M35-#### · Package", and a sales receipt linked to the Payments charge, one line per item.
  Items live under Products & services category "Mint 35" > "Packages" (Single 35, Campaign 3, Momentum Pack) and "Add-ons"
  (Extra format, 15-second cutdown, Subtitles, Extra revision round, Rush delivery, Price adjustment); match by exact name.
  Needs the accounting scope added (reconnect; check Intuit's rules first). Items non-taxable until the owner's tax advisor answers.
  First real charge: Agudah, $2,975 (Single 35 + 15-second cutdown), before the sync; bookkeeper may enter it by hand.
