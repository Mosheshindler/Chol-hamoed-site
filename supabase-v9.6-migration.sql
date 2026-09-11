-- V9.6: site-wide settings (single row) for simple on/off toggles from the admin panel.
create table if not exists public.site_settings (
  id boolean primary key default true,
  show_just_minted boolean not null default true,
  constraint site_settings_single_row check (id)
);

insert into public.site_settings (id, show_just_minted)
values (true, true)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

create policy "Authenticated can update site settings"
  on public.site_settings for update
  using (auth.role() = 'authenticated');
