-- Rode este arquivo uma vez no SQL Editor do Supabase.

create table if not exists public.progresso (
  user_id uuid primary key references auth.users (id) on delete cascade,
  dados jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

alter table public.progresso enable row level security;

-- Progresso: cada pessoa só enxerga e altera o seu.
drop policy if exists "progresso proprio" on public.progresso;
create policy "progresso proprio" on public.progresso
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
