-- V9.6: per-video control over the "Just Minted" wording shown in the hero.
-- Only relevant for videos marked Featured (i.e. shown in the homepage hero carousel).
alter table public.videos
add column if not exists show_just_minted boolean not null default true;
