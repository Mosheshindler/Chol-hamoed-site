-- Intake form v2: one point of contact with a cell phone and alert preference, a latest in-hand date,
-- and the rest of each video's answers (style, story, voice, music, Momentum Pack details) in `brief`.
alter table public.projects
  add column if not exists title text,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone text,
  add column if not exists alert_channel text check (alert_channel in ('sms', 'whatsapp', 'email')),
  add column if not exists latest_date date,
  add column if not exists brief jsonb not null default '{}';

-- New upload kinds: brand materials, open design files, media to use in the video, character references.
alter table public.project_files drop constraint if exists project_files_kind_check;
alter table public.project_files add constraint project_files_kind_check
  check (kind in ('logo', 'brand_image', 'brand_material', 'design_file', 'media', 'reference', 'script', 'first_cut', 'final', 'other'));
