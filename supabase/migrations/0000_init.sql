-- Create Custom Types --
do $$ 
begin
    if not exists (select 1 from pg_type where typname = 'alliance') then
        create type public.alliance as enum ('red', 'blue');
    end if;
    if not exists (select 1 from pg_type where typname = 'role') then
        create type public.role as enum ('user', 'scouter', 'admin');
    end if;
    if not exists (select 1 from pg_type where typname = 'perm') then
        create type public.perm as enum ('data.view', 'data.write', 'schedule.view', 'schedule.write', '');
    end if;
end $$;

create table if not exists
  event_list (
    --identifiers--
    event    text     not null,
    alias    text     not null,
    date     date     not null,

    constraint event_list_pkey primary key (event),
    constraint event_list_key  unique (event, alias, date)
  );
comment on table event_list is 'List of scoutable events';

create table if not exists
  event_schedule (
    --identifiers--
    event    text     not null,
    match    integer  not null,
    team     text     not null,
    alliance alliance not null,

    --user info--
    name     text,
    uid      uuid     default auth.uid (),

    constraint event_schedule_pkey primary key (event, match, team),
    constraint event_schedule_key  unique (event, match, team),

    constraint event_schedule_event_fkey foreign key (event) 
      references event_list (event) 
      on update cascade 
      on delete cascade,

    constraint event_schedule_uid_fkey foreign key (uid) 
      references auth.users (id) 
      on update cascade 
      on delete cascade
  );
comment on table event_schedule is 'Match schedule for each scouter';

create table if not exists
  event_data (
    --identifiers--
    event    text     not null,
    match    integer  not null,
    team     text     not null,
    alliance alliance not null,

    --data--
    data_raw jsonb    not null,
    data     jsonb    not null,

    --user info--
    name     text     not null,
    uid      uuid     default auth.uid (),

    constraint event_data_pkey primary key (event, match, team),
    constraint event_data_key  unique (event, match, team),

    constraint event_data_event_fkey foreign key (event, match, team) 
      references event_schedule (event, match, team) 
      on update cascade 
      on delete restrict,

    constraint event_data_uid_fkey foreign key (uid) 
      references auth.users (id) 
      on update cascade 
      on delete cascade
  );
comment on table event_data is 'Match data received from scouters';

create table if not exists
  user_profiles (
    uid      uuid     default auth.uid() not null,
    name     text     default 'user'     not null,
    role     role     default 'user'     not null,

    scouted  integer  default 0          not null,
    missed   integer  default 0          not null,
    accuracy float    default 1          not null,

    constraint user_profiles_pkey primary key (uid),
    constraint user_profiles_uid_fkey foreign key (uid) 
      references auth.users (id) 
      on update cascade 
      on delete cascade
  );
comment on table user_profiles is 'Details about each user';

create table if not exists
  user_roles (
    id          bigserial primary key,
    role        role      not null,
    permission  perm      not null,

    unique (role, permission)
  );
comment on table user_roles is 'Permissions for each role';

-- Auth Hook Function --
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
  declare
    claims jsonb;
    user_role public.role;
  begin
    -- Fetch the user role in the user_profiles table
    select role into user_role from public.user_profiles where uid = (event->>'uid')::uuid;

    claims := event->'claims';

    if user_role is not null then
      claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    else
      claims := jsonb_set(claims, '{user_role}', 'null');
    end if;

    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);

    -- Return the modified or original event
    return event;
  end;
$$;

-- Grant Permissions --
grant usage on schema public to supabase_auth_admin;

grant execute
  on function public.custom_access_token_hook
  to supabase_auth_admin;

revoke execute
  on function public.custom_access_token_hook
  from authenticated, anon, public;

grant all
  on table user_profiles, user_roles
  to supabase_auth_admin;

create or replace function public.authorize(
  requested_permission perm
)
returns boolean as $$
declare
  bind_permissions int;
  user_role public.role;
begin
  -- Fetch user role once and store it to reduce number of calls
  select (auth.jwt() ->> 'user_role')::public.app_role into user_role;

  select count(*)
  into bind_permissions
  from public.role_permissions
  where role_permissions.permission = requested_permission
    and role_permissions.role = user_role;

  return bind_permissions > 0;
end;
$$ language plpgsql stable security definer set search_path = '';

-- Create RLS Policies --
create policy "Allow auth admin to read user profiles" 
  on user_profiles 
  as permissive 
  for SELECT 
  to supabase_auth_admin 
  using (true);

-- Schedule Access Policies --
create policy "Allow authorized delete access" 
  on event_schedule
  for DELETE 
  to authenticated 
  using ( (SELECT authorize('schedule.write')) );

create policy "Allow authorized insert access" 
  on event_schedule
  for INSERT 
  to authenticated 
  using ( (SELECT authorize('schedule.write')) );

create policy "Allow authorized select access" 
  on event_schedule
  for SELECT 
  to authenticated 
  using ( (SELECT authorize('schedule.view')) );

-- Data Access Policies --
create policy "Allow authorized delete access" 
  on event_schedule
  for DELETE
  to authenticated
  using ( (SELECT authorize('data.write')) );

create policy "Allow authorized insert access" 
  on event_schedule
  for INSERT 
  to authenticated 
  using ( (SELECT authorize('data.write')) );

create policy "Allow authorized select access" 
  on event_schedule
  for SELECT
  to authenticated
  using ( (SELECT authorize('data.view')) );

-- Event Access Policies --
create policy "Allow authorized delete access" 
  on event_schedule
  for DELETE
  to authenticated
  using ( (SELECT authorize('data.write')) );

create policy "Allow authorized insert access" 
  on event_schedule
  for INSERT 
  to authenticated 
  using ( (SELECT authorize('data.write')) );

create policy "Allow authorized select access" 
  on event_schedule
  for SELECT
  to public
  using ( true );