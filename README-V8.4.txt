Mint Media Site V8.4

Changes:
- Restores/keeps the approved homepage category icon system; supplied Stories icon remains an exact image asset.
- Functional homepage hero carousel populated from videos marked Featured on homepage.
- Working hero arrows and dots.
- Optional dedicated Hero Image in Admin; normal thumbnail is the fallback.
- Mint Media accent palette standardized to official #88C040 lime and #107838 deep green.
- Yidly and Mostly Music retain their supplied brand colors.

One-time Supabase migration:
Run supabase-v8.4-migration.sql in Supabase SQL Editor.

Then copy .env.local from the prior working version, npm install, npm run dev.
