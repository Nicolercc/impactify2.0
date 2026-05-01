-- IMPACTIFY Phase 2 - RLS policies (default deny)

begin;

-- Helper functions for role checks inside policies
create or replace function public.is_admin(p_uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = p_uid
      and p.deleted_at is null
      and p.role = 'admin'
  );
$$;

create or replace function public.is_organizer_or_admin(p_uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = p_uid
      and p.deleted_at is null
      and p.role in ('organizer', 'admin')
  );
$$;

-- Enable RLS everywhere
alter table public.profiles enable row level security;
alter table public.causes enable row level security;
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;
alter table public.event_causes enable row level security;
alter table public.articles enable row level security;
alter table public.article_causes enable row level security;
alter table public.ai_briefings enable row level security;
alter table public.article_flags enable row level security;
alter table public.representatives enable row level security;
alter table public.bills enable row level security;
alter table public.rep_votes enable row level security;
alter table public.bill_causes enable row level security;
alter table public.saves enable row level security;
alter table public.follows enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;

-- PROFILES
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
on public.profiles
for select
to public
using (deleted_at is null);

-- inserts happen via auth trigger; no insert policy
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to public
using (id = auth.uid() and deleted_at is null)
with check (id = auth.uid());

-- no delete policy (soft delete only)

-- CAUSES
drop policy if exists "causes_select_public" on public.causes;
create policy "causes_select_public"
on public.causes
for select
to public
using (deleted_at is null);

drop policy if exists "causes_admin_insert" on public.causes;
create policy "causes_admin_insert"
on public.causes
for insert
to public
with check (public.is_admin(auth.uid()));

drop policy if exists "causes_admin_update" on public.causes;
create policy "causes_admin_update"
on public.causes
for update
to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "causes_admin_delete" on public.causes;
create policy "causes_admin_delete"
on public.causes
for delete
to public
using (public.is_admin(auth.uid()));

-- EVENTS
drop policy if exists "events_select_published_or_owner_or_admin" on public.events;
create policy "events_select_published_or_owner_or_admin"
on public.events
for select
to public
using (
  deleted_at is null
  and (
    status = 'published'
    or organizer_id = auth.uid()
    or public.is_admin(auth.uid())
  )
);

drop policy if exists "events_insert_organizer_or_admin" on public.events;
create policy "events_insert_organizer_or_admin"
on public.events
for insert
to public
with check (
  auth.uid() is not null
  and public.is_organizer_or_admin(auth.uid())
  and organizer_id = auth.uid()
);

drop policy if exists "events_update_owner_or_admin" on public.events;
create policy "events_update_owner_or_admin"
on public.events
for update
to public
using (deleted_at is null and (organizer_id = auth.uid() or public.is_admin(auth.uid())))
with check (organizer_id = auth.uid() or public.is_admin(auth.uid()));

-- no delete policy (soft delete only)

-- EVENT ATTENDEES
drop policy if exists "event_attendees_select_self_or_public_event" on public.event_attendees;
create policy "event_attendees_select_self_or_public_event"
on public.event_attendees
for select
to public
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.events e
    where e.id = event_id
      and e.deleted_at is null
      and e.status = 'published'
  )
);

drop policy if exists "event_attendees_insert_self" on public.event_attendees;
create policy "event_attendees_insert_self"
on public.event_attendees
for insert
to public
with check (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "event_attendees_update_self" on public.event_attendees;
create policy "event_attendees_update_self"
on public.event_attendees
for update
to public
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "event_attendees_delete_self" on public.event_attendees;
create policy "event_attendees_delete_self"
on public.event_attendees
for delete
to public
using (user_id = auth.uid());

-- EVENT CAUSES (read via events/causes; admin write)
drop policy if exists "event_causes_select_public" on public.event_causes;
create policy "event_causes_select_public"
on public.event_causes
for select
to public
using (true);

drop policy if exists "event_causes_admin_write" on public.event_causes;
create policy "event_causes_admin_write"
on public.event_causes
for all
to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ARTICLES
drop policy if exists "articles_select_public" on public.articles;
create policy "articles_select_public"
on public.articles
for select
to public
using (deleted_at is null);

drop policy if exists "articles_admin_write" on public.articles;
create policy "articles_admin_write"
on public.articles
for all
to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ARTICLE CAUSES
drop policy if exists "article_causes_select_public" on public.article_causes;
create policy "article_causes_select_public"
on public.article_causes
for select
to public
using (true);

drop policy if exists "article_causes_admin_write" on public.article_causes;
create policy "article_causes_admin_write"
on public.article_causes
for all
to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- AI BRIEFINGS
drop policy if exists "ai_briefings_select_public" on public.ai_briefings;
create policy "ai_briefings_select_public"
on public.ai_briefings
for select
to public
using (deleted_at is null);

drop policy if exists "ai_briefings_admin_write" on public.ai_briefings;
create policy "ai_briefings_admin_write"
on public.ai_briefings
for all
to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ARTICLE FLAGS
drop policy if exists "article_flags_select_self_or_admin" on public.article_flags;
create policy "article_flags_select_self_or_admin"
on public.article_flags
for select
to public
using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "article_flags_insert_authed" on public.article_flags;
create policy "article_flags_insert_authed"
on public.article_flags
for insert
to public
with check (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "article_flags_update_admin" on public.article_flags;
create policy "article_flags_update_admin"
on public.article_flags
for update
to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- REPRESENTATIVES / BILLS / REP_VOTES / BILL_CAUSES
drop policy if exists "representatives_select_public" on public.representatives;
create policy "representatives_select_public"
on public.representatives
for select
to public
using (deleted_at is null);

drop policy if exists "representatives_admin_write" on public.representatives;
create policy "representatives_admin_write"
on public.representatives
for all
to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "bills_select_public" on public.bills;
create policy "bills_select_public"
on public.bills
for select
to public
using (deleted_at is null);

drop policy if exists "bills_admin_write" on public.bills;
create policy "bills_admin_write"
on public.bills
for all
to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "rep_votes_select_public" on public.rep_votes;
create policy "rep_votes_select_public"
on public.rep_votes
for select
to public
using (deleted_at is null);

drop policy if exists "rep_votes_admin_write" on public.rep_votes;
create policy "rep_votes_admin_write"
on public.rep_votes
for all
to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "bill_causes_select_public" on public.bill_causes;
create policy "bill_causes_select_public"
on public.bill_causes
for select
to public
using (true);

drop policy if exists "bill_causes_admin_write" on public.bill_causes;
create policy "bill_causes_admin_write"
on public.bill_causes
for all
to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- SAVES
drop policy if exists "saves_select_own" on public.saves;
create policy "saves_select_own"
on public.saves
for select
to public
using (user_id = auth.uid() and deleted_at is null);

drop policy if exists "saves_insert_own" on public.saves;
create policy "saves_insert_own"
on public.saves
for insert
to public
with check (user_id = auth.uid());

drop policy if exists "saves_update_own" on public.saves;
create policy "saves_update_own"
on public.saves
for update
to public
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "saves_delete_own" on public.saves;
create policy "saves_delete_own"
on public.saves
for delete
to public
using (user_id = auth.uid());

-- FOLLOWS
drop policy if exists "follows_select_own" on public.follows;
create policy "follows_select_own"
on public.follows
for select
to public
using (user_id = auth.uid() and deleted_at is null);

drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own"
on public.follows
for insert
to public
with check (user_id = auth.uid());

drop policy if exists "follows_update_own" on public.follows;
create policy "follows_update_own"
on public.follows
for update
to public
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own"
on public.follows
for delete
to public
using (user_id = auth.uid());

-- COMMENTS
drop policy if exists "comments_select_public_non_deleted" on public.comments;
create policy "comments_select_public_non_deleted"
on public.comments
for select
to public
using (deleted_at is null);

drop policy if exists "comments_insert_authed" on public.comments;
create policy "comments_insert_authed"
on public.comments
for insert
to public
with check (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "comments_update_owner_15_min" on public.comments;
create policy "comments_update_owner_15_min"
on public.comments
for update
to public
using (
  deleted_at is null
  and user_id = auth.uid()
  and created_at > now() - interval '15 minutes'
)
with check (user_id = auth.uid());

drop policy if exists "comments_soft_delete_owner_or_admin" on public.comments;
create policy "comments_soft_delete_owner_or_admin"
on public.comments
for update
to public
using (deleted_at is null and (user_id = auth.uid() or public.is_admin(auth.uid())))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "comments_delete_owner_or_admin" on public.comments;
create policy "comments_delete_owner_or_admin"
on public.comments
for delete
to public
using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- NOTIFICATIONS
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications
for select
to public
using (deleted_at is null and user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
to public
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "notifications_insert_service_role" on public.notifications;
create policy "notifications_insert_service_role"
on public.notifications
for insert
to public
with check (auth.role() = 'service_role');

commit;
