-- Scripts (and other deliverables) can be shared as a link (e.g. a Google Doc) or pasted text instead of an uploaded file.
-- Such rows keep a unique placeholder `path` that has no file in storage.
alter table public.project_files add column if not exists url text;
alter table public.project_files add column if not exists body text;
