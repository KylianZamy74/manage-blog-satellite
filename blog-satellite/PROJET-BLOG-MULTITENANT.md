# Projet Blog Multi-Tenant - Contexte

## Pourquoi ce projet ?

On a essayé Sanity pour créer un blog multi-tenant (plusieurs clients, chacun voit ses propres articles). Problèmes rencontrés :
- Multi-tenant galère sur le plan Free (pas de rôles custom)
- Scaling coûteux (50+ users = plan Enterprise $$$)
- Vendor lock-in (migration difficile)
- On a réussi à le faire fonctionner avec un custom input component, mais c'était compliqué

**Décision** : Créer notre propre solution avec Next.js + Prisma + Neon

---

## Architecture cible

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌──────────────────────┐      ┌─────────────────────────────┐  │
│  │   App Next.js        │      │   Apps Astro (par client)   │  │
│  │   (Vercel)           │      │   (Cloudflare)              │  │
│  │                      │      │                             │  │
│  │  • Dashboard admin   │ API  │  blog-boulangerie.com       │  │
│  │  • Espace client     │◄────►│  blog-pizzeria.com          │  │
│  │  • CRUD articles     │      │  blog-coiffeur.com          │  │
│  │  • Auth NextAuth     │      │  ...                        │  │
│  └──────────┬───────────┘      └─────────────────────────────┘  │
│             │                                                    │
└─────────────┼────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│   Neon (PostgreSQL)     │     │   Cloudinary (Images)       │
│   Free: 0.5GB           │     │   Free: 25GB                │
│                         │     │                             │
└─────────────────────────┘     └─────────────────────────────┘
```

---

## Stack technique

| Technologie | Rôle | Pourquoi |
|-------------|------|----------|
| **Next.js 14** | App de gestion | App Router, Server Components |
| **Prisma** | ORM | Simple, typé, migrations faciles |
| **Neon** | Base de données | PostgreSQL gratuit (0.5GB) |
| **NextAuth** | Authentification | Magic link par email |
| **TipTap** | Éditeur rich text | H1-H6, images, listes, etc. |
| **Cloudinary** | Stockage images | 25GB gratuit, CDN inclus |
| **shadcn/ui** | Composants UI | Clean, accessible, customisable |
| **Vercel** | Hosting Next.js | Gratuit, optimisé pour Next |
| **Cloudflare** | Hosting Astro | Gratuit, rapide |

---

## Coûts estimés

| Service | Free Tier | Usage 100 clients | Coût |
|---------|-----------|-------------------|------|
| Vercel | Gratuit | OK | 0€ |
| Neon | 0.5GB | ~50MB | 0€ |
| Cloudinary | 25GB | ~4GB (150KB/image) | 0€ |
| Cloudflare | Illimité | OK | 0€ |
| **Total** | | | **0€** |

---

## Schema Prisma prévu

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(CLIENT)
  client    Client?  @relation(fields: [clientId], references: [id])
  clientId  String?
  createdAt DateTime @default(now())
}

model Client {
  id        String    @id @default(cuid())
  name      String
  slug      String    @unique
  email     String    @unique
  logo      String?
  users     User[]
  articles  Article[]
  createdAt DateTime  @default(now())
}

model Article {
  id          String   @id @default(cuid())
  title       String
  slug        String
  content     Json     // TipTap JSON
  excerpt     String?
  image       String?
  status      Status   @default(DRAFT)
  client      Client   @relation(fields: [clientId], references: [id])
  clientId    String
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([clientId, slug])
}

enum Role {
  ADMIN
  CLIENT
}

enum Status {
  DRAFT
  PUBLISHED
}
```

---

## Structure de l'app Next.js

```
/app
  /(auth)
    /login                → Connexion magic link
    /invite/[token]       → Accepter invitation

  /(dashboard)
    /layout.tsx           → Sidebar + Header
    /page.tsx             → Dashboard stats
    /articles
      /page.tsx           → Liste des articles
      /new/page.tsx       → Créer article (TipTap)
      /[id]/edit/page.tsx → Éditer article
    /settings
      /page.tsx           → Paramètres client

  /(admin)                → Panel admin
    /clients/page.tsx     → Gérer les clients
    /articles/page.tsx    → Voir tous les articles

  /api
    /auth/[...nextauth]   → NextAuth config
    /articles             → CRUD articles
    /clients              → CRUD clients
    /public
      /articles           → API publique pour Astro
    /upload               → Upload Cloudinary
```

---

## API publique pour Astro

```ts
// GET /api/public/articles?client=boulangerie-martin

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientSlug = searchParams.get('client')

  const articles = await prisma.article.findMany({
    where: {
      client: { slug: clientSlug },
      status: 'PUBLISHED'
    },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      image: true,
      content: true,
      publishedAt: true,
    }
  })

  return Response.json(articles)
}
```

---

## Fonctionnalités prévues

### Admin (toi)
- [ ] Dashboard avec stats globales
- [ ] Créer/modifier/supprimer des clients
- [ ] Inviter des clients par email
- [ ] Voir tous les articles de tous les clients
- [ ] Assigner des articles à des clients

### Client
- [ ] Connexion par magic link (email)
- [ ] Dashboard personnel
- [ ] Créer/modifier/supprimer SES articles
- [ ] Éditeur rich text (TipTap)
- [ ] Upload d'images (Cloudinary)
- [ ] Prévisualisation article
- [ ] Publier/dépublier

### API
- [ ] Endpoint public pour fetch les articles par client
- [ ] Filtrage par statut (published only)
- [ ] Pagination

---

## Exemple TipTap (éditeur)

```tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

function ArticleEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
  })

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
```

---

## Exemple Cloudinary upload

```tsx
import { CldUploadWidget } from 'next-cloudinary'

function ImageUpload({ onUpload }) {
  return (
    <CldUploadWidget
      uploadPreset="blog_images"
      onSuccess={(result) => onUpload(result.info.secure_url)}
    >
      {({ open }) => (
        <button onClick={() => open()}>
          Ajouter une image
        </button>
      )}
    </CldUploadWidget>
  )
}
```

---

## Prochaines étapes

1. **Setup projet Next.js** avec App Router
2. **Configurer Prisma + Neon**
3. **Configurer NextAuth** (magic link)
4. **Créer le layout dashboard** (shadcn/ui)
5. **Implémenter TipTap** (éditeur)
6. **Intégrer Cloudinary** (images)
7. **Créer l'API publique** pour Astro
8. **Déployer sur Vercel**

---

## Notes importantes

- Images en WebP ~150KB → 25GB = ~166,000 images
- Neon 0.5GB largement suffisant (projet agence voyage = 0.03GB avec 50 excursions)
- Pas de vendor lock-in : tout est standard (PostgreSQL, etc.)
- Migration facile si besoin de changer d'hébergeur

---

## Comparaison avec Sanity

| | Sanity | Notre solution |
|---|--------|----------------|
| 20 clients | Gratuit | Gratuit |
| 100 clients | $$$ | Gratuit |
| 500 clients | $$$$ | ~0€ |
| Contrôle données | Chez Sanity | Chez nous |
| Migration | Galère | Export SQL |
| Vendor lock-in | Oui | Non |

---

## Instructions pour Claude (contexte IA)

**Profil du dev** : Junior, apprend vite avec l'IA mais veut comprendre en profondeur.

**Mode pédagogue activé** :
1. Expliquer le **concept** avant de donner le code
2. Montrer **où c'est dans la doc** (liens précis)
3. Laisser le dev coder lui-même quand possible
4. Donner des **indices** avant la solution complète
5. Expliquer le **"pourquoi"** pas juste le "comment"

**Ne PAS faire** :
- Balancer du code sans explication
- Utiliser des patterns obscurs sans les expliquer
- Supposer que le dev connaît les concepts avancés

---

## Récap des concepts clés Next.js

### Server Components vs Client Components

| | Server Component | Client Component |
|---|------------------|------------------|
| Directive | Aucune (défaut) | `"use client"` en haut |
| Exécution | Serveur uniquement | Navigateur |
| Hooks React | ❌ Non | ✅ Oui |
| Interactivité | ❌ Non | ✅ Oui |
| Accès DB/env secrets | ✅ Oui | ❌ Non |
| JS envoyé au browser | ❌ Non | ✅ Oui |

**Règle** : Rester en Server Component par défaut. Client uniquement si interactivité nécessaire.

### Server Actions (`"use server"`)

Fonctions qui s'exécutent sur le serveur, appelables depuis un formulaire.

```tsx
<form action={async (formData: FormData) => {
  "use server"
  // Ce code tourne sur le SERVEUR
  const email = formData.get("email") // récupère l'input avec name="email"
}}>
  <input name="email" type="email" />
</form>
```

**Doc** : https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

### NextAuth v5 (Auth.js) - Magic Link

Flow :
1. User entre email → `signIn("resend", { email })`
2. Token généré + stocké en DB (`VerificationToken`)
3. Email envoyé avec lien magique
4. User clique → token vérifié → session créée

**Doc** : https://authjs.dev/getting-started/authentication/email

---

## Ressources utiles

- **Next.js App Router** : https://nextjs.org/docs/app
- **Auth.js (NextAuth v5)** : https://authjs.dev
- **Prisma** : https://www.prisma.io/docs
- **TipTap** : https://tiptap.dev/docs
- **shadcn/ui** : https://ui.shadcn.com
- **Exemples Next.js** : https://github.com/vercel/next.js/tree/canary/examples
- **Exemples NextAuth** : https://github.com/nextauthjs/next-auth/tree/main/apps/examples

---

## Avancement du projet

### Session 1 - Terminé

- [x] Setup Next.js 16 + App Router
- [x] Prisma 6 + Neon (PostgreSQL) connecté
- [x] NextAuth v5 avec Resend (magic link) fonctionnel
- [x] Page `/login` (formulaire email)
- [x] Page `/login/verify` (message "check tes mails")
- [x] Middleware de protection des routes `/dashboard/*`
- [x] Flow auth complet testé et fonctionnel
- [x] shadcn/ui initialisé avec Sidebar

### Session 2 - Terminé

- [x] Dashboard layout avec Sidebar + Header
- [x] Séparation des routes admin/client par middleware
- [x] **CRUD Utilisateurs** (`src/actions/users/action.ts`)
  - [x] `createUser()` - Créer un utilisateur CLIENT
  - [x] `deleteUser()` - Supprimer avec vérification auth
  - [x] `getUsers()` - Liste tous les utilisateurs
  - [x] `getUser()` - Récupérer par ID
- [x] Page admin/users avec table shadcn pour afficher les utilisateurs
- [x] **CRUD Articles** (`src/actions/articles/action.ts`)
  - [x] `createArticle()` - Créer avec génération slug automatique
  - [x] `editArticle()` - Modifier avec vérification auteur
  - [x] `deleteArticle()` - Supprimer avec vérification auteur
  - [x] `getArticles()` - Liste tous les articles
  - [x] `getArticle()` - Récupérer par ID
- [x] **Éditeur TipTap** (`src/components/ui/TiptapEditor.tsx`)
  - [x] Toolbar : Bold, Italic, H1, H2, H3, Liste, Blockquote, Image
  - [x] Styles dans globals.css avec `@layer components` pour `.ProseMirror`
  - [x] Extension `tiptap-extension-resize-image` pour redimensionner les images
  - [x] Images inline (`inline: true`) pour mettre côte à côte
- [x] **Upload Cloudinary** intégré dans TipTap
  - [x] `CldUploadWidget` avec `uploadPreset`
  - [x] Insertion automatique de l'image dans l'éditeur

### Session 3 - Terminé

- [x] **Validation Zod** (`src/lib/schemas/article.ts`)
  - [x] Schéma `createArticleSchema` avec validation des champs
  - [x] Validation custom `.refine()` pour le contenu TipTap (vérifie JSON valide + non vide)
  - [x] Gestion des champs optionnels avec `.nullish()` (accepte `null` et `undefined`)
  - [x] Intégration dans `createArticle()` avec `safeParse()`
  - [x] Messages d'erreur propres pour l'UX
- [x] **Correction bug `getMyArticles()`**
  - [x] Avant : passait un boolean au `where` de Prisma (bug)
  - [x] Après : utilise `session.user.id` pour filtrer les articles de l'utilisateur connecté
- [x] **UI Cards articles** - Affichage des articles en cards

### Prochaine session - À faire

#### Priorité 1 : Extraction automatique de l'image de couverture

- [ ] **Créer fonction `extractFirstImage(content)`** dans `action.ts`
  - [ ] Parcourir récursivement le JSON TipTap
  - [ ] Trouver le premier node de type "image"
  - [ ] Retourner `attrs.src` ou `null`
  - [ ] Utiliser dans `createArticle()` pour remplir le champ `image` automatiquement

```ts
// Exemple de la fonction à implémenter
function extractFirstImage(content: any): string | null {
  if (!content) return null

  // Si c'est un node image, retourne son src
  if (content.type === 'image' && content.attrs?.src) {
    return content.attrs.src
  }

  // Si le node a des enfants, on les parcourt (récursif)
  if (content.content && Array.isArray(content.content)) {
    for (const node of content.content) {
      const found = extractFirstImage(node)
      if (found) return found
    }
  }

  return null
}
```

#### Priorité 2 : Table des articles

- [ ] Page `/dashboard/articles` - Liste des articles avec table shadcn
- [ ] Colonnes : Titre, Status, Date création, Actions (éditer/supprimer)
- [ ] Boutons d'action fonctionnels

#### Priorité 3 : Édition d'article

- [ ] Page `/dashboard/articles/[id]/edit` - Édition d'article
- [ ] Pré-remplir le formulaire avec les données existantes
- [ ] Appliquer la validation Zod aussi sur `editArticle()`

#### Priorité 4 : Auto-save brouillon

- [ ] **Auto-save en brouillon** (sauvegarde auto quand on quitte/change de page)
  - [ ] Sauvegarder toutes les X secondes ou à chaque modification
  - [ ] Détecter `beforeunload` pour sauvegarder avant fermeture
  - [ ] Stocker en localStorage ou créer un brouillon en DB
  - [ ] Reprendre le brouillon au retour sur la page

#### Priorité 5 : Preview & Publication

- [ ] Système de Preview (voir l'article comme le client final)
- [ ] Publier/Dépublier un article (changer le status DRAFT → PUBLISHED)
- [ ] API publique pour les blogs Astro

---

## Pièges rencontrés (à retenir !)

| Piège | Solution |
|-------|----------|
| Prisma 7 + Neon = galère | Rester sur **Prisma 6** |
| Middleware sur Edge Runtime + Prisma | Ajouter `export const runtime = "nodejs"` |
| Middleware doit être au même niveau que `app/` | Si `app/` à la racine → `middleware.ts` à la racine |
| Resend en dev = seulement ton email | Utiliser l'email de ton compte Resend pour tester |
| `pathname !== "/login"` oublie `/login/verify` | Utiliser `!pathname.startsWith("/login")` |
| **Zod 4** : `.url()` deprecated sur `z.string()` | Utiliser `z.url()` directement |
| **Zod 4** : `result.error.errors` n'existe plus | Utiliser `result.error.issues` |
| **Zod 4** : `.optional()` n'accepte pas `null` | Utiliser `.nullish()` pour accepter `null` ET `undefined` |
| `formData.get()` retourne `null` si champ absent | Utiliser `.nullish()` dans le schéma Zod |
| `JSON.parse('')` crash | Valider avec `.refine()` AVANT de parser |

---

## Structure actuelle du projet

```
blog-satellite/
├── app/
│   ├── api/auth/[...nextauth]/route.ts
│   ├── login/
│   │   ├── page.tsx          ✅ Formulaire magic link
│   │   └── verify/page.tsx   ✅ "Check tes mails"
│   ├── dashboard/
│   │   ├── page.tsx          ✅ Dashboard
│   │   └── articles/
│   │       └── new/page.tsx  ✅ Formulaire création article
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── src/
│   ├── actions/
│   │   ├── articles/action.ts ✅ CRUD articles + validation Zod
│   │   └── users/action.ts    ✅ CRUD utilisateurs
│   ├── components/ui/
│   │   ├── ArticleForm.tsx    ✅ Formulaire article (client component)
│   │   ├── TiptapEditor.tsx   ✅ Éditeur rich text
│   │   └── ...                ✅ Composants shadcn
│   ├── lib/
│   │   ├── auth.ts            ✅ Config NextAuth
│   │   ├── prisma.ts          ✅ Instance Prisma
│   │   ├── schemas/
│   │   │   └── article.ts     ✅ Schéma Zod validation articles
│   │   └── utils.ts
│   └── types/next-auth.d.ts   ✅ Types session étendus
├── prisma/
│   └── schema.prisma          ✅ Schéma DB
├── middleware.ts              ✅ Protection routes
└── .env                       ✅ Variables d'env
```
