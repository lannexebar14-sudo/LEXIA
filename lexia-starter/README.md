# LEXIA — Starter GitHub

Starter Next.js pour la plateforme d'assistance juridique LEXIA.

## Inclus

- Next.js App Router
- TypeScript
- Design premium clair bleu nuit / doré
- Pages d'accueil, connexion, inscription, dépôt de dossier et tableau de bord
- Préconfiguration Supabase navigateur + serveur
- Variables d'environnement prêtes pour Vercel

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` dans le navigateur.

## Déploiement GitHub / Vercel

1. Créer un nouveau dépôt GitHub.
2. Importer tous les fichiers de ce dossier.
3. Connecter le dépôt à Vercel.
4. Ajouter les variables d'environnement dans Vercel.
5. Déployer.

## Étapes suivantes

- Authentification Supabase complète
- Schéma SQL et politiques RLS
- Dépôt sécurisé des documents
- Messagerie client / juriste
- Paiement 13 € et tarifs professionnels
- Propositions complémentaires payantes dans la messagerie
- Partie adverse facultative
- Espace administrateur et attribution des dossiers

## Important

Le périmètre des prestations juridiques, les CGV, la protection des données et les habilitations professionnelles devront être validés avant la mise en production commerciale.
