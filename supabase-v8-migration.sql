-- Mint Media Site V8: Premium purchase destination
-- Run this once in Supabase SQL Editor before using the V8 premium fields.

alter table public.videos
add column if not exists purchase_url text;

comment on column public.videos.purchase_url is
'External destination where viewers can purchase or access the full premium video.';
