-- Extra deliverables shared on their own: the 15-second cutdown and extra video formats.
alter table public.project_files drop constraint if exists project_files_kind_check;
alter table public.project_files add constraint project_files_kind_check
  check (kind in ('logo', 'brand_image', 'brand_material', 'design_file', 'media', 'reference', 'script', 'first_cut', 'final', 'cutdown', 'extra_format', 'other'));
