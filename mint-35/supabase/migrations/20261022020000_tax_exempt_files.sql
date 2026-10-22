-- Tax-exempt certificates clients can attach at checkout (optional).
alter table public.project_files drop constraint if exists project_files_kind_check;
alter table public.project_files add constraint project_files_kind_check
  check (kind in ('logo', 'brand_image', 'brand_material', 'design_file', 'media', 'reference', 'tax_exempt', 'script', 'first_cut', 'final', 'cutdown', 'extra_format', 'other'));
