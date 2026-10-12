-- Customer project page: a private link per job, a message thread, add-on requests,
-- and an "approved" step between the first cut and final delivery.

alter type public.project_status add value if not exists 'approved' after 'first_cut_sent';

alter table public.projects
  add column if not exists customer_token uuid not null default gen_random_uuid();
create unique index if not exists projects_customer_token_idx on public.projects (customer_token);

create table if not exists public.project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  author text not null check (author in ('customer', 'team')),
  member_id uuid references public.team_members (id) on delete set null,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index if not exists project_messages_project_idx on public.project_messages (project_id, created_at);

create table if not exists public.project_addons (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  addon text not null,
  label text not null,
  details text,
  price_cents integer check (price_cents is null or price_cents >= 0),
  status text not null default 'requested' check (status in ('requested', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);
create index if not exists project_addons_project_idx on public.project_addons (project_id, created_at);

-- Team-only, like everything else. Customers reach these through the server with their token.
alter table public.project_messages enable row level security;
alter table public.project_addons enable row level security;

drop policy if exists team_all_messages on public.project_messages;
create policy team_all_messages on public.project_messages for all to authenticated
  using (public.is_team()) with check (public.is_team());
drop policy if exists team_all_addons on public.project_addons;
create policy team_all_addons on public.project_addons for all to authenticated
  using (public.is_team()) with check (public.is_team());
