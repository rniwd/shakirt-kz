-- shakirt.kz: бұлттағы жиынтықтар (Конструктор)
-- Supabase → SQL Editor → New query → осы файлды қойып, Run басыңыз (бір рет жеткілікті).

create table if not exists public.sets (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author      text,
  title       text not null check (char_length(title) between 1 and 80),
  subject     text not null default 'other' check (subject in ('math','english','kazakh','other')),
  body        text not null check (char_length(body) <= 20000),
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists sets_public_idx on public.sets (is_public, created_at desc);
create index if not exists sets_owner_idx  on public.sets (owner);

alter table public.sets enable row level security;

-- Оқу: ашық жиынтықтарды кез келген адам, жабықтарын тек иесі көреді
drop policy if exists "sets read" on public.sets;
create policy "sets read" on public.sets for select
  using (is_public or owner = (select auth.uid()));

-- Жазу: тек тіркелген мұғалім, тек өз атынан
drop policy if exists "sets insert" on public.sets;
create policy "sets insert" on public.sets for insert to authenticated
  with check (owner = (select auth.uid()));

drop policy if exists "sets update" on public.sets;
create policy "sets update" on public.sets for update to authenticated
  using (owner = (select auth.uid())) with check (owner = (select auth.uid()));

drop policy if exists "sets delete" on public.sets;
create policy "sets delete" on public.sets for delete to authenticated
  using (owner = (select auth.uid()));

-- updated_at автоматты жаңарады
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists sets_touch on public.sets;
create trigger sets_touch before update on public.sets
  for each row execute function public.touch_updated_at();
