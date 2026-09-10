# Mint Media Video Site — Claude Handoff

## Read this first
This is an EXISTING Next.js + Supabase project. Continue it; do not rebuild it from scratch and do not redesign approved pages. Inspect the existing code before changing anything. The user has spent substantial time approving exact visual directions and gets frustrated when locked assets or layouts are altered.

The code in this folder is **V9.5**, the latest working handoff build as of September 10, 2026. V9.5 still needs visual QA. The user's immediate next task was to review V9.5 and send screenshots of the Homepage, About, Contact and footer before launch.

## Working style / critical instruction
- When the user gives a clear task, execute it rather than repeatedly explaining what you are about to do.
- For code changes, batch related fixes into a single version so the user does not need to reinstall repeatedly.
- During design review, work one screen at a time.
- Never make unrelated visual changes to a page the user has called “locked.”
- If an asset is called “locked,” preserve the supplied image exactly. Do not redraw, recolor, restyle, distort, or substitute it.
- The user is working on a Mac in Safari and uses Terminal. Give exact copy/paste commands when installation is required.

# Brand
Company: Mint Media
Tagline: Strategic Video Production
Style: dark, cinematic, premium, clean grid, restrained rounded geometry.
Brand colors:
- Deep green: `#107838`
- Lime: `#88C040`
- Black: `#111111`
- Soft white: `#F2F6F2`

`public/assets/mint-media-logo.png` is a LOCKED official asset. Never recreate or modify the logo. Site greens should visually match the logo.

# Locked category icons
The category icon artwork is locked. Do not redesign it. The intended categories are exactly:
1. All Videos — play circle
2. Stories — film-book/open filmstrip
3. Documentaries — vintage movie camera
4. Entertainment — popcorn bucket
5. Music Videos — microphone/music notes
6. Q&A — overlapping speech bubbles
7. Behind the Scenes — director’s chair
8. Events & Highlights — crowd/group
9. Shorts — Shorts-style mark with play triangle
10. Premium Content — diamond

Important: Earlier versions accidentally paired sharp icons with the wrong titles on the homepage and Q&A went missing. Verify icon-to-title mapping visually. V9.5 contains category SVG assets, but the approved visual intent is the locked artwork above; do not invent new icon designs.

# Global navigation / footer
Header navigation:
- Browse -> `/`
- Categories -> proper dark dropdown (not a white native select; must not expand/overlap page layout incorrectly)
- Collections -> `/collections` (currently retained)
- All Videos -> `/category/all-videos`
- About -> `/about`
- Contact -> `/contact`
- Search icon
- outlined lime “Follow on WhatsApp”

Footer:
- Exact locked Mint Media logo.
- Links must be real working links, not `#`.
- Social order/intent: YouTube, Instagram, Vimeo, WhatsApp.
- NO Facebook.
- Social icons must be sharp and visible on the dark background.
- A previous defect was that social icons were missing/invisible; verify this on every page.

# Signup CTA — global consistency
The Homepage newsletter + WhatsApp signup strip is the approved treatment. Other pages should use the SAME component/layout/scale rather than visually different versions.
- Newsletter icon + “Sign up for our newsletter” + copy + “Sign Up” button.
- WhatsApp logo must be visible + “Follow us on WhatsApp” + copy + “Follow Now” button.
- Previous defects: WhatsApp logo missing and signup strip inconsistent between pages.

# Homepage — LOCKED visual direction
Do not redesign the homepage. Key behavior/layout:
- Sticky dark header.
- Hero is cinematic and clickable; no duplicate “Watch Now” / “More Info” buttons.
- Hero must NOT extend wider than the search bar/content container.
- Featured videos use optional `hero_image_url`; fallback is thumbnail.
- Hero arrows/dots cycle featured videos.
- Search bar below hero.
- Popular searches include: Funny, Inspirational, Lessons, Music Video, Under 5 min, Long form, Behind the scenes, Kids, Motivational, Family (current build).
- Category row is ONE row with all 10 categories and locked icons.
- “Just Minted” row of five cards.
- Signup CTA.
- Footer.

Latest known Homepage QA state before V9.5:
- All icons were correct except Q&A was missing/broken.
- Hero sizing had previously been fixed to content width; do not regress it.

# Standard Watch Page — LOCKED
- Large player with a YouTube-like “More videos to watch” side rail, not duplicated underneath.
- No description block.
- No Save button (no login/save system for viewers).
- Share button shares the Mint site watch-page URL, NOT the Vimeo/YouTube source URL.
- No “More” button.
- Exact header/footer/brand treatment.

# Premium behavior
Category name stays **Premium Content**. Do NOT rename the category to Yidly.
Premium videos use:
- `video_url` = promo/trailer
- `purchase_url` = external Mostly Music purchase page
- `premium = true`
- category = Premium Content
Yidly branding is only for the premium viewing/purchase experience. Mostly Music is the purchase destination.
Assets in `public/assets/`: `yidly-logo.png`, `mostly-music-logo.webp`.

# Collections
Collections is currently a curated category landing page. The user specifically asked that it include icons and later noted categories were missing.
It should include **all 10 categories**, unless the user later explicitly changes this decision. Use the same exact icon/category mapping as the homepage. Do not use mismatched icons.

# Category pages
- Category title + locked icon.
- Search within category.
- Video grid and load more.
- Premium stays “Premium Content.”
- Q&A must display exactly `Q&A` with normal spacing. A previous build showed `Qanda` / bad spacing; V9.5 attempted to fix this. Verify it visually.
- Shorts category exists.

The category-page hero artwork concept was not fully locked. User may later supply custom wide header artwork; if so, keep text/icon rendered by the site rather than baking text into the image.

# About page — ABSOLUTELY LOCKED design
Reference image: `reference-designs/about-locked-reference.png`.
Do not improvise a new layout.
Approved content/layout:
- Hero eyebrow: ABOUT MINT MEDIA
- Heading: Stories That Matter
- Copy: “We believe in the power of video to inform, inspire, and create real impact.”
- Cinematic camera/event image on right with the intended feather/blend treatment.
- Stats exactly:
  - Since 2014
  - A Team of 11
  - Annual Events — 50K+ Attendees
  - One Video — 200K+ Views
- Do NOT add Annual Revenue.
- Our Story: “A Passion for Meaningful Video.”
- Director-chair image should be integrated/feathered in the approved location, not moved into a random box or oversized.
- CTA: LET’S CONNECT / “Have a project in mind or just want to say hello?” / Get in Touch.

Latest known QA complaint before V9.5: About page looked enlarged and the picture was in the wrong place. Match the locked reference rather than simply making it smaller.

# Contact page — ABSOLUTELY LOCKED design
Reference image: `reference-designs/contact-locked-reference.png`.
Approved structure:
- Dark cinematic hero.
- Eyebrow CONTACT US
- Heading Let’s Connect
- “WE’D LOVE TO HEAR FROM YOU”
- Director-chair image integrated on the right in the approved hero treatment. Do not crop it into a strange narrow strip or make the chair look distorted.
- Contact info exactly:
  - Email: `info@mintmediallc.com`
  - Call: `(732) 813-4222`
  - Website: `mintmediallc.com` / `www.mintmediallc.com`, clickable to `https://mintmediallc.com`
- No Visit/location item.
- Message form: Name, Email, Subject, Message, Send Message.
- Send Message button must use the same site button styling/scale as other CTA buttons.
- Newsletter + WhatsApp signup cards/strip below, consistent with global approved treatment.

Latest known QA complaint before V9.5: chair image looked crazy and Send Message button was inconsistent. Match reference precisely.

# Supabase
Project URL currently used by the user:
`https://qqytekjvhdrdxmogeeln.supabase.co`

DO NOT put the user's real publishable key into this handoff document or commit it. The user already has a working `.env.local` on their Mac. `.env.local.example` is intentionally placeholder-only.

Expected env vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`videos` table fields used over project history:
- id
- title
- slug
- video_url
- platform
- vimeo_hash
- client
- category
- thumbnail_url
- duration_seconds
- featured
- premium
- published
- sort_order
- created_at / updated_at
- purchase_url
- hero_image_url

Storage bucket: `video-thumbnails` (public). Authenticated upload/update/delete policies were set up.
RLS currently allows public read of published videos and authenticated writes. Before production launch, consider tightening writes to the actual admin user/role rather than any authenticated user.

Admin user already exists. Do not create a duplicate admin account.
Admin supports:
- Add video
- Fetch Vimeo/YouTube metadata
- title/client/category/duration/sort order/slug
- thumbnail preview and custom upload
- Featured/Premium/Published toggles
- Existing Videos Edit/Delete
- sign out
- Premium purchase URL
- optional hero image upload/URL

# Known real test content
Unlisted Vimeo test:
`https://vimeo.com/1133932462/84b07ccce0?share=copy&fl=sv&fe=ci`
Vimeo ID: `1133932462`
Hash: `84b07ccce0`
Embed must preserve the `h=84b07ccce0` hash.
Current title seen in DB/site: `CRC BTS Test`.

YouTube test video title:
“Rabbi Joey Haber: What the Chazon Ish Saw in This Boy That No One Else Did”
Category: Stories.

Premium test slug: `premium-test`.

# Search behavior already built
- Homepage search routes to `/category/all-videos?q=...`
- All Videos searches title/client/category.
- Category pages filter category first.
- Special searches include Under 5 min, Long form, Premium/Yidly.
- Header search icon opens/focuses all-video search.
- Popular search chips are clickable.
- Kids was added.

# Local Mac workflow
The user has had several version folders in Downloads. For a new version:
1. Stop the current dev server with Control+C.
2. Unzip the new folder in Downloads.
3. `cd ~/Downloads/<new-folder>`
4. Copy the working env file from an older known-working folder, e.g.:
   `cp ../mint-media-site-v7/.env.local .env.local`
5. `npm install --no-audit --no-fund`
6. `npm run dev`
7. Open `http://localhost:3000`

Important: If `npm run dev` is still running, Terminal commands typed into that process will not execute. Make sure the shell prompt has returned after Control+C.

# Immediate status / next action
V9.5 was created to address the final QA list:
- Contact: chair image, Send Message consistency.
- About: image placement/scale.
- Global: social links/icons visible and sharp.
- Collections: missing categories.
- Q&A: spacing/title.
- Homepage: missing Q&A icon.

**Do not assume these fixes are visually approved.** The user had not yet reviewed V9.5 when this handoff was created. First run V9.5 and compare Homepage, About, Contact, footer, Collections and Q&A against this document/reference images. Fix only discrepancies, then ask for screenshots/approval one screen at a time.

# Production/launch note
Do not launch/deploy merely because the folder says “launch.” Visual QA is still pending. Once the user approves the remaining pages, then perform production/security/deployment checks.
