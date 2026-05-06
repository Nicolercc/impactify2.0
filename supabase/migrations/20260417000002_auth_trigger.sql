-- IMPACTIFY Phase 2 - Auth trigger to create profile rows

begin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  candidate text;
  suffix int := 0;
  display text;
begin
  -- Anonymous users: stable guest handle from user id
  if coalesce(new.is_anonymous, false) then
    candidate := 'guest_' || substr(new.id::text, 1, 8);
    display := 'Guest';
  else
    base_username := lower(split_part(coalesce(new.email, ''), '@', 1));
    -- sanitize: allow [a-z0-9_], collapse others to '_', trim
    base_username := regexp_replace(base_username, '[^a-z0-9_]+', '_', 'g');
    base_username := regexp_replace(base_username, '^_+|_+$', '', 'g');
    if base_username = '' then
      base_username := 'user';
    end if;

    candidate := base_username;
    display := coalesce(new.raw_user_meta_data->>'full_name', base_username);
  end if;

  -- Ensure 3-30 chars; shorten if needed (suffix may append later)
  if char_length(candidate) < 3 then
    candidate := rpad(candidate, 3, '0');
  end if;
  if char_length(candidate) > 30 then
    candidate := substr(candidate, 1, 30);
  end if;

  -- Resolve collisions by adding numeric suffixes
  while exists (select 1 from public.profiles p where p.username = candidate) loop
    suffix := suffix + 1;
    candidate := left(base_username, greatest(3, 30 - (1 + char_length(suffix::text)))) || '_' || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (new.id, candidate, display)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

commit;
