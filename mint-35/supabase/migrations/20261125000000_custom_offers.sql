-- Custom offers: a package with its own name, contents and price that the team sends to one client
-- (Admin → Offers). The client orders it through a private link (/start?offer=<token>), once.
create table if not exists public.custom_offers (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,                                 -- the private link; hard to guess
  client_name text not null,
  email text not null,
  company text,
  title text not null check (char_length(title) between 2 and 80),
  items text[] not null default '{}',                         -- what's included, one line each
  videos integer not null default 1 check (videos between 1 and 20),
  price_cents integer not null check (price_cents > 0),
  message text,                                               -- personal note in the email and on the order page
  expires_on date,                                            -- last day the link works (Eastern)
  status text not null default 'open' check (status in ('open', 'ordered', 'withdrawn')),
  order_id uuid,                                              -- set when the client orders
  ordered_at timestamptz,
  emailed_at timestamptz,
  created_by uuid references public.team_members (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.custom_offers enable row level security;
drop policy if exists team_all_offers on public.custom_offers;
create policy team_all_offers on public.custom_offers for all to authenticated
  using (public.is_team()) with check (public.is_team());
grant select, insert, update, delete on public.custom_offers to authenticated, service_role;
