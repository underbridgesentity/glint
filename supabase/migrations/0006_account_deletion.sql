-- ───────────────────────────────────────────────────────────────
-- 0006 - In-app account deletion (required by the App Store)
-- Deletes the caller's auth user; FKs cascade to profile, cars, washes, etc.
-- ───────────────────────────────────────────────────────────────
create or replace function delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = uid;  -- cascades through profiles → cars/washes/...
end;
$$;

grant execute on function delete_my_account() to authenticated;
