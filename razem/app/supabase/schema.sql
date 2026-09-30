-- Razem backend (Supabase / Postgres).
-- Run this whole file once in Supabase → SQL Editor → New query → Run.
-- Then run the "create agency" line at the bottom with your own agency name, e-mail and password.
--
-- Security model: tables are closed to the public (RLS on, no policies). The app and the agency page
-- only call the functions below (Supabase RPC) with the public "anon" key; every function checks a
-- session token (agency) or a device token (traveller) before touching data.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- ---------- tables ----------
create table if not exists agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  pw_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists agency_sessions (
  token_hash text primary key,
  agency_id uuid not null references agencies(id) on delete cascade,
  expires_at timestamptz not null
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  code text not null unique,
  traveller text not null default '',
  lang text not null default 'pl',
  trip jsonb not null default '{}'::jsonb,       -- flight, hotel, transfer, assistant, leader, days[]
  valid_until date not null,
  revoked boolean not null default false,
  max_devices int not null default 6,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists devices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  device_id text not null,
  token_hash text not null unique,
  label text not null default '',
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  unique (booking_id, device_id)
);

create table if not exists messages (
  id bigserial primary key,
  booking_id uuid not null references bookings(id) on delete cascade,
  sender text not null check (sender in ('traveller', 'agency')),
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_by_agency boolean not null default false
);
create index if not exists messages_booking_idx on messages (booking_id, id);

alter table agencies enable row level security;
alter table agency_sessions enable row level security;
alter table bookings enable row level security;
alter table devices enable row level security;
alter table messages enable row level security;

-- ---------- helpers (not callable from the app) ----------
create or replace function razem_hash(p text) returns text
language sql immutable set search_path = public, extensions
as $$ select encode(digest(p, 'sha256'), 'hex') $$;

create or replace function razem_token() returns text
language sql volatile set search_path = public, extensions
as $$ select encode(gen_random_bytes(24), 'hex') $$;

create or replace function razem_new_code() returns text
language plpgsql volatile set search_path = public, extensions
as $$
declare a text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; b bytea; c text; i int;
begin
  loop
    b := gen_random_bytes(8); c := 'RZM-';
    for i in 0..7 loop
      if i = 4 then c := c || '-'; end if;
      c := c || substr(a, (get_byte(b, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from bookings where code = c);
  end loop;
  return c;
end $$;

create or replace function razem_agency(p_token text) returns uuid
language sql stable security definer set search_path = public, extensions
as $$ select agency_id from agency_sessions where token_hash = razem_hash(coalesce(p_token, '')) and expires_at > now() $$;

create or replace function razem_booking_json(b bookings) returns jsonb
language sql stable set search_path = public, extensions
as $$ select jsonb_build_object('id', b.id, 'code', b.code, 'traveller', b.traveller, 'lang', b.lang, 'trip', b.trip,
  'valid_until', b.valid_until, 'revoked', b.revoked, 'max_devices', b.max_devices,
  'agency', (select name from agencies where id = b.agency_id), 'updated_at', b.updated_at) $$;

-- Admin only (SQL editor): create an agency account.
create or replace function razem_create_agency(p_name text, p_email text, p_password text) returns uuid
language sql volatile set search_path = public, extensions
as $$ insert into agencies (name, email, pw_hash) values (p_name, lower(p_email), crypt(p_password, gen_salt('bf')))
      on conflict (email) do update set name = excluded.name, pw_hash = excluded.pw_hash returning id $$;

-- ---------- agency API ----------
create or replace function agency_login(p_email text, p_password text) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare ag agencies; t text;
begin
  select * into ag from agencies where email = lower(trim(p_email));
  if ag.id is null or ag.pw_hash <> crypt(p_password, ag.pw_hash) then
    perform pg_sleep(0.5);
    return jsonb_build_object('ok', false, 'error', 'login');
  end if;
  delete from agency_sessions where expires_at < now();
  t := razem_token();
  insert into agency_sessions values (razem_hash(t), ag.id, now() + interval '30 days');
  return jsonb_build_object('ok', true, 'token', t, 'agency', jsonb_build_object('name', ag.name, 'email', ag.email));
end $$;

create or replace function agency_logout(p_token text) returns jsonb
language sql volatile security definer set search_path = public, extensions
as $$ delete from agency_sessions where token_hash = razem_hash(coalesce(p_token, '')); select jsonb_build_object('ok', true) $$;

create or replace function agency_change_password(p_token text, p_old text, p_new text) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare aid uuid := razem_agency(p_token); ag agencies;
begin
  if aid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  select * into ag from agencies where id = aid;
  if ag.pw_hash <> crypt(p_old, ag.pw_hash) then return jsonb_build_object('ok', false, 'error', 'login'); end if;
  if length(p_new) < 10 then return jsonb_build_object('ok', false, 'error', 'weak'); end if;
  update agencies set pw_hash = crypt(p_new, gen_salt('bf')) where id = aid;
  return jsonb_build_object('ok', true);
end $$;

create or replace function agency_bookings(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions
as $$
declare aid uuid := razem_agency(p_token);
begin
  if aid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  return jsonb_build_object('ok', true, 'bookings', coalesce((
    select jsonb_agg(razem_booking_json(b) || jsonb_build_object(
      'devices', (select count(*) from devices d where d.booking_id = b.id),
      'unread', (select count(*) from messages m where m.booking_id = b.id and m.sender = 'traveller' and not m.read_by_agency),
      'last_msg', (select max(created_at) from messages m where m.booking_id = b.id))
      order by b.valid_until desc, b.created_at desc)
    from bookings b where b.agency_id = aid), '[]'::jsonb));
end $$;

create or replace function agency_booking_save(p_token text, p_booking jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare aid uuid := razem_agency(p_token); b bookings;
begin
  if aid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  if coalesce(p_booking->>'valid_until', '') = '' then return jsonb_build_object('ok', false, 'error', 'valid_until'); end if;
  if coalesce(p_booking->>'id', '') = '' then
    insert into bookings (agency_id, code, traveller, lang, trip, valid_until, max_devices)
    values (aid, razem_new_code(), coalesce(p_booking->>'traveller', ''), coalesce(p_booking->>'lang', 'pl'),
            coalesce(p_booking->'trip', '{}'::jsonb), (p_booking->>'valid_until')::date,
            least(greatest(coalesce((p_booking->>'max_devices')::int, 6), 1), 6))
    returning * into b;
  else
    update bookings set traveller = coalesce(p_booking->>'traveller', traveller), lang = coalesce(p_booking->>'lang', lang),
      trip = coalesce(p_booking->'trip', trip), valid_until = (p_booking->>'valid_until')::date,
      max_devices = least(greatest(coalesce((p_booking->>'max_devices')::int, max_devices), 1), 6), updated_at = now()
    where id = (p_booking->>'id')::uuid and agency_id = aid returning * into b;
    if b.id is null then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  end if;
  return jsonb_build_object('ok', true, 'booking', razem_booking_json(b));
end $$;

create or replace function agency_booking_revoke(p_token text, p_id uuid, p_revoked boolean) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare aid uuid := razem_agency(p_token);
begin
  if aid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  update bookings set revoked = p_revoked, updated_at = now() where id = p_id and agency_id = aid;
  return jsonb_build_object('ok', found);
end $$;

create or replace function agency_devices(p_token text, p_booking uuid) returns jsonb
language plpgsql stable security definer set search_path = public, extensions
as $$
declare aid uuid := razem_agency(p_token);
begin
  if aid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  return jsonb_build_object('ok', true, 'devices', coalesce((select jsonb_agg(jsonb_build_object('id', d.id, 'label', d.label,
    'created_at', d.created_at, 'last_seen', d.last_seen) order by d.created_at)
    from devices d join bookings b on b.id = d.booking_id where b.id = p_booking and b.agency_id = aid), '[]'::jsonb));
end $$;

create or replace function agency_device_remove(p_token text, p_device uuid) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare aid uuid := razem_agency(p_token);
begin
  if aid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  delete from devices d using bookings b where d.id = p_device and b.id = d.booking_id and b.agency_id = aid;
  return jsonb_build_object('ok', found);
end $$;

create or replace function agency_messages(p_token text, p_booking uuid, p_after bigint) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare aid uuid := razem_agency(p_token);
begin
  if aid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  if not exists (select 1 from bookings where id = p_booking and agency_id = aid) then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  update messages set read_by_agency = true where booking_id = p_booking and sender = 'traveller' and not read_by_agency;
  return jsonb_build_object('ok', true, 'messages', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'from', sender, 'text', body, 'at', created_at) order by id)
    from messages where booking_id = p_booking and id > coalesce(p_after, 0)), '[]'::jsonb));
end $$;

create or replace function agency_send(p_token text, p_booking uuid, p_body text) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare aid uuid := razem_agency(p_token); mid bigint;
begin
  if aid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  if not exists (select 1 from bookings where id = p_booking and agency_id = aid) then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  insert into messages (booking_id, sender, body) values (p_booking, 'agency', left(trim(p_body), 4000)) returning id into mid;
  return jsonb_build_object('ok', true, 'id', mid);
end $$;

-- ---------- traveller API ----------
-- Checks a device token; returns the booking or an error code (revoked / expired / device_removed).
create or replace function razem_device(p_token text, out b bookings, out err text)
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare d devices;
begin
  select * into d from devices where token_hash = razem_hash(coalesce(p_token, ''));
  if d.id is null then err := 'device_removed'; return; end if;
  select * into b from bookings where id = d.booking_id;
  if b.revoked then err := 'revoked'; return; end if;
  if current_date > b.valid_until then err := 'expired'; return; end if;
  update devices set last_seen = now() where id = d.id;
end $$;

create or replace function trip_activate(p_code text, p_device text, p_label text) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare b bookings; t text; n int;
begin
  select * into b from bookings where code = upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
  if b.id is null then perform pg_sleep(0.4); return jsonb_build_object('ok', false, 'error', 'invalid'); end if;
  if b.revoked then return jsonb_build_object('ok', false, 'error', 'revoked'); end if;
  if current_date > b.valid_until then return jsonb_build_object('ok', false, 'error', 'expired'); end if;
  t := razem_token();
  update devices set token_hash = razem_hash(t), last_seen = now() where booking_id = b.id and device_id = p_device;
  if not found then
    select count(*) into n from devices where booking_id = b.id;
    if n >= b.max_devices then return jsonb_build_object('ok', false, 'error', 'too_many_devices'); end if;
    insert into devices (booking_id, device_id, token_hash, label) values (b.id, p_device, razem_hash(t), left(coalesce(p_label, ''), 120));
  end if;
  return jsonb_build_object('ok', true, 'token', t, 'booking', razem_booking_json(b));
end $$;

create or replace function trip_get(p_token text) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare r record;
begin
  select * into r from razem_device(p_token);
  if r.err is not null then return jsonb_build_object('ok', false, 'error', r.err); end if;
  return jsonb_build_object('ok', true, 'booking', razem_booking_json(r.b));
end $$;

create or replace function trip_messages(p_token text, p_after bigint) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare r record;
begin
  select * into r from razem_device(p_token);
  if r.err is not null then return jsonb_build_object('ok', false, 'error', r.err); end if;
  return jsonb_build_object('ok', true, 'messages', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'from', sender, 'text', body, 'at', created_at) order by id)
    from messages where booking_id = (r.b).id and id > coalesce(p_after, 0)), '[]'::jsonb));
end $$;

create or replace function trip_send(p_token text, p_body text) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare r record; mid bigint;
begin
  select * into r from razem_device(p_token);
  if r.err is not null then return jsonb_build_object('ok', false, 'error', r.err); end if;
  if length(trim(coalesce(p_body, ''))) = 0 then return jsonb_build_object('ok', false, 'error', 'empty'); end if;
  insert into messages (booking_id, sender, body) values ((r.b).id, 'traveller', left(trim(p_body), 4000)) returning id into mid;
  return jsonb_build_object('ok', true, 'id', mid);
end $$;

-- ---------- permissions: only the API functions are public ----------
revoke all on all tables in schema public from anon, authenticated;
revoke execute on all functions in schema public from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke execute on all functions in schema public from anon, authenticated;
  end if;
end $$;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    grant execute on function agency_login(text, text), agency_logout(text), agency_change_password(text, text, text),
      agency_bookings(text), agency_booking_save(text, jsonb), agency_booking_revoke(text, uuid, boolean),
      agency_devices(text, uuid), agency_device_remove(text, uuid), agency_messages(text, uuid, bigint), agency_send(text, uuid, text),
      trip_activate(text, text, text), trip_get(text), trip_messages(text, bigint), trip_send(text, text)
    to anon;
  end if;
end $$;

-- ---------- create your agency account (edit and run) ----------
-- select razem_create_agency('Wakacje z Rzymem', 'biuro@example.pl', 'choose-a-long-password');
