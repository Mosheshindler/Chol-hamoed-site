-- QuickBooks Payments: the company connection (OAuth tokens) and each job's saved card and charge.

-- One row: the connected QuickBooks company. No RLS policies on purpose, so only the
-- server (service role) can read the tokens; team members never see them.
create table if not exists public.qb_connection (
  id integer primary key default 1 check (id = 1),
  environment text not null,
  realm_id text not null,
  access_token text not null,
  refresh_token text not null,
  access_expires_at timestamptz not null,
  refresh_expires_at timestamptz,
  connected_by uuid references public.team_members (id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.qb_connection enable row level security;

alter table public.projects
  add column if not exists qb_customer_id text,
  add column if not exists qb_card_id text,
  add column if not exists card_brand text,
  add column if not exists card_last4 text,
  add column if not exists charge_id text,
  add column if not exists charge_status text,
  add column if not exists charged_cents integer,
  add column if not exists charged_at timestamptz;

alter table public.project_addons
  add column if not exists charge_id text,
  add column if not exists charged_at timestamptz;
