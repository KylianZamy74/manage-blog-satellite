# Plan : rendre la rédaction fluide dans le manager

Statut : à faire plus tard (noté le 2026-10-21). Une branche, une PR.

## Constat (code au 2026-10-21)

| # | Problème | Où |
|---|----------|----|
| 1 | « Écris ici… » est du vrai contenu, à effacer avant d'écrire | `src/components/ui/TiptapEditor.tsx` (`content` par défaut) |
| 2 | La barre d'outils défile avec la page : sur un long article, il faut remonter pour formater | `TiptapEditor.tsx` |
| 3 | Images uniquement via le bouton Cloudinary ; copier-coller et glisser-déposer interdits (bandeau orange) | `TiptapEditor.tsx` |
| 4 | Liens ajoutés via `window.prompt` | `TiptapEditor.tsx` (`setLink`) |
| 5 | Création et modification se comportent différemment : enregistrement auto à la création, bouton « Enregistrer » en modification. Deux composants quasi identiques | `CreateArticleForm.tsx` / `EditArticleForm.tsx` |
| 6 | Un brouillon est créé en base dès la première frappe, même sans titre | `CreateArticleForm.tsx` (auto-save 5 s) |
| 7 | Champs SEO cachés, vides par défaut, sans compteur de caractères | `CreateArticleForm.tsx` / `EditArticleForm.tsx` |

## Ce qu'on fait

- **Un seul éditeur** (`ArticleEditor`) pour la création et la modification, avec le même enregistrement automatique et un indicateur discret « Enregistré ». Suppression de la duplication Create/Edit.
- **Brouillon créé seulement quand il y a un titre.**
- **Écriture à la Notion** :
  - titre en grand champ intégré à la page, placeholder à la place du faux contenu ;
  - barre d'outils fixe (sticky) en haut de l'éditeur ;
  - menu flottant sur la sélection : gras, italique, lien, titre ;
  - commande `/` pour insérer un bloc : titre, liste, citation, image, CTA, galerie ;
  - raccourcis Markdown déjà fournis par StarterKit (`##`, `-`, `>`), à signaler dans l'interface.
- **Images** : coller ou glisser une image déclenche l'upload Cloudinary (preset `blog_images` existant). Le bandeau d'avertissement disparaît.
- **Liens** : saisie dans le menu flottant, plus de `window.prompt`.
- **SEO** : méta-titre et méta-description pré-remplis depuis le titre et la description courte, modifiables, avec compteurs (60 / 150 caractères).
- **Pied d'éditeur** : nombre de mots et temps de lecture.

## Points à vérifier avant de coder

- Menu `/` : probablement besoin de `@tiptap/suggestion` (paquet officiel TipTap). Vérifier d'abord s'il est déjà présent comme dépendance transitive.
- Placeholder et BubbleMenu : vérifier ce que fournit déjà TipTap 3.16 (`@tiptap/extensions`, `@tiptap/react/menus`).
- Données existantes : aucun changement de schéma prévu ; les articles déjà en base (JSON TipTap) doivent s'ouvrir tels quels dans le nouvel éditeur.
- Le rendu côté template (`Blog-Satellite-Template/src/lib/renderer.ts`) doit continuer de gérer tous les nodes (customImage, imageGallery, ctaButton).

## Ensuite : captures pour le portfolio

Paire d'images « Je rédige → C'est en ligne » pour la page Visibilité du site perso :

1. Rédiger un vrai article avec images dans le nouvel éditeur.
2. Le publier sur un **compte démo dédié** (jamais un compte client), car le template n'affiche que les articles publiés.
3. Lancer le template en local sur ce compte démo et capturer le même article rendu.

À décider : créer le compte démo depuis l'admin (« Créer un utilisateur ») ou en réutiliser un.
