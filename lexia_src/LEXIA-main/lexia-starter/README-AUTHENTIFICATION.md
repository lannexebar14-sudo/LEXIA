# Authentification LEXIA

1. Copier le contenu de ce dossier dans le dossier `lexia-starter` du dépôt GitHub.
2. Dans Supabase > SQL Editor, exécuter `supabase/setup.sql`.
3. Dans Vercel, ajouter :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
4. Dans Supabase > Authentication > URL Configuration :
   - Site URL : URL Vercel
   - Redirect URL : `https://votre-site.vercel.app/auth/callback`
5. Créer le compte administrateur via `/inscription`, puis exécuter :

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'VOTRE-EMAIL');
```
