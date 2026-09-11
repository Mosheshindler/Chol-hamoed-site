-- V9.9: independent per-category video ordering for the admin panel.
-- The existing videos.sort_order stays as the single shared order used for "All Videos"
-- and the homepage — untouched by this. This new table lets a video have its OWN position
-- within each category it belongs to (e.g. #1 in "Stories" but #4 in "Behind the Scenes"),
-- while the video's own row (thumbnail, tags, title, etc.) stays the single shared record
-- edited from anywhere, so a change there still applies everywhere it appears.
create table if not exists public.video_category_order (
  video_id uuid not null references public.videos(id) on delete cascade,
  category text not null,
  sort_order integer not null default 0,
  primary key (video_id, category)
);

alter table public.video_category_order enable row level security;

create policy "Public can read video category order"
  on public.video_category_order for select
  using (true);

create policy "Authenticated can manage video category order"
  on public.video_category_order for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- RLS policies alone aren't enough in Postgres — the anon/authenticated roles also need
-- the base table-level grant before RLS is even consulted. This was missing from the
-- original version of this migration, causing "permission denied for table
-- video_category_order" even after the table and policies above were created successfully.
grant select on public.video_category_order to anon, authenticated;
grant insert, update, delete on public.video_category_order to authenticated;
