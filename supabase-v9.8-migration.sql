-- V9.8: separate "featured in hero carousel" from "featured on homepage (Just Minted row)".
-- `featured` (existing column) now means "shows in the hero carousel" specifically.
-- `featured_home` is new: it curates which videos appear in the homepage's "Just Minted"
-- row, independent of the hero. Both fall back to the most recent videos if nothing has
-- been marked yet, so nothing changes on the live site until you start checking boxes.
alter table public.videos
add column if not exists featured_home boolean not null default false;
