-- Phase 3B: allow event organizers to manage cause links on their own events
-- (Does not modify earlier Phase 2 migration files.)

begin;

create policy "event_causes_insert_organizer_or_admin"
on public.event_causes
for insert
to public
with check (
  public.is_admin(auth.uid())
  or exists (
    select 1
    from public.events e
    where e.id = event_id
      and e.organizer_id = auth.uid()
      and e.deleted_at is null
  )
);

create policy "event_causes_delete_organizer_or_admin"
on public.event_causes
for delete
to public
using (
  public.is_admin(auth.uid())
  or exists (
    select 1
    from public.events e
    where e.id = event_id
      and e.organizer_id = auth.uid()
      and e.deleted_at is null
  )
);

commit;
