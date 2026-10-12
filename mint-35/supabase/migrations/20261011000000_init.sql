-- Mint 35 back office: team, projects, files and an activity log.
-- Everything is private to signed-in team members. Customers never read these tables
-- directly; public submissions go through the server with the service role key.

create table public.team_members (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now()
);

create type public.project_status as enum (
  'submitted',      -- new request, needs review
  'quoted',         -- accepted and priced, waiting for the customer's card
  'card_saved',     -- card on file, ready to start
  'in_progress',    -- started (charged), writing the script
  'script_sent',    -- waiting on the customer to approve the script
  'in_production',  -- script approved, 3-business-day clock running
  'first_cut_sent', -- waiting on the customer's revision notes
  'revising',       -- working on the one revision round
  'delivered',
  'declined',
  'cancelled'
);

create sequence public.project_number_seq start 1001;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  number bigint not null unique default nextval('public.project_number_seq'),
  status public.project_status not null default 'submitted',

  -- customer
  name text not null,
  email text not null,
  company text,
  website text,

  -- questionnaire
  promoting text not null,
  audience text,
  key_message text,
  desired_action text,
  must_appear text,
  placements text[] not null default '{}',
  placement_other text,
  orientation text,
  ideal_date date,
  brand_colors text,
  legal_text text,
  restrictions text,
  references_links text,

  -- business
  package text,
  price_cents integer check (price_cents is null or price_cents >= 0),
  assigned_to uuid references public.team_members (id) on delete set null,
  due_date date,
  intake_token uuid not null default gen_random_uuid(),
  files_received boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_status_idx on public.projects (status, created_at desc);

create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  kind text not null check (kind in ('logo', 'brand_image', 'script', 'first_cut', 'final', 'other')),
  path text not null unique,
  name text not null,
  size bigint,
  uploaded_by uuid references public.team_members (id) on delete set null,
  created_at timestamptz not null default now()
);

create index project_files_project_idx on public.project_files (project_id);

create table public.project_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  actor uuid references public.team_members (id) on delete set null,
  type text not null,  -- 'submitted', 'status', 'note', 'price', 'assigned', 'file'
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index project_events_project_idx on public.project_events (project_id, created_at);

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- Access: signed-in team members only.
create function public.is_team() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.team_members where id = auth.uid())
$$;

create function public.is_owner() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.team_members where id = auth.uid() and role = 'owner')
$$;

alter table public.team_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_files enable row level security;
alter table public.project_events enable row level security;

create policy team_read_team on public.team_members for select to authenticated using (public.is_team());
create policy owner_manage_team on public.team_members for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

create policy team_all_projects on public.projects for all to authenticated
  using (public.is_team()) with check (public.is_team());
create policy team_all_files on public.project_files for all to authenticated
  using (public.is_team()) with check (public.is_team());
create policy team_all_events on public.project_events for all to authenticated
  using (public.is_team()) with check (public.is_team());

-- File storage: private bucket, team-only.
insert into storage.buckets (id, name, public, file_size_limit)
values ('project-files', 'project-files', false, 262144000)
on conflict (id) do nothing;

create policy team_read_files on storage.objects for select to authenticated
  using (bucket_id = 'project-files' and public.is_team());
create policy team_write_files on storage.objects for insert to authenticated
  with check (bucket_id = 'project-files' and public.is_team());
create policy team_update_files on storage.objects for update to authenticated
  using (bucket_id = 'project-files' and public.is_team());
create policy team_delete_files on storage.objects for delete to authenticated
  using (bucket_id = 'project-files' and public.is_team());
