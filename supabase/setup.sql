-- À exécuter une seule fois dans Supabase > SQL Editor
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'client' check (role in ('client', 'juriste', 'admin')),
  account_type text not null default 'particulier' check (account_type in ('particulier', 'professionnel')),
  company_name text,
  siret text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Un utilisateur lit son profil"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Un utilisateur modifie son profil"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, account_type, company_name, siret)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'account_type', 'particulier'),
    nullif(new.raw_user_meta_data->>'company_name', ''),
    nullif(new.raw_user_meta_data->>'siret', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- APRÈS avoir créé ton compte, remplace l'adresse ci-dessous par ton e-mail :
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'TON-EMAIL@EXEMPLE.FR');
