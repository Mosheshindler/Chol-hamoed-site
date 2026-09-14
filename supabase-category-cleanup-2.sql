-- One more video picked up a non-canonical category tag after the first cleanup (likely
-- added/edited from a browser tab that still had the admin page open from before the
-- category-list fix was deployed). Same fix as before: keep the real category, drop the rest.

-- URI DAVIDI - Od Yoter Tov (Official Video) | Yeshiva Tiferes Yisroel
update public.videos set category = 'Music Videos', categories = ARRAY['Music Videos'] where id = '7afc0e6e-eb68-4311-baa9-5d6572e54e06';
