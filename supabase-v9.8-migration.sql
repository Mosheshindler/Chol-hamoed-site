-- V9.8: separate "featured in hero carousel" from "featured on homepage (Just Minted row)",
-- with independent "Just Minted" wording control for each context.
-- `featured` (existing column) = shows in the hero carousel.
-- `featured_home` = shows in the homepage's "Just Minted" row, independent of the hero.
-- `show_just_minted` (existing column) = show "JUST MINTED" over this video in the HERO.
-- `show_just_minted_home` (new) = show a "JUST MINTED" badge on this video's homepage
-- thumbnail — independent, so a video featured in both places can have the wording in one
-- but not the other.
-- All fall back to the most recent videos / wording-on if nothing has been curated yet, so
-- nothing changes on the live site until you start checking boxes.
alter table public.videos
add column if not exists featured_home boolean not null default false;

alter table public.videos
add column if not exists show_just_minted_home boolean not null default true;
