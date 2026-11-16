-- UPS Digital AI Director: minimal Supabase starter schema.
-- Apply to a NEW/STAGING Supabase project first. Review before production.
-- Never put service_role keys in browser code. This schema does not create privileged admin roles.

create extension if not exists pgcrypto;

create table if not exists public.creator_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  profile_id text not null,
  format text not null,
  language text not null default 'Hindi',
  brief text not null default '',
  prompt text not null default '',
  prompt_type text not null default 'video' check (prompt_type in ('video','image','editing','audio')),
  status text not null default 'DRAFT' check (status in ('DRAFT','VALIDATED','APPROVED','SUPERSEDED','REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.creator_projects(id) on delete cascade,
  asset_name text not null,
  asset_type text not null,
  storage_path text,
  mime_type text,
  file_size bigint check (file_size is null or file_size >= 0),
  rights_note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.creator_audit_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.creator_projects(id) on delete set null,
  event_type text not null check (char_length(event_type) between 1 and 80),
  stage text,
  error_code text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists creator_projects_owner_updated_idx on public.creator_projects(owner_id, updated_at desc);
create index if not exists creator_assets_owner_project_idx on public.creator_assets(owner_id, project_id);
create index if not exists creator_audit_owner_created_idx on public.creator_audit_events(owner_id, created_at desc);

-- Keep updated_at accurate for project edits.
create or replace function public.ups_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists creator_projects_set_updated_at on public.creator_projects;
create trigger creator_projects_set_updated_at
before update on public.creator_projects
for each row execute function public.ups_set_updated_at();

alter table public.creator_projects enable row level security;
alter table public.creator_assets enable row level security;
alter table public.creator_audit_events enable row level security;

-- Users can access only rows whose owner_id matches their authenticated UID.
drop policy if exists "owner manages own projects" on public.creator_projects;
create policy "owner manages own projects" on public.creator_projects
  for all to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "owner manages own assets" on public.creator_assets;
create policy "owner manages own assets" on public.creator_assets
  for all to authenticated
  using (auth.uid() = owner_id)
  with check (
    auth.uid() = owner_id and
    exists (select 1 from public.creator_projects p where p.id = project_id and p.owner_id = auth.uid())
  );

drop policy if exists "owner reads own audit events" on public.creator_audit_events;
create policy "owner reads own audit events" on public.creator_audit_events
  for select to authenticated using (auth.uid() = owner_id);

drop policy if exists "owner inserts own audit events" on public.creator_audit_events;
create policy "owner inserts own audit events" on public.creator_audit_events
  for insert to authenticated with check (
    auth.uid() = owner_id and
    (project_id is null or exists (
      select 1 from public.creator_projects p
      where p.id = project_id and p.owner_id = auth.uid()
    ))
  );

-- No client-side update/delete policy for audit events: treat them as append-only.
-- Storage bucket policies are intentionally not included; configure a PRIVATE bucket
-- and write owner/project-scoped object policies after deciding the exact bucket name.

-- Explicitly revoke direct table access from anonymous users; authenticated access
-- is still constrained by the RLS policies above.
revoke all on public.creator_projects, public.creator_assets, public.creator_audit_events from anon;
grant select, insert, update, delete on public.creator_projects to authenticated;
grant select, insert, update, delete on public.creator_assets to authenticated;
grant select, insert on public.creator_audit_events to authenticated;

-- IMPORTANT:
-- 1) Apply only to a NEW/STAGING Supabase project after reviewing existing objects.
-- 2) Configure a PRIVATE Storage bucket and owner/project-scoped Storage policies separately.
-- 3) Keep service_role and provider API keys server-side; never put them in browser JS.
-- 4) RLS policy tests with two separate users are required before production.
