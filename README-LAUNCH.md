# Mint Media Site — Launch Candidate V9

## One-time Supabase migration
Run `supabase-launch-migration.sql` in Supabase SQL Editor before using the multi-category admin.

## Environment
Copy your existing `.env.local` from the working V7/V8 project. Required values:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

## Local run
```bash
npm install
npm run dev
```
Then open http://localhost:3000

## What is included
- Locked Mint Media logo asset and locked category icon artwork
- Homepage featured carousel with working arrows/dots and clickable slides
- Search + category filtering
- Multi-category video assignment in Admin
- Watch page with large player + Up Next sidebar
- Share button shares the Mint site URL
- Premium/Yidly preview -> Mostly Music purchase URL
- Approved external Newsletter, WhatsApp, YouTube, Vimeo, Instagram and Mint Media website links
- About and Contact pages
- Contact form addressed to info@mintmediallc.com
- Responsive/mobile pass

## Contact form note
The form uses FormSubmit for immediate no-backend launch. The first submission to info@mintmediallc.com may require a one-time confirmation email from FormSubmit. After confirming, future submissions are delivered to that inbox. This can later be replaced with a private server-side mail provider without changing the page design.

## Deployment
This project is ready for a standard Next.js Vercel deployment. Add the same environment variables in Vercel, deploy, then connect the production domain.
