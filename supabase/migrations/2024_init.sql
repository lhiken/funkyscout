-- REMEMBER:
-- Supabase Daashboard: Authentication > Hooks
-- or you won't have access to any data!

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
      create type public.perm as enum ('data.view', 'data.write', 'schedule.view', 'schedule.write', 'event.write', 'profiles.view', 'profiles.write', 'picklist.write', 'picklist.view');
   end if;
      if not exists (select 1 from pg_type where typname = 'invite_code') then
      create type public.invite_code as enum ('promote.scouter', 'promote.admin');
   end if;
end $$;

create table if not exists
   user_profiles (
      uid      uuid     default auth.uid() not null,
      name     text     default 'user'     not null,
      role     role     default 'user'     not null,

      scouted  integer  default 0          not null,
      missed   integer  default 0          not null,
      accuracy float    default 1          not null,

      settings jsonb    default '[]'         not null,

      constraint user_profiles_pkey primary key (uid),
      constraint user_profiles_uid_fkey foreign key (uid) 
         references auth.users (id) 
         on update cascade 
         on delete cascade
   );
comment on table user_profiles is 'Details about each user';

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
         references user_profiles (uid) 
         on update cascade 
         on delete cascade
   );
comment on table event_schedule is 'Match schedule for each scouter';

create table if not exists
   event_picklist (
      --identifiers--
      event    text     not null,
      title    text     not null,

      --data--
      picklist jsonb    default '[]' not null,

      --user info--
      uname    text     not null,
      uid      uuid     default auth.uid () not null,

      constraint event_event_pkey primary key (event),

      constraint event_list_event_fkey foreign key (event) 
         references event_list (event) 
         on update cascade 
         on delete cascade,

      constraint event_schedule_uid_fkey foreign key (uid) 
         references user_profiles (uid)
         on update cascade
         on delete cascade
   );
comment on table event_schedule is 'Teams for each event and their pit scouting data';

create table if not exists
   event_match_data (
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
      timestamp timestamp 
         with time zone 
         not null 
         default (now() at time zone 'utc'::text),

      constraint event_match_data_pkey primary key (event, match, team),
      constraint event_match_data_key  unique (event, match, team),

      constraint event_match_data_event_fkey foreign key (event, match, team) 
         references event_schedule (event, match, team) 
         on update cascade 
         on delete restrict,

      constraint event_match_data_uid_fkey foreign key (uid) 
         references user_profiles (uid) 
         on update cascade 
         on delete cascade
   );
comment on table event_match_data is 'Match data received from scouters';

create table if not exists
   event_team_data (
      --identifiers--
      event    text     not null,
      team     text     not null,

      --data--
      data     jsonb    default '[]' not null,

      --data info--
      name     text,
      uid      uuid     default auth.uid (),
      timestamp timestamp 
         with time zone 
         not null 
         default (now() at time zone 'utc'::text),

      constraint event_team_data_pkey primary key (event, team),
      constraint event_team_data_key  unique (event, team),

      constraint event_team_data_event_fkey foreign key (event)
         references event_list (event)
         on update cascade
         on delete cascade,

      constraint event_team_data_uid_fkey foreign key (uid) 
         references user_profiles (uid) 
         on update cascade 
         on delete cascade
   );
comment on table event_match_data is 'Team data and pit scouting data received from scouters';

create table if not exists
   user_roles (
      id          bigserial primary key,
      role        role      not null,
      permission  perm      not null,

      unique (role, permission)
   );
comment on table user_roles is 'Permissions for each role';

create table if not exists
   invite_codes (
      code        text         primary key,
      type        invite_code  not null,
      expiry      timestamp 
         with time zone 
         not null,

      unique (code)
   );
comment on table user_roles is 'Codes that allow self-promotion';

create index if not exists event_match_data_uid_index on event_match_data(uid);
create index if not exists event_schedule_uid_index on event_schedule(uid);
create index if not exists event_team_data_uid_index on event_team_data(uid);
create index if not exists event_team_picklist_uid_index on event_picklist(uid);

create index if not exists ix_event_match_data on event_match_data(event, team, match);
create index if not exists ix_event_team_data on event_team_data(event, team);

-- Auth Hook Function --
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = public, pg_catalog
as $$
declare
   claims jsonb;
   user_role public.role;
begin
   -- Log the start of the function
   raise log 'CATH: Modifying access token %', event;

   -- Fetch the user role from the user_profiles table
   select role into user_role from public.user_profiles where uid = (event->>'user_id')::text::uuid;

   -- Extract claims from the event JSON
   claims := event->'claims';

   -- Add or update the user_role in claims
   if user_role is not null then
      claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
   else
      claims := jsonb_set(claims, '{user_role}', 'null');
      raise log 'CATH: Updated claims with null user_role: %', claims;
   end if;

   -- Update the event JSON with the modified claims
   event := jsonb_set(event, '{claims}', claims);

   -- Return the modified event
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
   select (auth.jwt() ->> 'user_role')::public.role into user_role;

   select count(*)
   into bind_permissions
   from public.user_roles
   where user_roles.permission = requested_permission
      and user_roles.role = user_role;

   return bind_permissions > 0;
end;
$$ language plpgsql stable security definer set search_path = '';

-- Create RLS Policies --
alter table event_match_data enable row level security;
alter table event_team_data  enable row level security;
alter table event_list       enable row level security;
alter table event_schedule   enable row level security;
alter table event_picklist   enable row level security;

alter table user_profiles    enable row level security;
alter table user_roles       enable row level security;
alter table invite_codes     enable row level security;

-- Allow the auth admin role to read all user profiles and users to select/update their own profiles
create policy "Allow access to user profiles"
   on user_profiles
   as permissive
   for select
   to public
   using (
      ((select auth.uid()) = uid) or
      ((select authorize('profiles.view'))) or
      (current_role = 'supabase_auth_admin')
   );

create policy "Allow supabase_auth_admin to DELETE"
   on public.user_profiles
   for DELETE
   using (current_role = 'supabase_auth_admin');

create policy "Allow supabase_auth_admin to SELECT"
   on public.user_roles
   as permissive
   for SELECT
   using (
      (current_role = 'supabase_auth_admin') or 
      authorize('schedule.view')
   );

create policy "Allow supabase_auth_admin to DELETE"
   on public.user_roles
   for DELETE
   using (current_role = 'supabase_auth_admin');

-- Ensure users can only update their own profile
create policy "Enable update for supabase_auth_admin"
   on user_profiles
   as permissive
   for update
   to public
   with check (
      ((select auth.role()) = 'supabase_auth_admin') 
   );

  -- Schedule Access Policies --
create policy "Allow authorized delete access" 
   on event_schedule
   for DELETE 
   to authenticated 
   using (authorize('schedule.write'));

create policy "Allow authorized insert access" 
   on event_schedule
   for INSERT 
   to authenticated 
   with check (authorize('schedule.write'));

create policy "Allow authorized update access" 
   on event_schedule
   for UPDATE 
   to authenticated 
   with check (authorize('schedule.write'));

create policy "Allow authorized select access" 
   on event_schedule
   for SELECT
   to authenticated
   using (authorize('schedule.view'));

  -- Data Access Policies --
create policy "Allow authorized delete access (data)" 
  on event_match_data
  for DELETE
  to authenticated
  using (authorize('data.write'));

create policy "Allow authorized insert access (data)" 
   on event_match_data
   for INSERT 
   to authenticated 
   with check (authorize('data.write'));

create policy "Allow authorized update access (data)" 
  on event_match_data
  for UPDATE
  to authenticated
  using (authorize('data.write'));

create policy "Allow authorized select access (data)" 
   on event_match_data
   for SELECT
   to authenticated 
   using (authorize('data.view'));

create policy "Allow authorized delete access (data)" 
  on event_team_data
  for DELETE
  to authenticated
  using (authorize('data.write'));

create policy "Allow authorized update access (data)" 
  on event_team_data
  for UPDATE
  to authenticated
  using (authorize('data.write'));

create policy "Allow authorized insert access (data)" 
   on event_team_data
   for INSERT 
   to authenticated 
   with check (authorize('data.write'));

create policy "Allow authorized select access (data)" 
   on event_team_data
   for SELECT
   to authenticated 
   using (authorize('data.view'));

  -- Event Access Policies --
create policy "Allow authorized delete access (event)" 
   on event_list
   for DELETE
   to public
   using (authorize('event.write'));

create policy "Allow authorized insert access (event)" 
   on event_list
   for INSERT 
   to public
   with check (authorize('event.write'));

create policy "Allow free select access" 
   on event_list
   for SELECT
   to public
   using (true);

  -- Picklist Access Policies --
create policy "Enable select for users based on uid"
   on event_picklist
   as permissive
   for SELECT
   to public
   using (
      ((select auth.uid()) = uid) or
      authorize('picklist.view')
   );

create policy "Enable update for users based on uid"
   on event_picklist
   as permissive
   for UPDATE
   to public
   with check (
      ((select auth.uid()) = uid) or
      authorize('picklist.write')
   );

create policy "Enable insert for users based on uid"
   on event_picklist
   as permissive
   for INSERT
   to public
   with check (
      ((select auth.uid()) = uid) or
      authorize('picklist.write')
   );

create policy "Enable delete for users based on uid"
   on event_picklist
   as permissive
   for DELETE
   to public
   using (
      ((select auth.uid()) = uid) or
      authorize('picklist.write')
   );

-- Invite code permissions --

create policy "Enable insert for users based on permissions"
   on invite_codes
   as permissive
   for INSERT
   to public
   with check (
      authorize('profiles.write')
   );

-- Populate Permissions Table --
insert into user_roles (role, permission) values ('admin', 'data.view');
insert into user_roles (role, permission) values ('admin', 'data.write');
insert into user_roles (role, permission) values ('admin', 'schedule.view');
insert into user_roles (role, permission) values ('admin', 'schedule.write');
insert into user_roles (role, permission) values ('admin', 'event.write');
insert into user_roles (role, permission) values ('admin', 'profiles.view');
insert into user_roles (role, permission) values ('admin', 'profiles.write');
insert into user_roles (role, permission) values ('admin', 'picklist.view');
insert into user_roles (role, permission) values ('admin', 'picklist.write');

insert into user_roles (role, permission) values ('scouter', 'data.view');
insert into user_roles (role, permission) values ('scouter', 'data.write');
insert into user_roles (role, permission) values ('scouter', 'picklist.view');
insert into user_roles (role, permission) values ('scouter', 'schedule.view');

insert into user_roles (role, permission) values ('user', 'data.view');
insert into user_roles (role, permission) values ('user', 'schedule.view');

-- Create User Insert Function --
drop trigger if exists on_auth_user_created on auth.users;

create sequence if not exists user_number_seq;

create or replace function public.handle_new_user () returns trigger as $$
begin
   insert into public.user_profiles (uid, name)
   values (new.id, 'User' || upper(substring(new.id::text from '.{4}$')));
   return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure public.handle_new_user ();