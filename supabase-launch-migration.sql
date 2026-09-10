alter table public.videos add column if not exists categories text[];
update public.videos
set categories = array[category]
where (categories is null or cardinality(categories)=0) and category is not null;
create index if not exists videos_categories_gin on public.videos using gin(categories);
