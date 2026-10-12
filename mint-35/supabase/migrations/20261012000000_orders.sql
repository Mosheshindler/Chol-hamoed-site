-- Orders: one checkout can include several packages. Each package becomes its own job
-- (a row in projects); jobs from the same checkout share an order_id.
alter table public.projects
  add column if not exists order_id uuid,
  add column if not exists order_item integer,
  add column if not exists order_size integer;

create index if not exists projects_order_idx on public.projects (order_id, order_item);

-- Brand files uploaded once at checkout are linked to every job in the order,
-- so the same storage path can appear on several jobs.
alter table public.project_files drop constraint if exists project_files_path_key;
create unique index if not exists project_files_project_path_idx on public.project_files (project_id, path);
