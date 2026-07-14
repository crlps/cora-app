-- ─────────────────────────────────────────
--  Cora — tabela event_participants
--  Registra presença confirmada de usuários reais em eventos
-- ─────────────────────────────────────────

create table if not exists public.event_participants (
  event_id    text        not null,
  profile_id  uuid        not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (event_id, profile_id)
);

-- Consulta comum: "quem vai neste evento?"
create index if not exists event_participants_event_idx
  on public.event_participants (event_id);

-- Consulta comum: "quais eventos este usuário confirmou?"
create index if not exists event_participants_profile_idx
  on public.event_participants (profile_id);

-- ─────────────────────────────────────────
--  Row Level Security
-- ─────────────────────────────────────────

alter table public.event_participants enable row level security;

-- Sem auth ainda: policies permissivas para anon.
-- Quando houver login, restringir com auth.uid() = profile_id.
create policy "anon pode confirmar presença"
  on public.event_participants
  for insert to anon
  with check (true);

create policy "anon pode cancelar presença"
  on public.event_participants
  for delete to anon
  using (true);

create policy "anon pode ver participantes"
  on public.event_participants
  for select to anon
  using (true);
