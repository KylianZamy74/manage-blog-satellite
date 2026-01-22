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
