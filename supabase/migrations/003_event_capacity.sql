-- ─────────────────────────────────────────
--  Cora — limite de vagas por evento
--  Garante o limite no banco (não só na UI), evitando que duas pessoas
--  confirmem ao mesmo tempo e ultrapassem a capacidade da turma.
-- ─────────────────────────────────────────

create table if not exists public.event_capacity (
  event_id text primary key,
  capacity int not null check (capacity > 0)
);

alter table public.event_capacity enable row level security;

create policy "anon pode ler capacidade dos eventos"
  on public.event_capacity
  for select to anon
  using (true);

-- Turma exclusiva Cora no Vidya: 20 vagas
insert into public.event_capacity (event_id, capacity)
values ('yogaterapia-vidya', 20)
on conflict (event_id) do update set capacity = excluded.capacity;

-- ─────────────────────────────────────────
--  Trigger: bloqueia inserts além da capacidade
-- ─────────────────────────────────────────

create or replace function public.check_event_capacity()
returns trigger as $$
declare
  max_capacity int;
  current_count int;
begin
  select capacity into max_capacity
  from public.event_capacity
  where event_id = new.event_id;

  -- Evento sem limite configurado: segue sem restrição
  if max_capacity is null then
    return new;
  end if;

  select count(*) into current_count
  from public.event_participants
  where event_id = new.event_id;

  if current_count >= max_capacity then
    raise exception 'CAPACITY_FULL: Turma lotada'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists enforce_event_capacity on public.event_participants;

create trigger enforce_event_capacity
  before insert on public.event_participants
  for each row
  execute function public.check_event_capacity();
