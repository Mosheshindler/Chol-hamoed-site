# Mint 35

Marketing site for **Mint 35**, Mint Media's product for short (30–60 second) AI commercials.
It is a standalone Next.js app, separate from the Mint Media video site in the repo root.

## Run locally
```bash
cd mint-35
npm install
npm run dev
```
Open http://localhost:3000

## Contact form
Uses FormSubmit, posting to info@mintmediallc.com. The first submission triggers a one-time
confirmation email from FormSubmit; confirm it once and later inquiries arrive in that inbox.

## Deploy
Create a new Vercel project from this repo and set **Root Directory** to `mint-35`.
