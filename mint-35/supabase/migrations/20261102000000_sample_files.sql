-- Momentum Pack: the client approves a script, then a sample video. Sample videos are their own file kind.
alter table public.project_files drop constraint if exists project_files_kind_check;
alter table public.project_files add constraint project_files_kind_check
  check (kind in ('logo', 'brand_image', 'brand_material', 'design_file', 'media', 'reference', 'tax_exempt', 'script', 'sample', 'first_cut', 'final', 'cutdown', 'extra_format', 'other'));
