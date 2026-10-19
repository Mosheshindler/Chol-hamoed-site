# Mint 35: notes for Claude

Mint Media's product for short (30–60 sec) AI commercials. Standalone Next.js 16 app in `mint-35/`,
separate from the Mint Media video site at the repo root (don't touch root files without asking).

## Stack
- Next.js 16 (app router, `proxy.js` instead of middleware), plain CSS (`app/globals.css`, `app/admin/admin.css`)
- Supabase (Postgres, auth, private storage bucket `project-files`); schema in `supabase/migrations/`
- Resend for email (`lib/email.js`); Vercel project `chol-hamoed-site-43jl`, Root Directory `mint-35`
- Review link: https://chol-hamoed-site-43jl.vercel.app (production branch `main`). mint35.com is NOT connected yet.

## Workflow the owner approved
- **Auto-merge:** for changes inside `mint-35/` only, Claude opens the PR and merges it after testing
  (build, click-through, desktop + phone screenshots), then checks the live review link and sends a screenshot.
- Anything touching files outside `mint-35/` (the Mint Media video site): ask first.
- Once mint35.com is connected, merges go live to customers: ask before merging larger changes.
- Schema changes need the SQL run in Supabase's SQL Editor; tell the owner before merging code that depends on it.

## Brand
- Official logo: `public/brand/mint35-logo-v2.png` (wordmark), `mint35-logo-full-v2.png` (with "Powered by mintmedia").
  When replacing a logo, use a new file name (v3...) so phones do not keep showing a cached old copy.
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
  service-role only, AES-256-GCM encrypted with a key from QB_TOKEN_KEY or the client secret). Without keys/connection, checkout takes orders with no card.
- No WhatsApp. Plan: shared admin Inbox fed by a website chat bubble, email (hello@mint35.com) and a customer
  job page thread; AI drafts every reply and learns from approved answers.

- Customer project page `/p/[customer_token]` (no login; token per job, page shows the whole order):
  progress, files (script/first_cut/final), approve/request changes, messages, add-on requests after approval.
  Add-on list in `lib/addons.js`: extra orientation $450/video, 15-sec cutdown $175/video, subtitles $150/video;
  extra revision and rush are custom quotes. Team replies and confirms add-ons from the job page.

- AI Production Disclaimer (owner's wording) lives in `lib/disclaimer.js`: page /ai-disclaimer, footer link, FAQ,
  and a required checkbox at checkout. The API refuses orders without the current DISCLAIMER_VERSION and logs a
  `disclaimer_accepted` event per job. Bump the version when the wording changes.

- Business days skip weekends and closed holidays (`lib/holidays.js`, via @hebcal/core, diaspora): Yom Tov,
  all Chol Hamoed (incl. Hoshana Raba), Purim, Tisha B'Av, plus New Year's, Memorial Day, July 4, Labor Day,
  Thanksgiving, Christmas. Erev Yom Tov (RH, YK, Sukkot, Pesach, Shavuot) is closed; Chanukah, other fasts and other US holidays are working days. Orders at/after 5pm ET count
  from the next business day; earliest delivery = 3 business days after that (`earliestDelivery` in lib/dates.js).

- Order form v2 (`components/ProjectForm.js`): steps 1 You, 2 Your brand, 3 one page per video (classic vs
  Momentum Pack questions), 4 Review & pay. Option lists in `lib/intake.js`. One point of contact (title, name,
  email, cell, company always required, alerts by email only for now). Logo required unless "I only have a
  logo for what I'm promoting" (then each video's media upload is required). Per-video answers beyond the old
  columns live in `projects.brief` (jsonb); `latest_date` is the in-hand deadline (Momentum: launch date).
  Chosen files are also kept in the browser (IndexedDB, `lib/fileStash.js`) so a reload keeps them; cleared on submit or after 14 days.
  Disclaimer: 3 key points ticked + full text scrolled to the end before the accept box unlocks.

- Checkout has Cloudflare Turnstile (`lib/turnstile.js`, widget above Submit) when NEXT_PUBLIC_TURNSTILE_SITE_KEY and
  TURNSTILE_SECRET_KEY are set in Vercel; the order API refuses orders without a valid token. QuickBooks errors log intuit_tid.

- Terms of Service (/terms) and Privacy Policy (/privacy), owner-approved Oct 2026 (`components/LegalPage.js`, effective date there);
  linked in the footer and above Submit on checkout.

- AI limits (owner decided): no custom characters to client specs, no look-alikes of real people, no celebrities or
  copyrighted characters; exact product looks need the client's real photos/footage. Shown in Not included, FAQ, form.

- Site check: `npm run check:site [url] [out-dir]` (scripts/site-check.mjs) screenshots the site on phone + desktop
  and checks loading, errors, images, sideways scroll, prices (from lib/packages.js), promise tiles, 5 How it works
  steps, order form steps, missing-field list, disclaimer, terms and privacy pages, admin login and that the order API refuses an empty
  order. It never submits an order. A weekly Routine (Mondays 8:56am ET) runs it against the live site and also reviews the screenshots
  by eye. Update the script's expectations when content changes on purpose.

## Planned (owner asked)
- Style samples still missing for "My own photos and videos only" and "Animated graphics & text" (owner will send);
  add the YouTube id as `sample` in STYLES (`lib/intake.js`).
- Twilio texting / WhatsApp alerts (after launch): the form's alert choice is hidden and sends 'email'; restore it
  in ProjectForm step 1, then send alerts per `alert_channel` at each job step. Add SMS wording back to /terms and /privacy.
- Automated customer emails at each job step, once the site is confirmed.
