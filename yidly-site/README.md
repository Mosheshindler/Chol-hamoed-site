# Yidly.co

The family entertainment site from Mint Media. Built with Next.js; hosted on Vercel.
Every video is sold on Mostly Music, so this site links out to Mostly Music for purchases.

## Pages
- `/`: The Gadget Guy hero, all Yidly videos, Join the Club (Mailchimp), contact form
- `/gadget-guy`: The Gadget Guy hub (story, facts, trailer, Gadget Lab, club signup)

## Editing content
- Videos, prices and Mostly Music links: `lib/videos.js`
- The Gadget Guy trailer: set `trailerVimeoId` in `lib/videos.js`
- The Gadget Guy Mostly Music link: set `url` in `GADGET_GUY` in `lib/videos.js`
- WhatsApp button: set `LINKS.whatsapp` in `lib/site.js`
- Images: `public/images/`

## Run locally
```bash
npm install
npm run dev
```
Then open http://localhost:3000

## Contact form
Messages are emailed to info@yidly.co through Resend. Copy `.env.local.example` to `.env.local`
(and add the same values in Vercel → Settings → Environment Variables).

## Launching on yidly.co (GoDaddy)
1. Import this repo into Vercel and deploy.
2. In Vercel → Settings → Domains, add `yidly.co` and `www.yidly.co`.
3. In GoDaddy DNS, change only the records Vercel asks for (the `A` record for `@` and the
   `CNAME` for `www`). **Do not touch the `MX` records**: they keep info@yidly.co working.
