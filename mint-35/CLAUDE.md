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
  service-role only). Without keys/connection, checkout takes orders with no card.
- No WhatsApp. Plan: shared admin Inbox fed by a website chat bubble, email (hello@mint35.com) and a customer
  job page thread; AI drafts every reply and learns from approved answers.

- Customer project page `/p/[customer_token]` (no login; token per job, page shows the whole order):
  progress, files (script/first_cut/final), approve/request changes, messages, add-on requests after approval.
  Add-on list in `lib/addons.js`: extra orientation $450/video, 15-sec cutdown $175/video, captions $150/video;
  extra revision and rush are custom quotes. Team replies and confirms add-ons from the job page.

- AI Production Disclaimer (owner's wording) lives in `lib/disclaimer.js`: page /ai-disclaimer, footer link, FAQ,
  and a required checkbox at checkout. The API refuses orders without the current DISCLAIMER_VERSION and logs a
  `disclaimer_accepted` event per job. Bump the version when the wording changes.

## Planned (owner asked)
- AI customization limits (to decide with the owner): what the fixed scope allows, e.g. no custom
  characters; spell it out on the site (Included / Not included, FAQ) and in the form.
- Visual style picker on the order form (per package): e.g. Animated (Pixar-style), Realistic, plus other
  styles the owner approves; show small example thumbnails; store it on the job for the team.
- Automated customer emails at each job step, once the site is confirmed.
