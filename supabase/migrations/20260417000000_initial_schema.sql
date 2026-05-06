-- IMPACTIFY Phase 2 - Initial schema
-- Principles: UUID PKs, soft deletes, timestamp columns, RLS later (separate migration)

begin;

-- Extensions
create extension if not exists pgcrypto;

-- Utility trigger to keep updated_at current
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- PROFILES (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  bio text,
  avatar_url text,
  role text not null default 'attendee',
  interests text[] not null default '{}'::text[],
  location_city text,
  location_state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint profiles_username_format check (
    char_length(username) between 3 and 30
    and username ~ '^[A-Za-z0-9_]+$'
  ),
  constraint profiles_bio_len check (bio is null or char_length(bio) <= 280),
  constraint profiles_role_enum check (role in ('attendee', 'organizer', 'admin'))
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- CAUSES
create table if not exists public.causes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  category text,
  cover_image_url text,
  follower_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint causes_category_enum check (
    category is null or category in (
      'climate', 'housing', 'healthcare', 'immigration', 'education',
      'civil_rights', 'democracy', 'economy', 'foreign_policy', 'other'
    )
  )
);

create trigger causes_set_updated_at
before update on public.causes
for each row execute function public.set_updated_at();

-- EVENTS
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  organizer_id uuid references public.profiles(id),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'America/New_York',
  venue_name text,
  address text,
  city text,
  state text,
  lat numeric(10,7),
  lng numeric(10,7),
  is_virtual boolean not null default false,
  virtual_url text,
  cover_image_url text,
  category text,
  capacity int,
  attendee_count int not null default 0,
  status text not null default 'draft',
  accepts_donations boolean not null default false,
  stripe_account_id text,
  search_vector tsvector generated always as (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' || coalesce(description, '')
    )
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint events_status_enum check (status in ('draft', 'published', 'cancelled', 'completed'))
);

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

-- EVENT ATTENDEES
create table if not exists public.event_attendees (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'going',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_attendees_status_enum check (status in ('going', 'interested', 'waitlist', 'cancelled')),
  constraint event_attendees_unique unique (event_id, user_id)
);

create trigger event_attendees_set_updated_at
before update on public.event_attendees
for each row execute function public.set_updated_at();

-- EVENT CAUSES (many-to-many)
create table if not exists public.event_causes (
  event_id uuid not null references public.events(id) on delete cascade,
  cause_id uuid not null references public.causes(id) on delete cascade,
  primary key (event_id, cause_id)
);

-- ARTICLES
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  dek text,
  body_md text not null,
  source_name text,
  source_url text,
  author_name text,
  cover_image_url text,
  published_at timestamptz not null,
  is_editorial boolean not null default false,
  search_vector tsvector generated always as (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' || coalesce(dek, '') || ' ' || coalesce(body_md, '')
    )
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger articles_set_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

-- ARTICLE CAUSES (many-to-many)
create table if not exists public.article_causes (
  article_id uuid not null references public.articles(id) on delete cascade,
  cause_id uuid not null references public.causes(id) on delete cascade,
  primary key (article_id, cause_id)
);

-- AI BRIEFINGS
create table if not exists public.ai_briefings (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  background text,
  key_players jsonb,
  timeline jsonb,
  whats_at_stake text,
  generated_at timestamptz not null default now(),
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint ai_briefings_article_unique unique (article_id)
);

create trigger ai_briefings_set_updated_at
before update on public.ai_briefings
for each row execute function public.set_updated_at();

-- ARTICLE FLAGS
create table if not exists public.article_flags (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  flag_type text not null,
  details text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint article_flags_type_enum check (flag_type in ('factual_error', 'missing_context', 'bias', 'other')),
  constraint article_flags_status_enum check (status in ('pending', 'reviewing', 'resolved', 'dismissed'))
);

create trigger article_flags_set_updated_at
before update on public.article_flags
for each row execute function public.set_updated_at();

-- REPRESENTATIVES
create table if not exists public.representatives (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role text,
  party text,
  state text not null,
  district text,
  photo_url text,
  website_url text,
  phone text,
  ocd_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint representatives_role_enum check (
    role is null or role in ('senator', 'house_rep', 'governor', 'state_senator', 'state_rep', 'mayor', 'council')
  )
);

create trigger representatives_set_updated_at
before update on public.representatives
for each row execute function public.set_updated_at();

-- BILLS
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  bill_number text,
  title text not null,
  summary text,
  congress text,
  status text,
  introduced_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger bills_set_updated_at
before update on public.bills
for each row execute function public.set_updated_at();

-- REP VOTES
create table if not exists public.rep_votes (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references public.representatives(id) on delete cascade,
  bill_id uuid not null references public.bills(id) on delete cascade,
  position text not null,
  voted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint rep_votes_position_enum check (position in ('yea', 'nay', 'present', 'absent')),
  constraint rep_votes_unique unique (rep_id, bill_id)
);

create trigger rep_votes_set_updated_at
before update on public.rep_votes
for each row execute function public.set_updated_at();

-- BILL CAUSES (many-to-many)
create table if not exists public.bill_causes (
  bill_id uuid not null references public.bills(id) on delete cascade,
  cause_id uuid not null references public.causes(id) on delete cascade,
  primary key (bill_id, cause_id)
);

-- SAVES (polymorphic)
create table if not exists public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint saves_entity_type_enum check (entity_type in ('event', 'article', 'cause', 'representative')),
  constraint saves_unique unique (user_id, entity_type, entity_id)
);

create trigger saves_set_updated_at
before update on public.saves
for each row execute function public.set_updated_at();

-- FOLLOWS (polymorphic)
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint follows_entity_type_enum check (entity_type in ('cause', 'user', 'representative')),
  constraint follows_unique unique (user_id, entity_type, entity_id)
);

create trigger follows_set_updated_at
before update on public.follows
for each row execute function public.set_updated_at();

-- COMMENTS (polymorphic, threaded)
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  parent_id uuid references public.comments(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint comments_entity_type_enum check (entity_type in ('event', 'article', 'cause'))
);

create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

-- NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text,
  title text,
  body text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger notifications_set_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

-- INDEXES (performance)
create index if not exists idx_events_organizer_id on public.events (organizer_id);
create index if not exists idx_events_starts_at on public.events (starts_at);
create index if not exists idx_events_city_state on public.events (city, state);
create index if not exists idx_events_search_vector on public.events using gin (search_vector);

create index if not exists idx_event_attendees_event_id on public.event_attendees (event_id);
create index if not exists idx_event_attendees_user_id on public.event_attendees (user_id);

create index if not exists idx_event_causes_event_id on public.event_causes (event_id);
create index if not exists idx_event_causes_cause_id on public.event_causes (cause_id);

create index if not exists idx_articles_published_at_desc on public.articles (published_at desc);
create index if not exists idx_articles_search_vector on public.articles using gin (search_vector);

create index if not exists idx_article_causes_article_id on public.article_causes (article_id);
create index if not exists idx_article_causes_cause_id on public.article_causes (cause_id);

create index if not exists idx_ai_briefings_article_id on public.ai_briefings (article_id);

create index if not exists idx_article_flags_article_id on public.article_flags (article_id);
create index if not exists idx_article_flags_user_id on public.article_flags (user_id);

create index if not exists idx_rep_votes_rep_id on public.rep_votes (rep_id);
create index if not exists idx_rep_votes_bill_id on public.rep_votes (bill_id);

create index if not exists idx_bill_causes_bill_id on public.bill_causes (bill_id);
create index if not exists idx_bill_causes_cause_id on public.bill_causes (cause_id);

create index if not exists idx_saves_user_entity on public.saves (user_id, entity_type);
create index if not exists idx_follows_user_entity on public.follows (user_id, entity_type);

create index if not exists idx_comments_user_id on public.comments (user_id);
create index if not exists idx_comments_parent_id on public.comments (parent_id);

create index if not exists idx_notifications_user_id on public.notifications (user_id);

-- Counter-cache triggers
create or replace function public.recalc_event_attendee_count(p_event_id uuid)
returns void
language sql
as $$
  update public.events e
  set attendee_count = (
    select count(*)
    from public.event_attendees ea
    where ea.event_id = p_event_id
      and ea.status = 'going'
  )
  where e.id = p_event_id;
$$;

create or replace function public.tg_event_attendees_recalc_count()
returns trigger
language plpgsql
as $$
declare
  v_event_id uuid;
begin
  v_event_id := coalesce(new.event_id, old.event_id);
  perform public.recalc_event_attendee_count(v_event_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists event_attendees_recalc_count on public.event_attendees;
create trigger event_attendees_recalc_count
after insert or update or delete on public.event_attendees
for each row execute function public.tg_event_attendees_recalc_count();

create or replace function public.recalc_cause_follower_count(p_cause_id uuid)
returns void
language sql
as $$
  update public.causes c
  set follower_count = (
    select count(*)
    from public.follows f
    where f.entity_type = 'cause'
      and f.entity_id = p_cause_id
      and f.deleted_at is null
  )
  where c.id = p_cause_id;
$$;

create or replace function public.tg_follows_recalc_cause_count()
returns trigger
language plpgsql
as $$
declare
  v_cause_id uuid;
begin
  if coalesce(new.entity_type, old.entity_type) <> 'cause' then
    return coalesce(new, old);
  end if;

  v_cause_id := (coalesce(new.entity_id, old.entity_id))::uuid;
  perform public.recalc_cause_follower_count(v_cause_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists follows_recalc_cause_count on public.follows;
create trigger follows_recalc_cause_count
after insert or update or delete on public.follows
for each row execute function public.tg_follows_recalc_cause_count();

commit;
