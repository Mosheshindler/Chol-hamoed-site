# Mint 35

Website and back office for **Mint 35**, Mint Media's product for short (30–60 second) AI commercials.
A standalone Next.js app, separate from the Mint Media video site in the repo root.

- `/`: public site and project questionnaire
- `/admin`: team back office (jobs, files, notes, team), sign-in required

## Run locally
```bash
cd mint-35
npm install
npx supabase start      # local database, auth and storage (needs Docker)
cp .env.example .env.local   # then paste the local URL/keys `supabase start` prints
npm run dev
```
Open http://localhost:3000, then http://localhost:3000/admin/setup to create the first (owner) account.

## Production setup (one time)
1. **Supabase:** create a new project. In the SQL Editor, run `supabase/migrations/20261011000000_init.sql`.
2. **Vercel:** new project from this repo, Root Directory `mint-35`. Add the variables from `.env.example`
   (Supabase values are under Project Settings → API).
3. **Owner account:** visit `https://mint35.com/admin/setup` once and create your login. Add teammates on the Team page.
4. **Email:** add `mint35.com` in Resend, add the DNS records it shows, then set `RESEND_API_KEY`.
   Until then the site works but skips emails.

## How a job moves
New request → Accept & set price → (card on file) → Start job → Script sent → Script approved
(due date set to 3 business days) → First cut sent → Revision → Delivered. Every step is logged on the job.
