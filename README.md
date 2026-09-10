# Mint Media Site V8

V8 builds on the working Supabase admin system.

## New in V8
- Existing video library management: edit, save, publish/unpublish and delete.
- Custom thumbnail replacement remains supported.
- Premium videos now use the stored Vimeo/YouTube video as the promo/preview.
- Premium videos have a Purchase / Full Video URL field.
- Public premium watch pages show the promo and a branded purchase CTA linking to the external purchase site.
- Premium badges appear on video cards and in the admin library.

## Required Supabase migration
Before using the premium purchase field, open Supabase > SQL Editor and run the contents of `supabase-v8-migration.sql`.

## Local setup
Use the same `.env.local` values from V7, then run:

```bash
npm install
npm run dev
```

Admin: http://localhost:3000/admin

## V8.1 update
Premium videos are presented as Yidly Premium previews. The full-video CTA links to Mostly Music, using the supplied Yidly and Mostly Music logo assets. The standard Mint Media header/logo is unchanged.

## V8.3 search update
- Homepage search now routes into the real video library.
- All Videos search filters title, client, and category.
- Category pages now actually filter to their own category before searching.
- Popular searches are clickable, including special handling for Under 5 min, Long form, Premium/Yidly, and Behind the Scenes.
- Header search icon opens the All Videos search page.
