-- IMPACTIFY Phase 2 - Seed data for local development

begin;

-- Auth users (so you can log in locally)
-- Password for all seeded non-anonymous users: Password123!
insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_anonymous
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@impactify.local',
    crypt('Password123!', gen_salt('bf')),
    now(),
    jsonb_build_object('full_name', 'Impactify Admin'),
    now(),
    now(),
    false
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'organizer1@impactify.local',
    crypt('Password123!', gen_salt('bf')),
    now(),
    jsonb_build_object('full_name', 'Jordan Rivera'),
    now(),
    now(),
    false
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'organizer2@impactify.local',
    crypt('Password123!', gen_salt('bf')),
    now(),
    jsonb_build_object('full_name', 'Casey Nguyen'),
    now(),
    now(),
    false
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'authenticated',
    'authenticated',
    'attendee1@impactify.local',
    crypt('Password123!', gen_salt('bf')),
    now(),
    jsonb_build_object('full_name', 'Avery Patel'),
    now(),
    now(),
    false
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'authenticated',
    'authenticated',
    'attendee2@impactify.local',
    crypt('Password123!', gen_salt('bf')),
    now(),
    jsonb_build_object('full_name', 'Morgan Lee'),
    now(),
    now(),
    false
  ),
  (
    '00000000-0000-0000-0000-00000000aaaa',
    'anonymous',
    'anonymous',
    null,
    null,
    now(),
    '{}'::jsonb,
    now(),
    now(),
    true
  )
on conflict (id) do nothing;

-- Assign roles + make profiles more realistic
update public.profiles set role = 'admin', username = 'impactify_admin', display_name = 'Impactify Admin', bio = 'Keeping the lights on.'
where id = '00000000-0000-0000-0000-000000000001';

update public.profiles set role = 'organizer', username = 'jordan_rivera', bio = 'Community organizer focused on local turnout.', location_city = 'Brooklyn', location_state = 'NY'
where id = '00000000-0000-0000-0000-000000000002';

update public.profiles set role = 'organizer', username = 'casey_nguyen', bio = 'Mutual aid + climate resilience.', location_city = 'Queens', location_state = 'NY'
where id = '00000000-0000-0000-0000-000000000003';

update public.profiles set role = 'attendee', username = 'avery_patel', bio = 'New here — looking for ways to help.', location_city = 'Jersey City', location_state = 'NJ', interests = array['climate','housing']
where id = '00000000-0000-0000-0000-000000000004';

update public.profiles set role = 'attendee', username = 'morgan_lee', bio = 'Policy nerd. Coffee-powered.', location_city = 'Hoboken', location_state = 'NJ', interests = array['democracy','education']
where id = '00000000-0000-0000-0000-000000000005';

-- CAUSES (8)
insert into public.causes (id, slug, title, description, category, cover_image_url)
values
  ('10000000-0000-0000-0000-000000000001','climate-action','Climate Action','Clean energy, resilience, and local climate preparedness.','climate',null),
  ('10000000-0000-0000-0000-000000000002','affordable-housing','Affordable Housing','Zoning, tenant protections, and homelessness prevention.','housing',null),
  ('10000000-0000-0000-0000-000000000003','healthcare-access','Healthcare Access','Coverage, clinics, and public health preparedness.','healthcare',null),
  ('10000000-0000-0000-0000-000000000004','immigration-support','Immigration Support','Legal aid, welcoming policies, and community resources.','immigration',null),
  ('10000000-0000-0000-0000-000000000005','public-education','Public Education','Schools, funding equity, and student supports.','education',null),
  ('10000000-0000-0000-0000-000000000006','civil-rights','Civil Rights','Equal protection, safety, and anti-discrimination.','civil_rights',null),
  ('10000000-0000-0000-0000-000000000007','protect-democracy','Protect Democracy','Voting access, transparency, and fair elections.','democracy',null),
  ('10000000-0000-0000-0000-000000000008','local-economy','Local Economy','Small business, jobs, and cost-of-living policies.','economy',null)
on conflict (id) do nothing;

-- EVENTS (12) — starts_at / ends_at are always derived from now() so data stays “upcoming”.
-- ON CONFLICT DO UPDATE re-applies rolling dates when you re-run seed (DO NOTHING left stale rows).
insert into public.events (
  id, slug, organizer_id, title, description,
  starts_at, ends_at, timezone,
  venue_name, address, city, state, lat, lng,
  is_virtual, virtual_url,
  category, capacity, status, accepts_donations
)
values
  ('20000000-0000-0000-0000-000000000001','park-cleanup-prospect','00000000-0000-0000-0000-000000000002','Prospect Park Cleanup','Join us for a Saturday morning cleanup and community hang.',
   now() + interval '7 days', now() + interval '7 days' + interval '3 hours', 'America/New_York',
   'Prospect Park','95 Prospect Park West','Brooklyn','NY',40.6602047,-73.9689560,
   false,null,'community',60,'published',false),
  ('20000000-0000-0000-0000-000000000002','tenant-rights-101','00000000-0000-0000-0000-000000000002','Tenant Rights 101','Know your rights workshop with local legal aid partners.',
   now() + interval '10 days', now() + interval '10 days' + interval '2 hours', 'America/New_York',
   'Bedford Library','496 Franklin Ave','Brooklyn','NY',40.6796790,-73.9560720,
   false,null,'workshop',120,'published',false),
  ('20000000-0000-0000-0000-000000000003','virtual-phonebank','00000000-0000-0000-0000-000000000003','Virtual Phonebank: Voter Registration','Help neighbors get registered with a guided call script.',
   now() + interval '4 days', now() + interval '4 days' + interval '2 hours', 'America/New_York',
   null,null,'Online','NY',null,null,
   true,'https://meet.example.com/phonebank','voter',200,'published',false),
  ('20000000-0000-0000-0000-000000000004','school-board-forum','00000000-0000-0000-0000-000000000003','School Board Forum Watch Party','Watch and discuss the school board forum with educators and parents.',
   now() + interval '14 days', now() + interval '14 days' + interval '3 hours', 'America/New_York',
   'Community Center','10 Market St','Jersey City','NJ',40.7177540,-74.0431430,
   false,null,'education',80,'published',false),
  ('20000000-0000-0000-0000-000000000005','mutual-aid-fridge','00000000-0000-0000-0000-000000000003','Mutual Aid Fridge Restock','Restock pantry/free fridge — bring shelf-stable items if you can.',
   now() + interval '2 days', now() + interval '2 days' + interval '90 minutes', 'America/New_York',
   'Corner Pantry','200 Newark Ave','Jersey City','NJ',40.7217120,-74.0474900,
   false,null,'mutual_aid',40,'published',false),
  ('20000000-0000-0000-0000-000000000006','climate-policy-hall','00000000-0000-0000-0000-000000000002','Town Hall: Climate Policy','Q&A on state climate policy and local implementation.',
   now() + interval '21 days', now() + interval '21 days' + interval '2 hours', 'America/New_York',
   'City Hall','280 Grove St','Jersey City','NJ',40.7179110,-74.0433920,
   false,null,'policy',150,'published',true),
  ('20000000-0000-0000-0000-000000000007','past-canvass','00000000-0000-0000-0000-000000000002','Neighborhood Canvass (Past)','A past canvass event for timeline testing.',
   now() - interval '12 days', now() - interval '12 days' + interval '3 hours', 'America/New_York',
   'Meet at the fountain','1 Plaza','Brooklyn','NY',40.6920000,-73.9900000,
   false,null,'canvass',null,'completed',false),
  ('20000000-0000-0000-0000-000000000008','virtual-webinar-health','00000000-0000-0000-0000-000000000003','Webinar: Navigating Healthcare Enrollment','Walk-through of enrollment options and local clinic resources.',
   now() + interval '5 days', now() + interval '5 days' + interval '90 minutes', 'America/New_York',
   null,null,'Online','NY',null,null,
   true,'https://meet.example.com/healthcare','healthcare',300,'published',false),
  ('20000000-0000-0000-0000-000000000009','draft-event-example','00000000-0000-0000-0000-000000000002','Draft Event (Organizer Only)','This event stays in draft for RLS testing.',
   now() + interval '30 days', now() + interval '30 days' + interval '2 hours', 'America/New_York',
   'TBD',null,'Brooklyn','NY',null,null,
   false,null,'drafts',50,'draft',false),
  ('20000000-0000-0000-0000-00000000000a','immigration-clinic','00000000-0000-0000-0000-000000000003','Immigration Legal Clinic','Drop-in clinic with volunteer attorneys (appointment recommended).',
   now() + interval '9 days', now() + interval '9 days' + interval '4 hours', 'America/New_York',
   'Legal Aid Office','12 Grove St','Jersey City','NJ',40.7192000,-74.0426000,
   false,null,'clinic',30,'published',false),
  ('20000000-0000-0000-0000-00000000000b','democracy-meetup','00000000-0000-0000-0000-000000000002','Protect Democracy Meetup','Monthly meetup to coordinate voter access work.',
   now() + interval '16 days', now() + interval '16 days' + interval '2 hours', 'America/New_York',
   'Cafe Common','120 Court St','Brooklyn','NY',40.6908000,-73.9920000,
   false,null,'meetup',70,'published',false),
  ('20000000-0000-0000-0000-00000000000c','virtual-fundraiser','00000000-0000-0000-0000-000000000003','Virtual Fundraiser: Community Grants','Support micro-grants for local community projects.',
   now() + interval '18 days', now() + interval '18 days' + interval '2 hours', 'America/New_York',
   null,null,'Online','NY',null,null,
   true,'https://meet.example.com/fundraiser','fundraiser',500,'published',true)
on conflict (id) do update set
  slug = excluded.slug,
  organizer_id = excluded.organizer_id,
  title = excluded.title,
  description = excluded.description,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  timezone = excluded.timezone,
  venue_name = excluded.venue_name,
  address = excluded.address,
  city = excluded.city,
  state = excluded.state,
  lat = excluded.lat,
  lng = excluded.lng,
  is_virtual = excluded.is_virtual,
  virtual_url = excluded.virtual_url,
  category = excluded.category,
  capacity = excluded.capacity,
  status = excluded.status,
  accepts_donations = excluded.accepts_donations,
  deleted_at = null;

-- EVENT ↔ CAUSES links
insert into public.event_causes (event_id, cause_id)
values
  ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000007'),
  ('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000005'),
  ('20000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000008'),
  ('20000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-00000000000a','10000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-00000000000b','10000000-0000-0000-0000-000000000007')
on conflict do nothing;

-- RSVPs (event_attendees)
insert into public.event_attendees (id, event_id, user_id, status)
values
  (gen_random_uuid(),'20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','going'),
  (gen_random_uuid(),'20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000005','interested'),
  (gen_random_uuid(),'20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000004','going'),
  (gen_random_uuid(),'20000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000005','going'),
  (gen_random_uuid(),'20000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000004','waitlist')
on conflict do nothing;

-- ARTICLES (20)
insert into public.articles (
  id, slug, title, dek, body_md,
  source_name, source_url, author_name,
  cover_image_url, published_at, is_editorial
)
values
  ('30000000-0000-0000-0000-000000000001','city-climate-budget','City Announces Climate Resilience Budget','A look at what the new funding covers.','## What happened\nThe city announced a new budget package...\n\n## Why it matters\nCommunities face increasing flood risk...',
   'Metro Desk','https://news.example.com/climate-budget','Sam Taylor',null, now() - interval '3 days', false),
  ('30000000-0000-0000-0000-000000000002','tenant-bill-hearing','Tenant Protection Bill Advances to Hearing','Committee schedules a public hearing for next week.','The tenant protection bill advanced...\n\nKey provisions include...',
   'Civic Wire','https://news.example.com/tenant-hearing','Riley Chen',null, now() - interval '5 days', false),
  ('30000000-0000-0000-0000-000000000003','health-clinic-expansion','New Clinics Expand Weekend Hours','Public health clinics will expand hours across the region.','Officials said the new hours will...\n\nPatients can expect...',
   'Health Beat','https://news.example.com/clinic-hours','Dana Brooks',null, now() - interval '6 days', false),
  ('30000000-0000-0000-0000-000000000004','voting-access-update','State Updates Voting Access Rules','Changes aim to reduce lines and improve accessibility.','The updated rules include...\n\nAdvocates responded...',
   'Statehouse News','https://news.example.com/voting-rules','Alex Kim',null, now() - interval '8 days', false),
  ('30000000-0000-0000-0000-000000000005','education-funding-gap','Report Highlights Education Funding Gaps','A new report details disparities across districts.','The report finds...\n\nRecommendations include...',
   'Education Watch','https://news.example.com/funding-gaps','Jamie Soto',null, now() - interval '9 days', false),
  ('30000000-0000-0000-0000-000000000006','immigration-clinic-guide','How to Find Free Immigration Legal Help','Resources for navigating clinics, nonprofits, and hotlines.','If you need help...\n\nStart with...',
   'Community Guide','https://news.example.com/legal-help','Priya Nair',null, now() - interval '10 days', true),
  ('30000000-0000-0000-0000-000000000007','small-business-rents','Small Businesses Brace for Rent Increases','Commercial rents rise in key corridors.','Business owners say...\n\nPolicy proposals...',
   'Local Economy','https://news.example.com/rent-increases','Taylor Reed',null, now() - interval '11 days', false),
  ('30000000-0000-0000-0000-000000000008','civil-rights-cases','Civil Rights Cases to Watch This Term','Several cases could shape protections nationwide.','Legal experts point to...\n\nPotential outcomes...',
   'Courts Brief','https://news.example.com/cases','Noah James',null, now() - interval '12 days', true),
  ('30000000-0000-0000-0000-000000000009','climate-grid-upgrades','Grid Upgrades Accelerate Renewable Adoption','Utilities outline an accelerated timeline.','Utilities announced...\n\nTimeline...',
   'Energy Today','https://news.example.com/grid','Morgan Hill',null, now() - interval '13 days', false),
  ('30000000-0000-0000-0000-00000000000a','housing-vouchers','Housing Voucher Program Expands','New funding increases voucher availability.','The program expansion...\n\nEligibility...',
   'Housing Desk','https://news.example.com/vouchers','Ari Walker',null, now() - interval '14 days', false),
  ('30000000-0000-0000-0000-00000000000b','democracy-observers','Election Observers Recruit Volunteers','Groups recruit and train new volunteers for oversight.','The recruitment drive...\n\nTraining covers...',
   'Democracy Daily','https://news.example.com/observers','Casey Morgan',null, now() - interval '15 days', false),
  ('30000000-0000-0000-0000-00000000000c','health-insurance-myths','Five Myths About Health Insurance','A primer on common misconceptions.','Myth #1...\n\nMyth #2...',
   'Health Beat','https://news.example.com/myths','Dana Brooks',null, now() - interval '16 days', true),
  ('30000000-0000-0000-0000-00000000000d','education-transport','School Transportation Changes Proposed','New routes and timing proposals draw feedback.','The proposal would...\n\nFamilies say...',
   'Education Watch','https://news.example.com/buses','Jamie Soto',null, now() - interval '18 days', false),
  ('30000000-0000-0000-0000-00000000000e','immigration-hearing','Lawmakers Hold Immigration Hearing','Witnesses testify on processing delays and resources.','At the hearing...\n\nOfficials stated...',
   'Statehouse News','https://news.example.com/immigration-hearing','Alex Kim',null, now() - interval '19 days', false),
  ('30000000-0000-0000-0000-00000000000f','civil-rights-training','Community Groups Host Know-Your-Rights Trainings','New trainings focus on de-escalation and documentation.','The trainings include...\n\nParticipants learn...',
   'Community Guide','https://news.example.com/trainings','Priya Nair',null, now() - interval '20 days', false),
  ('30000000-0000-0000-0000-000000000010','local-economy-grants','Micro-Grant Program Opens Applications','Small grants available for neighborhood projects.','Applications are open...\n\nCriteria include...',
   'Local Economy','https://news.example.com/grants','Taylor Reed',null, now() - interval '21 days', false),
  ('30000000-0000-0000-0000-000000000011','climate-heat-plan','Region Releases Extreme Heat Plan','Cooling centers, outreach, and resilience upgrades.','The plan outlines...\n\nCooling centers...',
   'Metro Desk','https://news.example.com/heat','Sam Taylor',null, now() - interval '22 days', false),
  ('30000000-0000-0000-0000-000000000012','housing-evictions','Eviction Filings Trend Down in Q1','Filings decline but remain above pre-pandemic levels.','New data shows...\n\nAdvocates caution...',
   'Housing Desk','https://news.example.com/evictions','Ari Walker',null, now() - interval '23 days', false),
  ('30000000-0000-0000-0000-000000000013','democracy-misinformation','Researchers Track Misinformation Patterns','A new analysis maps common narratives and channels.','Researchers found...\n\nRecommendations...',
   'Democracy Daily','https://news.example.com/misinfo','Casey Morgan',null, now() - interval '24 days', false),
  ('30000000-0000-0000-0000-000000000014','education-mentorship','Mentorship Program Pairs Students with Volunteers','A new mentorship program launches across schools.','The program will...\n\nVolunteers...',
   'Education Watch','https://news.example.com/mentor','Jamie Soto',null, now() - interval '25 days', false)
on conflict (id) do nothing;

-- Article ↔ causes links
insert into public.article_causes (article_id, cause_id)
values
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000007'),
  ('30000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000005'),
  ('30000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000008'),
  ('30000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000006'),
  ('30000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000014','10000000-0000-0000-0000-000000000005')
on conflict do nothing;

-- AI briefings for a subset
insert into public.ai_briefings (id, article_id, background, key_players, timeline, whats_at_stake, model)
values
  (gen_random_uuid(),'30000000-0000-0000-0000-000000000001','Flood risk is rising and resilience spending has lagged.',
   jsonb_build_array(jsonb_build_object('name','City Council','role','Approves budget'), jsonb_build_object('name','DOT','role','Infrastructure lead')),
   jsonb_build_array(jsonb_build_object('date','-30d','event','Proposal drafted'), jsonb_build_object('date','-3d','event','Budget announced')),
   'Neighborhood safety, insurance costs, and infrastructure reliability.','gpt-4o-mini'),
  (gen_random_uuid(),'30000000-0000-0000-0000-000000000004','Voting rules vary widely and administrative changes have downstream impacts.',
   jsonb_build_array(jsonb_build_object('name','State Board of Elections','role','Implements rules')),
   jsonb_build_array(jsonb_build_object('date','-60d','event','Stakeholder meetings'), jsonb_build_object('date','-8d','event','Rules published')),
   'Access for voters with disabilities and first-time voters.','gpt-4o-mini'),
  (gen_random_uuid(),'30000000-0000-0000-0000-000000000012','Eviction trends reflect policy, courts, and economic stressors.',
   jsonb_build_array(jsonb_build_object('name','Housing Court','role','Case processing')),
   jsonb_build_array(jsonb_build_object('date','-120d','event','New filings report'), jsonb_build_object('date','-23d','event','Q1 data released')),
   'Housing stability and downstream public health outcomes.','gpt-4o-mini')
on conflict (article_id) do nothing;

-- Representatives (8)
insert into public.representatives (id, full_name, role, party, state, district, ocd_id)
values
  ('40000000-0000-0000-0000-000000000001','Renee Castillo','senator','D','NY',null,'ocd-person/ny-renee-castillo'),
  ('40000000-0000-0000-0000-000000000002','Daniel Brooks','senator','R','NJ',null,'ocd-person/nj-daniel-brooks'),
  ('40000000-0000-0000-0000-000000000003','Alina Park','house_rep','D','NY','10','ocd-person/ny-alina-park'),
  ('40000000-0000-0000-0000-000000000004','Chris Davenport','house_rep','R','NJ','8','ocd-person/nj-chris-davenport'),
  ('40000000-0000-0000-0000-000000000005','Maya Singh','governor','D','NY',null,'ocd-person/ny-maya-singh'),
  ('40000000-0000-0000-0000-000000000006','Omar Haddad','state_senator','D','NJ','5','ocd-person/nj-omar-haddad'),
  ('40000000-0000-0000-0000-000000000007','Elena Ruiz','state_rep','R','NY','22','ocd-person/ny-elena-ruiz'),
  ('40000000-0000-0000-0000-000000000008','Harper Jones','mayor',null,'NJ','Jersey City','ocd-person/nj-harper-jones')
on conflict (id) do nothing;

-- Bills (15)
insert into public.bills (id, bill_number, title, summary, congress, status, introduced_at)
values
  ('50000000-0000-0000-0000-000000000001','S.101','Clean Grid Acceleration Act','Incentives for grid modernization and renewable interconnects.','118','in_committee', current_date - 90),
  ('50000000-0000-0000-0000-000000000002','H.R.220','Affordable Housing Supply Act','Support for mixed-income housing and voucher expansion.','118','in_committee', current_date - 75),
  ('50000000-0000-0000-0000-000000000003','S.155','Public Health Preparedness Act','Funding for clinics and emergency response capacity.','118','passed_senate', current_date - 120),
  ('50000000-0000-0000-0000-000000000004','H.R.310','Voting Access Modernization Act','Expanded early voting and accessibility requirements.','118','introduced', current_date - 30),
  ('50000000-0000-0000-0000-000000000005','S.199','Civic Transparency Act','Disclosure and transparency reforms.','118','introduced', current_date - 45),
  ('50000000-0000-0000-0000-000000000006','H.R.145','Community Education Supports Act','After-school programs and teacher retention supports.','118','in_committee', current_date - 60),
  ('50000000-0000-0000-0000-000000000007','S.250','Immigration Legal Access Act','Support for legal aid and processing improvements.','118','introduced', current_date - 20),
  ('50000000-0000-0000-0000-000000000008','H.R.410','Small Business Corridor Relief Act','Targeted relief for small businesses impacted by rent shocks.','118','introduced', current_date - 15),
  ('50000000-0000-0000-0000-000000000009','S.300','Civil Rights Enforcement Modernization','Modernizes enforcement tools and reporting.','118','introduced', current_date - 10),
  ('50000000-0000-0000-0000-00000000000a','H.R.512','Extreme Heat Response Act','Cooling centers, resilience upgrades, and reporting.','118','introduced', current_date - 5),
  ('50000000-0000-0000-0000-00000000000b','S.311','Transit Access Expansion Act','Improves access to transit for underserved areas.','118','introduced', current_date - 95),
  ('50000000-0000-0000-0000-00000000000c','H.R.610','Affordable Childcare Pilot','Pilots childcare supports for working families.','118','introduced', current_date - 33),
  ('50000000-0000-0000-0000-00000000000d','S.420','Data Privacy Baseline','Creates baseline consumer data privacy protections.','118','in_committee', current_date - 110),
  ('50000000-0000-0000-0000-00000000000e','H.R.705','Food Security Infrastructure','Invests in local food distribution infrastructure.','118','introduced', current_date - 40),
  ('50000000-0000-0000-0000-00000000000f','S.500','Civic Participation Grants','Funds nonpartisan civic participation programs.','118','introduced', current_date - 12)
on conflict (id) do nothing;

-- Bill ↔ causes
insert into public.bill_causes (bill_id, cause_id)
values
  ('50000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003'),
  ('50000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000007'),
  ('50000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000005'),
  ('50000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000004'),
  ('50000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000008'),
  ('50000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000006'),
  ('50000000-0000-0000-0000-00000000000a','10000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-00000000000f','10000000-0000-0000-0000-000000000007')
on conflict do nothing;

-- Votes (a handful per bill)
insert into public.rep_votes (id, rep_id, bill_id, position, voted_at)
values
  (gen_random_uuid(),'40000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','yea', now() - interval '80 days'),
  (gen_random_uuid(),'40000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000001','nay', now() - interval '80 days'),
  (gen_random_uuid(),'40000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000002','yea', now() - interval '65 days'),
  (gen_random_uuid(),'40000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000002','nay', now() - interval '65 days'),
  (gen_random_uuid(),'40000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000004','yea', now() - interval '20 days'),
  (gen_random_uuid(),'40000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000004','present', now() - interval '20 days'),
  (gen_random_uuid(),'40000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000006','yea', now() - interval '45 days'),
  (gen_random_uuid(),'40000000-0000-0000-0000-000000000007','50000000-0000-0000-0000-000000000006','nay', now() - interval '45 days'),
  (gen_random_uuid(),'40000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-00000000000a','yea', now() - interval '3 days'),
  (gen_random_uuid(),'40000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-00000000000a','absent', now() - interval '3 days')
on conflict do nothing;

-- Follows (so causes have follower_count via trigger)
insert into public.follows (id, user_id, entity_type, entity_id)
values
  (gen_random_uuid(),'00000000-0000-0000-0000-000000000004','cause','10000000-0000-0000-0000-000000000001'),
  (gen_random_uuid(),'00000000-0000-0000-0000-000000000004','cause','10000000-0000-0000-0000-000000000002'),
  (gen_random_uuid(),'00000000-0000-0000-0000-000000000005','cause','10000000-0000-0000-0000-000000000007'),
  (gen_random_uuid(),'00000000-0000-0000-0000-000000000005','cause','10000000-0000-0000-0000-000000000005')
on conflict do nothing;

-- Saves
insert into public.saves (id, user_id, entity_type, entity_id)
values
  (gen_random_uuid(),'00000000-0000-0000-0000-000000000004','event','20000000-0000-0000-0000-000000000001'),
  (gen_random_uuid(),'00000000-0000-0000-0000-000000000004','article','30000000-0000-0000-0000-000000000001'),
  (gen_random_uuid(),'00000000-0000-0000-0000-000000000005','cause','10000000-0000-0000-0000-000000000007'),
  (gen_random_uuid(),'00000000-0000-0000-0000-000000000005','representative','40000000-0000-0000-0000-000000000001')
on conflict do nothing;

-- Comments (threaded + soft delete example left for app actions)
insert into public.comments (id, user_id, entity_type, entity_id, parent_id, body, created_at)
values
  ('60000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','event','20000000-0000-0000-0000-000000000001',null,'Excited for this! Bringing gloves.', now() - interval '1 day'),
  ('60000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000005','event','20000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','Same — I can bring trash bags too.', now() - interval '23 hours'),
  ('60000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000004','article','30000000-0000-0000-0000-000000000004',null,'Good overview. Would love links to primary sources.', now() - interval '2 days')
on conflict (id) do nothing;

commit;
