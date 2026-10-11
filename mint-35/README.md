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

## Project form
The project questionnaire (components/ProjectForm.js) posts to FormSubmit, which emails each
submission to info@mintmediallc.com with uploaded files attached. The first submission triggers a
one-time confirmation email from FormSubmit; confirm it once and later projects arrive in that inbox.
Email attachments are size-limited, so very large logo or image files may not come through.

## Deploy
Create a new Vercel project from this repo and set **Root Directory** to `mint-35`.
