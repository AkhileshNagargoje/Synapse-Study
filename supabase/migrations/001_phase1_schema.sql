create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  label text,
  description text,
  progress_percent integer not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  focus_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  space_id uuid not null references public.spaces(id) on delete cascade,
  name text not null,
  code text,
  description text,
  progress_percent integer not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  space_id uuid not null references public.spaces(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  summary text,
  status text not null default 'active' check (status in ('active', 'archived')),
  progress_percent integer not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  confidence_level text not null default 'medium' check (confidence_level in ('low', 'medium', 'high')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  space_id uuid not null references public.spaces(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  mime_type text not null,
  file_size_bytes bigint,
  upload_level text not null check (upload_level in ('subject', 'topic')),
  upload_status text not null default 'uploaded' check (upload_status in ('uploaded', 'processing', 'processed', 'failed')),
  extracted_text text,
  extracted_summary text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint uploads_topic_required_for_topic_level check (
    (upload_level = 'topic' and topic_id is not null) or
    (upload_level = 'subject')
  )
);

create table if not exists public.study_packs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null unique references public.topics(id) on delete cascade,
  source_upload_ids jsonb not null default '[]'::jsonb,
  pack_body jsonb not null default '{}'::jsonb,
  generation_status text not null default 'draft' check (generation_status in ('draft', 'generating', 'ready', 'failed')),
  model_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  title text,
  mode text not null default 'normal' check (mode in ('normal', 'live_tutor')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null unique references public.topics(id) on delete cascade,
  progress_percent integer not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  confidence_level text not null default 'medium' check (confidence_level in ('low', 'medium', 'high')),
  is_studied boolean not null default false,
  revision_status text not null default 'not_started' check (revision_status in ('not_started', 'needs_revision', 'revised')),
  last_reviewed_at timestamptz,
  last_quiz_score numeric(5,2),
  last_viva_score numeric(5,2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sticky_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  scope_type text not null check (scope_type in ('student', 'space', 'topic')),
  scope_id uuid,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_spaces_user_id on public.spaces(user_id);
create index if not exists idx_subjects_space_id on public.subjects(space_id);
create index if not exists idx_topics_subject_id on public.topics(subject_id);
create index if not exists idx_uploads_topic_id on public.uploads(topic_id);
create index if not exists idx_uploads_subject_id on public.uploads(subject_id);
create index if not exists idx_chat_threads_topic_id on public.chat_threads(topic_id);
create index if not exists idx_chat_messages_thread_id on public.chat_messages(thread_id);
create index if not exists idx_sticky_notes_scope on public.sticky_notes(scope_type, scope_id);

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_spaces_updated_at before update on public.spaces for each row execute function public.set_updated_at();
create trigger set_subjects_updated_at before update on public.subjects for each row execute function public.set_updated_at();
create trigger set_topics_updated_at before update on public.topics for each row execute function public.set_updated_at();
create trigger set_uploads_updated_at before update on public.uploads for each row execute function public.set_updated_at();
create trigger set_study_packs_updated_at before update on public.study_packs for each row execute function public.set_updated_at();
create trigger set_chat_threads_updated_at before update on public.chat_threads for each row execute function public.set_updated_at();
create trigger set_topic_progress_updated_at before update on public.topic_progress for each row execute function public.set_updated_at();
create trigger set_sticky_notes_updated_at before update on public.sticky_notes for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.uploads enable row level security;
alter table public.study_packs enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.topic_progress enable row level security;
alter table public.sticky_notes enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

create policy "spaces_own_all" on public.spaces for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subjects_own_all" on public.subjects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "topics_own_all" on public.topics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "uploads_own_all" on public.uploads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study_packs_own_all" on public.study_packs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "chat_threads_own_all" on public.chat_threads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "chat_messages_own_all" on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "topic_progress_own_all" on public.topic_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sticky_notes_own_all" on public.sticky_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
