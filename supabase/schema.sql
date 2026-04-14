-- ZOE schema (Phase 1 + 2 + 5 + 6)
-- All primary keys are TEXT to match the existing children table.

create extension if not exists "pgcrypto";

do $$ begin
  create type communication_level as enum ('NONVERBAL', 'MINIMALLY_VERBAL', 'VERBAL_WITH_SUPPORT', 'VERBAL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type diagnosis_status as enum ('DIAGNOSED', 'IN_EVALUATION', 'SUSPECTED', 'OTHER');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tag_category as enum ('ANTECEDENT', 'BEHAVIOR', 'CONSEQUENCE', 'LOCATION', 'TIME_CONTEXT', 'PEOPLE_PRESENT', 'MOOD');
exception when duplicate_object then null; end $$;

do $$ begin
  create type team_role as enum ('THERAPIST', 'FAMILY');
exception when duplicate_object then null; end $$;

do $$ begin
  create type invite_status as enum ('PENDING', 'ACCEPTED', 'DECLINED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type mission_status as enum ('ACTIVE', 'COMPLETED', 'EXPIRED');
exception when duplicate_object then null; end $$;

create table if not exists children (
  id text primary key default gen_random_uuid()::text,
  parent_id text not null,
  name text not null,
  date_of_birth date not null,
  photo_url text,
  communication_level communication_level not null,
  diagnosis_status diagnosis_status not null,
  diagnosis_details text,
  current_therapies text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists children_parent_idx on children(parent_id);

create table if not exists clips (
  id text primary key default gen_random_uuid()::text,
  child_id text not null references children(id) on delete cascade,
  uploaded_by_id text not null,
  video_url text not null,
  thumbnail_url text,
  duration_seconds int not null default 0,
  file_size_bytes bigint not null default 0,
  antecedents text[] not null default '{}',
  antecedent_note text,
  behaviors text[] not null default '{}',
  behavior_note text,
  consequences text[] not null default '{}',
  consequence_note text,
  location text,
  time_context text,
  people_present text[] not null default '{}',
  mood_before text,
  parent_interpretation text,
  parent_feeling text,
  recorded_at timestamptz,
  uploaded_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  deleted_at timestamptz
);
create index if not exists clips_child_uploaded_idx on clips(child_id, uploaded_at desc);
create index if not exists clips_child_deleted_idx on clips(child_id, is_deleted);

alter table clips add column if not exists ai_observation text;
alter table clips add column if not exists ai_confidence float;
alter table clips add column if not exists audio_features jsonb;
alter table clips add column if not exists movement_features jsonb;

create table if not exists clip_tags (
  id text primary key default gen_random_uuid()::text,
  clip_id text not null references clips(id) on delete cascade,
  category tag_category not null,
  value text not null,
  created_at timestamptz not null default now()
);
create index if not exists clip_tags_cat_value_idx on clip_tags(category, value);
create index if not exists clip_tags_clip_idx on clip_tags(clip_id);

create table if not exists care_team_members (
  id text primary key default gen_random_uuid()::text,
  child_id text not null references children(id) on delete cascade,
  user_id text,
  email text not null,
  role team_role not null,
  status invite_status not null default 'PENDING',
  invited_at timestamptz not null default now(),
  joined_at timestamptz,
  unique (child_id, email)
);
create index if not exists care_team_child_idx on care_team_members(child_id);
create index if not exists care_team_user_idx on care_team_members(user_id);
create index if not exists care_team_email_idx on care_team_members(lower(email));

create table if not exists annotations (
  id text primary key default gen_random_uuid()::text,
  clip_id text not null references clips(id) on delete cascade,
  author_id text not null,
  author_name text not null,
  author_role team_role not null,
  content text not null,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists annotations_clip_idx on annotations(clip_id, created_at desc);

create table if not exists therapy_schedules (
  id text primary key default gen_random_uuid()::text,
  child_id text not null references children(id) on delete cascade,
  therapy_type text not null,
  day_of_week int not null check (day_of_week between 0 and 6),
  time_of_day text not null,
  provider_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists therapy_schedules_child_idx on therapy_schedules(child_id);

create table if not exists observation_missions (
  id text primary key default gen_random_uuid()::text,
  child_id text not null references children(id) on delete cascade,
  assigned_by_id text not null,
  assigned_by_name text not null,
  prompt text not null,
  status mission_status not null default 'ACTIVE',
  due_date timestamptz,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists missions_child_status_idx on observation_missions(child_id, status);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists children_set_updated_at on children;
create trigger children_set_updated_at
before update on children
for each row execute function set_updated_at();

drop trigger if exists annotations_set_updated_at on annotations;
create trigger annotations_set_updated_at
before update on annotations
for each row execute function set_updated_at();

-- =========================================================
-- Helper: is auth.uid() an active care team member of a child?
-- =========================================================
create or replace function is_care_team_member(_child_id text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from care_team_members m
    where m.child_id = _child_id
      and m.status = 'ACCEPTED'
      and (
        m.user_id = auth.uid()::text
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

create or replace function is_care_team_role(_child_id text, _role team_role)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from care_team_members m
    where m.child_id = _child_id
      and m.status = 'ACCEPTED'
      and m.role = _role
      and (
        m.user_id = auth.uid()::text
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table children enable row level security;
alter table clips enable row level security;
alter table clip_tags enable row level security;
alter table care_team_members enable row level security;
alter table annotations enable row level security;
alter table therapy_schedules enable row level security;
alter table observation_missions enable row level security;

-- ---- children ----
drop policy if exists children_owner on children;
drop policy if exists children_owner_all on children;
drop policy if exists children_team_read on children;

create policy children_owner_all on children
for all
using (parent_id = auth.uid()::text)
with check (parent_id = auth.uid()::text);

create policy children_team_read on children
for select
using (is_care_team_member(id));

-- ---- clips ----
drop policy if exists clips_owner on clips;
drop policy if exists clips_owner_all on clips;
drop policy if exists clips_team_read on clips;

create policy clips_owner_all on clips
for all
using (exists (select 1 from children c where c.id = clips.child_id and c.parent_id = auth.uid()::text))
with check (exists (select 1 from children c where c.id = clips.child_id and c.parent_id = auth.uid()::text));

create policy clips_team_read on clips
for select
using (is_care_team_member(child_id));

-- ---- clip_tags ----
drop policy if exists clip_tags_owner on clip_tags;
drop policy if exists clip_tags_owner_all on clip_tags;
drop policy if exists clip_tags_team_read on clip_tags;

create policy clip_tags_owner_all on clip_tags
for all
using (exists (
  select 1 from clips cl join children c on c.id = cl.child_id
  where cl.id = clip_tags.clip_id and c.parent_id = auth.uid()::text
))
with check (exists (
  select 1 from clips cl join children c on c.id = cl.child_id
  where cl.id = clip_tags.clip_id and c.parent_id = auth.uid()::text
));

create policy clip_tags_team_read on clip_tags
for select
using (exists (
  select 1 from clips cl
  where cl.id = clip_tags.clip_id
    and is_care_team_member(cl.child_id)
));

-- ---- care_team_members ----
drop policy if exists care_team_parent_all on care_team_members;
drop policy if exists care_team_self_read on care_team_members;
drop policy if exists care_team_self_accept on care_team_members;

create policy care_team_parent_all on care_team_members
for all
using (exists (select 1 from children c where c.id = care_team_members.child_id and c.parent_id = auth.uid()::text))
with check (exists (select 1 from children c where c.id = care_team_members.child_id and c.parent_id = auth.uid()::text));

create policy care_team_self_read on care_team_members
for select
using (
  user_id = auth.uid()::text
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create policy care_team_self_accept on care_team_members
for update
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
)
with check (
  user_id = auth.uid()::text
);

-- ---- annotations ----
drop policy if exists annotations_parent_read on annotations;
drop policy if exists annotations_team_read on annotations;
drop policy if exists annotations_team_insert on annotations;
drop policy if exists annotations_author_modify on annotations;

-- Parent reads non-private annotations on their child's clips
create policy annotations_parent_read on annotations
for select
using (
  not is_private
  and exists (
    select 1 from clips cl join children c on c.id = cl.child_id
    where cl.id = annotations.clip_id and c.parent_id = auth.uid()::text
  )
);

-- Care team members read all annotations
create policy annotations_team_read on annotations
for select
using (exists (
  select 1 from clips cl
  where cl.id = annotations.clip_id and is_care_team_member(cl.child_id)
));

-- Therapists can insert annotations; author_id must be self
create policy annotations_team_insert on annotations
for insert
with check (
  author_id = auth.uid()::text
  and exists (
    select 1 from clips cl
    where cl.id = annotations.clip_id and is_care_team_role(cl.child_id, 'THERAPIST'::team_role)
  )
);

-- Authors can update or delete their own annotations
create policy annotations_author_modify on annotations
for all
using (author_id = auth.uid()::text)
with check (author_id = auth.uid()::text);

-- ---- therapy_schedules ----
drop policy if exists therapy_schedules_parent_all on therapy_schedules;
drop policy if exists therapy_schedules_team_read on therapy_schedules;

create policy therapy_schedules_parent_all on therapy_schedules
for all
using (exists (select 1 from children c where c.id = therapy_schedules.child_id and c.parent_id = auth.uid()::text))
with check (exists (select 1 from children c where c.id = therapy_schedules.child_id and c.parent_id = auth.uid()::text));

create policy therapy_schedules_team_read on therapy_schedules
for select
using (is_care_team_member(child_id));

-- ---- observation_missions ----
drop policy if exists missions_parent_read on observation_missions;
drop policy if exists missions_team_read on observation_missions;
drop policy if exists missions_therapist_insert on observation_missions;
drop policy if exists missions_author_modify on observation_missions;
drop policy if exists missions_parent_complete on observation_missions;

-- Parents read missions for their children
create policy missions_parent_read on observation_missions
for select
using (exists (select 1 from children c where c.id = observation_missions.child_id and c.parent_id = auth.uid()::text));

-- Care team reads missions
create policy missions_team_read on observation_missions
for select
using (is_care_team_member(child_id));

-- Therapists on the team can create missions; assigner must be self
create policy missions_therapist_insert on observation_missions
for insert
with check (
  assigned_by_id = auth.uid()::text
  and is_care_team_role(child_id, 'THERAPIST'::team_role)
);

-- Therapist who created a mission can update or delete it
create policy missions_author_modify on observation_missions
for all
using (assigned_by_id = auth.uid()::text)
with check (assigned_by_id = auth.uid()::text);

-- Parent can mark missions complete on their own children's missions
create policy missions_parent_complete on observation_missions
for update
using (exists (select 1 from children c where c.id = observation_missions.child_id and c.parent_id = auth.uid()::text))
with check (exists (select 1 from children c where c.id = observation_missions.child_id and c.parent_id = auth.uid()::text));

-- =========================================================
-- STORAGE: private "clips" bucket
-- Path convention: <auth.uid()>/<uuid>.<ext>
-- (Care team members read videos via signed URLs minted server-side.)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('clips', 'clips', false)
on conflict (id) do nothing;

drop policy if exists "clips upload own" on storage.objects;
create policy "clips upload own" on storage.objects
for insert to authenticated
with check (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "clips read own" on storage.objects;
create policy "clips read own" on storage.objects
for select to authenticated
using (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "clips update own" on storage.objects;
create policy "clips update own" on storage.objects
for update to authenticated
using (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "clips delete own" on storage.objects;
create policy "clips delete own" on storage.objects
for delete to authenticated
using (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);

-- =========================================================
-- RESEARCH KNOWLEDGE BASE (admin-only)
-- =========================================================
create table if not exists research_papers (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  authors text,
  journal text,
  doi text,
  published_date text,
  pdf_storage_path text,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  uploaded_at timestamptz not null default now(),
  approved_at timestamptz
);
create index if not exists research_papers_status_idx on research_papers(status);

create table if not exists research_chunks (
  id text primary key default gen_random_uuid()::text,
  paper_id text not null references research_papers(id) on delete cascade,
  content text not null,
  keywords text[] not null default '{}',
  chunk_index int not null,
  section_type text,
  created_at timestamptz not null default now()
);
create index if not exists research_chunks_paper_idx on research_chunks(paper_id, chunk_index);
create index if not exists research_chunks_keywords_idx on research_chunks using gin(keywords);
create index if not exists chunks_fts on research_chunks using gin(to_tsvector('english', content));

alter table research_papers enable row level security;
alter table research_chunks enable row level security;

drop policy if exists research_papers_admin on research_papers;
create policy research_papers_admin on research_papers
for all
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'shakil.musthafa01@gmail.com')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'shakil.musthafa01@gmail.com');

drop policy if exists research_chunks_admin on research_chunks;
create policy research_chunks_admin on research_chunks
for all
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'shakil.musthafa01@gmail.com')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'shakil.musthafa01@gmail.com');

-- Authenticated users (the app at runtime) can read APPROVED chunks for insights.
drop policy if exists research_chunks_read_approved on research_chunks;
create policy research_chunks_read_approved on research_chunks
for select to authenticated
using (exists (select 1 from research_papers p where p.id = research_chunks.paper_id and p.status = 'APPROVED'));

drop policy if exists research_papers_read_approved on research_papers;
create policy research_papers_read_approved on research_papers
for select to authenticated
using (status = 'APPROVED');

insert into storage.buckets (id, name, public)
values ('research', 'research', false)
on conflict (id) do nothing;

drop policy if exists "research admin all" on storage.objects;
create policy "research admin all" on storage.objects
for all to authenticated
using (
  bucket_id = 'research'
  and lower(coalesce(auth.jwt() ->> 'email', '')) = 'shakil.musthafa01@gmail.com'
)
with check (
  bucket_id = 'research'
  and lower(coalesce(auth.jwt() ->> 'email', '')) = 'shakil.musthafa01@gmail.com'
);
