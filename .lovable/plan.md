# Refonte AgriCapital — style Belife Groupe

## Sitemap (déjà disponible)

URL à coller dans Google Search Console : **`https://agricapital.ci/sitemap.xml`**
(Champ "Ajouter un nouveau sitemap" → saisir simplement `sitemap.xml`.)

Le fichier est déjà servi, multilingue (FR/EN/AR/ES/DE/ZH), avec `hreflang` complet.

---

## 1. Refonte visuelle (inspirée Belife)

**Codes visuels Belife** (ce que je vais répliquer) :
- Palette claire, beige/crème + accent orange brûlé + texte sombre
- Navigation horizontale épurée avec mega-menu déroulant par catégorie
- Typographie sobre, sans serif moderne
- Cards produits/offres uniformes, photographies professionnelles uniquement
- Hero plein écran avec image corporate + CTA unique
- Sections généreuses (whitespace), sans extravagance
- Footer dense en colonnes (liens, contact, légal)

**Composants à refondre** :
- `Hero` → version corporate sobre, une image, un titre, un CTA
- `DynamicNavigation` → style mega-menu épuré (À propos / Nos offres / Investir / Actualités / Contact)
- `Footer` → 4 colonnes structurées
- `About`, `Approach`, `Ambitions` → cards uniformes, fond clair
- `Founder`, `Team` → portraits sobres, format LinkedIn corporate
- `Partnership`, `Contact` → formulaires épurés

## 2. Nettoyage public (suppression du superflu)

À **supprimer** des pages publiques (jugés peu pro / non crédibles) :
- `CommunityProspecting` (section prospection communautaire)
- `IvoryCoastMap` (carte interactive — trop gadget en homepage)
- `TestimonialsDisplay` **OU** `Testimonials` (doublon — garder un seul module)
- `Milestones` sur homepage (déplacer vers page Evolution dédiée)
- Toutes images IA/placeholder dans News, Hero, About → garder uniquement photos authentiques validées
- Welcome popup (intrusif)

À **garder/affiner** :
Hero • Ambitions • About • Approach • Founder • Team • Partnership • NewsSection • Contact • Footer

## 3. Nettoyage admin (pages inutiles)

Pages admin actuellement présentes mais redondantes/non utilisées → à supprimer :
- `AdminMenuNav` (gestion menu — pas exploitée)
- `AdminSEO` (SEO géré statiquement)
- `AdminPermissions` (doublon avec AdminUsers)
- `AdminPartnerships` (doublon avec AdminPartnershipRequests)
- `AdminTranslations` (auto via IA)
- `AdminMedia` (rarement utilisée)
- `AdminInbox` (doublon contact messages)
- `AdminAuditLog`, `AdminBackup` (gardés mais déplacés sous "Configuration")

**Sidebar finale (3 pôles)** :
- Contenu : Dashboard, Analytics, Actualités, Témoignages
- Communication : Messages, Newsletter, Historique envois, Demandes partenariat, Conversations IA, Contacts visiteurs, Notifications
- Configuration : Utilisateurs & Rôles, Base de données, Paramètres

## 4. SEO renforcé

- `index.html` : title/description/OG optimisés + JSON-LD Organization
- Vérifier balises canonical + hreflang (déjà OK dans sitemap)
- Ajouter JSON-LD `Article` sur pages News via `react-helmet-async`
- `robots.txt` déjà correct
- Confirmer le sitemap dans Google Search Console (URL ci-dessus)

---

## ⚠️ Confirmations nécessaires avant exécution

1. **Palette Belife** (beige/crème + orange brûlé) OU on garde le vert AgriCapital actuel adouci ?
2. **Suppression sections homepage** (CommunityProspecting, IvoryCoastMap, Milestones, un des deux Testimonials) — OK ?
3. **Suppression pages admin** listées ci-dessus — OK ?
4. **Images à supprimer** : tu veux que je liste les images existantes que je trouve "non crédibles" pour validation, ou je supprime/remplace de manière autonome ?

Réponds avec tes choix (ou "tout OK, fonce") et j'exécute en parallèle.
