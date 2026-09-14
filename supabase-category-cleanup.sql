-- Cleans up 28 videos that had non-canonical category tags (Inspirational, Education,
-- Fundraising Film, Community, Schools & Yeshivos, Jewish Life) left over from before,
-- mixed in alongside their real site categories. This just removes the non-canonical
-- tags -- every video keeps at least one real category, and nothing else about the
-- video (thumbnail, tags, featured status, etc.) is touched.

-- Preparing for the Yomim Nora'im with the cRc: Wait- Honey Needs a Hechsher?!
update public.videos set category = 'Shorts', categories = ARRAY['Shorts'] where id = 'eee7b253-0b4e-45fb-b342-f7bc8ea99be3';

-- cRc The Rosh Hashana Simanim Challenge!
update public.videos set category = 'Shorts', categories = ARRAY['Shorts'] where id = '4a83663d-e91b-4cf4-bc2c-90d2c457802b';

-- cRc Pas Yisroel Bakery
update public.videos set category = 'Shorts', categories = ARRAY['Shorts'] where id = '025a6407-cbd7-4e20-9542-39a9a42369d0';

-- Project Inspire TB 2025 Bounce Back
update public.videos set category = 'Documentaries', categories = ARRAY['Documentaries'] where id = '8ee8cc53-6d0d-47df-b101-a5d99c5efc7e';

-- Project Inspire Tisha B'av 2026 The Unlikely Village
update public.videos set category = 'Documentaries', categories = ARRAY['Documentaries'] where id = 'bbaef11d-7a11-4d5d-bfed-aace30774a29';

-- Project Inspire TB 2025 full Omer Shemtov Interview
update public.videos set category = 'Entertainment', categories = ARRAY['Entertainment', 'Stories'] where id = '948b3ace-a1de-4443-9dae-d01beb6b5ac1';

-- Project Inspire TB 2025 Full Sasha Trufanov Interview
update public.videos set category = 'Stories', categories = ARRAY['Stories'] where id = '94b7d116-6ea5-4ef0-a232-d01531a5388b';

-- Traveling with the cRc: Which Starbucks Drinks are Actually Kosher?
update public.videos set category = 'Shorts', categories = ARRAY['Shorts'] where id = '1eb6a94b-ac1b-43de-afde-e59dfa93ec8d';

-- Traveling with the cRc: Are Dunkin' Drinks Kosher?
update public.videos set category = 'Shorts', categories = ARRAY['Shorts'] where id = '1fd7add9-20bd-4d6f-a02e-dd076ac9cab2';

-- Traveling with the cRc: Is Any Plain Coffee Kosher?
update public.videos set category = 'Shorts', categories = ARRAY['Shorts'] where id = 'dcafb8b6-fd56-48cc-8e73-4892df8e32e4';

-- cRc : Are My Pills Kosher?
update public.videos set category = 'Shorts', categories = ARRAY['Shorts'] where id = '5030de89-6200-4469-9ea4-1782a9a68b50';

-- cRc Summer 2026 BTS
update public.videos set category = 'Behind the Scenes', categories = ARRAY['Behind the Scenes', 'Shorts'] where id = 'f5467cbf-06c0-4563-ad13-eb0ca2c2e7eb';

-- cRc Pas Yisroel Gameshow
update public.videos set category = 'Shorts', categories = ARRAY['Shorts'] where id = '12dd24c5-c5be-4508-bf1f-35a750887d79';

-- Kiddush Hashem in BMG ; A Nod, A Smile, A Masechta
update public.videos set category = 'Stories', categories = ARRAY['Stories'] where id = '50ff66fc-3178-4c2b-b5bd-c4df1a15dba9';

-- Moshe Feder - "You Never Lose By Doing The Right Thing"
update public.videos set category = 'Stories', categories = ARRAY['Stories'] where id = '55fa83d8-3253-4116-94ac-97c20233f56c';

-- LKH 2025 Venikdashti Worldwide Kiddush Hashem Event
update public.videos set category = 'Documentaries', categories = ARRAY['Documentaries', 'Stories'] where id = 'fee84dd5-1548-4abe-8995-eedb3bac46e0';

-- Bonei Olam Tisha Bav 2026- Echoes From The Platform
update public.videos set category = 'Stories', categories = ARRAY['Stories', 'Documentaries'] where id = '1a1b4fd6-79e1-47df-bd9d-c26997197016';

-- Kevodo 2026 Rabbi Spero Story
update public.videos set category = 'Stories', categories = ARRAY['Stories'] where id = '3ed08a98-e70b-4402-802f-0500a9c76718';

-- United Refuah 2026 Binyomin Miller Intructional Videos
update public.videos set category = 'Entertainment', categories = ARRAY['Entertainment'] where id = 'c65cede8-6ac0-4fe6-9985-95bed72f8325';

-- 2026 Ma'amad Adirei HaTorah Feature video
update public.videos set category = 'Stories', categories = ARRAY['Stories', 'Events & Highlights'] where id = '1754a515-aa3b-445f-9bbb-a581df4cca85';

-- “Promises of the Future” - A Bonei Olam Film 2025
update public.videos set category = 'Stories', categories = ARRAY['Stories', 'Documentaries'] where id = '21b81954-be5f-423d-a184-240514a0ad9d';

-- THE NISHMAS DOC (ft. Binyomin Miller) | EPISODE 1
update public.videos set category = 'Documentaries', categories = ARRAY['Documentaries', 'Entertainment'] where id = 'ec9de933-9ba9-4c4d-b1a0-368ca03735de';

-- THE NISHMAS DOC (ft. Binyomin Miller) | EPISODE 2
update public.videos set category = 'Documentaries', categories = ARRAY['Documentaries', 'Entertainment'] where id = 'd67fb22d-a96a-4144-8804-793738a26a73';

-- THE NISHMAS DOC (ft. Binyomin Miller) | EPISODE 3
update public.videos set category = 'Documentaries', categories = ARRAY['Documentaries', 'Entertainment'] where id = '3802a4fd-9493-4ab7-ba5e-0361e1fe56bf';

-- THE NISHMAS DOC (ft. Binyomin Miller) | EPISODE 4
update public.videos set category = 'Entertainment', categories = ARRAY['Entertainment', 'Documentaries'] where id = 'dd4b3de7-c80f-4a51-aeb2-8031f3d11a90';

-- What Happens to a Mother Running on Fumes? | TisHalal: A Project of Vayimaen
update public.videos set category = 'Stories', categories = ARRAY['Stories'] where id = '7c3d702a-b241-4547-86f4-48cc3b1aa062';

-- THE LIGHT IN HIS EYES (Lulei Sorascha) | A Miami Beach Kollel Original | Ft. Simcha Jacoby
update public.videos set category = 'Music Videos', categories = ARRAY['Music Videos'] where id = '21dd2d34-6d67-4903-ae33-f2e6f913b657';

-- Shela-He 2026 Music Video
update public.videos set category = 'Music Videos', categories = ARRAY['Music Videos'] where id = '3b241422-2966-44c3-9f2e-1e0a260162a4';
