-- Change comments.user_id FK from CASCADE to SET NULL
-- so deleting a user preserves their comments (anonymized).
-- SELECT policy "comments_select_public_non_deleted" uses (deleted_at is null) only;
-- it remains valid when user_id IS NULL.

begin;

alter table public.comments
  drop constraint if exists comments_user_id_fkey;

alter table public.comments
  alter column user_id drop not null;

alter table public.comments
  add constraint comments_user_id_fkey
  foreign key (user_id) references public.profiles(id)
  on delete set null;

commit;
