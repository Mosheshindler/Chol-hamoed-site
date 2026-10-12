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
- Official logo: `public/brand/mint35-logo.png` (wordmark), `mint35-logo-full.png` (with "Powered by mintmedia").
  Made transparent from the supplied artwork; never recolor or redraw.
- Colors: lime `#88C040`, deep green `#107838`, near-black background.
- Hidden from search until `NEXT_PUBLIC_ALLOW_INDEXING=true`.

## Decisions so far
- Packages and prices live in `lib/packages.js` (Single 35 $2,800, Campaign 3 $6,400, Online Campaign $3,200;
  Online Campaign is for fundraising organizations, org name required).
- Orders: visitors add packages (repeats allowed) to a browser-side cart, then fill one form: contact + brand
  once, a brief per package. Each package becomes its own job sharing `order_id`; nothing is charged at checkout.
- Payments: QuickBooks only. Card saved at acceptance, charged on "Start job" (not built yet).
- No WhatsApp. Plan: shared admin Inbox fed by a website chat bubble, email (hello@mint35.com) and a customer
  job page thread; AI drafts every reply and learns from approved answers.
