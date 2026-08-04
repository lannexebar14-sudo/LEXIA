# Installation de l'inscription et de la connexion LEXIA

1. Remplacez les fichiers du projet GitHub par ceux de ce ZIP.
2. Dans Supabase, ouvrez **SQL Editor**, copiez tout le fichier `supabase/setup.sql` puis cliquez sur **Run**.
3. Dans Vercel > Settings > Environment Variables, ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (adresse complète Vercel, sans slash final)
4. Dans Supabase > Authentication > URL Configuration :
   - Site URL : votre adresse Vercel
   - Redirect URLs : `https://votre-site.vercel.app/auth/callback`
5. Créez votre compte normalement sur `/inscription`.
6. Dans Supabase > SQL Editor, exécutez ensuite en remplaçant l'adresse :

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'VOTRE-EMAIL');
```

À votre prochaine connexion, vous serez redirigé vers `/administration`. Les autres comptes seront redirigés vers `/tableau-de-bord`.
