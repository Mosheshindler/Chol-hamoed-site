-- V8.4: optional dedicated homepage hero artwork
alter table public.videos
add column if not exists hero_image_url text;
