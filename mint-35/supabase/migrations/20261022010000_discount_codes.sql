-- Discount codes the team creates in Admin → Discounts and clients enter at checkout.
create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code) and char_length(code) between 3 and 40),
  kind text not null check (kind in ('percent', 'amount')),   -- percent: value = % off; amount: value = dollars off the order
  value numeric(10, 2) not null check (value > 0),
  packages text[] not null default '{}',                       -- package names it applies to; empty = every package
  max_uses integer check (max_uses is null or max_uses > 0),
  uses integer not null default 0,
  expires_on date,                                             -- last day it works (Eastern)
  active boolean not null default true,
  note text,
  created_by uuid references public.team_members (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.discount_codes enable row level security;
drop policy if exists team_all_discounts on public.discount_codes;
create policy team_all_discounts on public.discount_codes for all to authenticated
  using (public.is_team()) with check (public.is_team());
grant select, insert, update, delete on public.discount_codes to authenticated, service_role;

-- Uses one redemption if any are left. Returns false when the code is used up.
create or replace function public.claim_discount(p_id uuid) returns boolean
language sql security definer set search_path = public as $$
  with u as (
    update public.discount_codes set uses = uses + 1
    where id = p_id and active and (max_uses is null or uses < max_uses)
    returning 1
  ) select exists (select 1 from u)
$$;
revoke all on function public.claim_discount(uuid) from public, anon, authenticated;
grant execute on function public.claim_discount(uuid) to service_role;
