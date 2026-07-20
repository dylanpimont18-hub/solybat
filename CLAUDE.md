# Soly'bat — Site web

Site vitrine statique généré avec 11ty (Nunjucks), déployé tel quel en FTP sur Hostinger/OVH. Ce fichier résume le brief de marque (`BRAND.md`) et l'état du projet ; **`BRAND.md` reste la source de vérité** sur la marque — le consulter en entier avant toute génération de contenu ou de design. Le design détaillé et le plan d'implémentation complet sont dans `docs/superpowers/specs/` et `docs/superpowers/plans/`.

## Stack technique

- **Générateur** : 11ty (`@11ty/eleventy` ^2.0.1), config dans `eleventy.config.cjs` (CommonJS — voir note ci-dessous).
- **Templating** : Nunjucks (`.njk`), layout partagé `src/_includes/layouts/base.njk`, composants dans `src/_includes/composants/`.
- **CSS** : pur, pas de préprocesseur, tokens dans `src/css/tokens.css`, un fichier par composant/page, assemblés dans `src/css/styles.css`.
- **JS** : modules ES natifs (`<script type="module">`), pas de bundler, un fichier par fonctionnalité dans `src/js/`, point d'entrée `src/js/main.js`.
- **Backend formulaire** : PHP (`traiter-devis.php` + `devis-validation.php`, à la racine, copiés tel quels dans `_site/`) — **non encore implémenté** (voir État du projet).
- **Tests** : `node --test` (runner natif Node) pour la logique JS pure ; script PHP `assert()` pour la logique PHP pure — pas de framework externe.

### Piège toolchain connu

`eleventy.config.cjs` doit rester en **CommonJS** (`module.exports`), pas en ESM (`export default`), même si `package.json` a `"type": "module"`. Sur cette stack (11ty 2.0.1 + Node v24.7.0), une config `.eleventy.js`/`eleventy.config.js` en ESM fait échouer silencieusement le chargement de `dir.input` — 11ty scanne alors tout le dépôt au lieu de `src/` seulement. Le `.cjs` force le chargement CommonJS quel que soit `package.json`. De même, `npm test` doit rester `node --test` **sans argument de chemin** (`node --test tests/` échoue avec `MODULE_NOT_FOUND` sur cette version de Node).

## Commandes principales

```bash
npm install       # installe les dépendances
npm run build     # génère le site dans _site/ (= ce qu'on upload en FTP)
npm run serve     # serveur de dev avec rechargement
npm test          # lance tous les tests (node --test, découverte auto de tests/*.test.js)
```

## Conventions de code

- Noms de variables/fonctions/attributs `data-*` en français (`filtrerRealisations`, `data-type-de-bien`), cohérent avec le contenu du site.
- Chaque module JS interactif exporte une fonction pure testable (ex. `filtrerRealisations`, `calculerPositionPourcentage`, `validerFormulaire`) + une fonction `init*()` qui fait le câblage DOM et retourne tôt si les éléments ciblés sont absents de la page.
- Composants Nunjucks réutilisables = macros (`sceau`, `friseProcess`, `carteRealisation`), pas des includes bruts, pour accepter des paramètres.
- Toute dégradation sans JS est volontaire et testée : formulaire `/devis` poste nativement, FAQ en `<details>` natif, panneaux d'onglets visibles par défaut dans le HTML brut (JS masque seulement les inactifs).

## L'entreprise

- **Soly'bat** : BTP / rénovation de biens immobiliers en vue de mise en location, rayon ~50 km autour de Vierzon (Cher).
- **Service phare** : prise en charge intégrale d'un chantier (tous corps de métier) pour un bien prêt à louer — un seul interlocuteur.
- **Cibles** : investisseurs locatifs, agences/gestionnaires immobiliers, particuliers.
- **Positionnement** : "Un bien à rénover. Un bien loué. Un seul interlocuteur."
- **Ton** : sobre, factuel, direct ("Nous prenons en charge…"), jamais de jargon BTP non expliqué face au grand public.

## Identité visuelle

- **Logo** : `logo-solybat.png` — sceau circulaire terracotta, wordmark serif anthracite, bulle de niveau stylisée (signature de marque récurrente à réutiliser dans l'UI : frise process, tampon "chantier garanti", favicon).

### Palette

| Nom | Hex | Usage |
|---|---|---|
| Terracotta | `#B5502E` | Accent/CTA — jamais en fond de bloc large |
| Bois brûlé | `#6B4A32` | Texture, labels secondaires |
| Crème sable | `#EDE4D3` | Fond principal — jamais blanc pur |
| Crème claire | `#F6F1E7` | Fond alternatif |
| Anthracite | `#2B2723` | Texte principal — jamais noir pur |
| Vert olivier | `#7A8560` | Petites touches : validations, coche, point du sceau |

### Typographie

- Display (titres) : **Fraunces**, avec parcimonie.
- Corps de texte : **Inter**.
- Import : `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');`

### Règles de direction artistique

- Photos réelles de chantiers uniquement — jamais de stock.
- Mouvement minimal ; le slider avant/après est le seul vrai moment d'interaction.
- Numérotation (01→04) réservée à la frise du process, pas ailleurs.
- Fond crème sable partout.

## Arborescence cible du site

```
/                           Accueil
/renovation-location        Offre + sections par profil (onglets/ancres)
/realisations                Galerie filtrable
/realisations/[nom-projet]   Fiche projet (avant/après)
/process                    Détail des 4 étapes
/espace-pro                 Page dédiée agences/gestionnaires
/a-propos                   Histoire, valeurs, zone d'intervention
/faq                        Délais, garanties, assurances, paiement
/devis                      Formulaire de contact par profil
/mentions-legales           SIRET, assurances, CGV, confidentialité
```

## État du projet

Les 10 pages (les 9 du BRAND.md + `/devis-merci`) sont construites avec contenu provisoire crédible et données de démo. Un audit complet (accessibilité, SEO, cohérence de marque, contraste, responsive) a été passé et les correctifs de code ont été appliqués directement (voir historique git). Reste avant mise en ligne, par ordre d'impact :

- [x] ~~Photos hero IA à régénérer~~ — les 18 emplacements de `docs/prompts-photos.md` sont désormais pourvus (skill `generer-image`, API Mammouth AI). Les 3 photos hero de l'accueil restent volontairement nettes (suggère une photo pro pour la page vitrine) — `piece-a-renover.jpg` avait aussi l'artefact IA (étoile), retiré par recadrage (bord droit coupé) sans passer par le post-traitement smartphone, pour rester cohérente avec les 2 autres photos hero de l'accueil ; les 15 autres (heros `/renovation-location`, `/realisations`, `/espace-pro`, avant/apres des 4 réalisations) sont passées par `post_traitement.py` pour un rendu plus crédible "smartphone de chantier" (grain, flou léger, inclinaison/recadrage asymétrique, vignettage). Anciennes versions dans `photos/_avant-correction-ia/` et `photos/_avant-post-traitement/` (cette dernière contient encore, sur `chantier-coordination.jpg`, un logo de marque réelle "Placo" halluciné par le modèle sur des cartons en arrière-plan — le recadrage du post-traitement l'a fait sortir du cadre sur la version actuellement utilisée, mais à surveiller si l'image est régénérée). Le rendu reste plus "mise en scène" que le style brut visé par `docs/prompts-photos.md` — à remplacer par de vraies photos de chantier dès que possible, une agence immobilière repère ce type de rendu.
- [x] ~~Passe technique perf/accessibilité/SEO~~ — audit Lighthouse réel (Chrome headless) avant/après : accueil 67→74 perf / 95→100 accessibilité, LCP 47,6s→5,9s ; fiche réalisation 68→80 perf, LCP 16,8s→4,1s. Détail : les 18 photos converties PNG→JPEG (23,4 Mo→2,5 Mo, -89%, voir `src/images/realisations/`), logo/favicon quantifiés en PNG palette (-84%), `loading="lazy"` sur les cartes de galerie, `fetchpriority="high"` sur l'image LCP de chaque hero/fiche projet, polices Google Fonts en `<link preconnect>` (plus de `@import` bloquant) et limitées aux graisses réellement utilisées, contraste du bouton CTA principal et du bouton de profil sélectionné corrigés (4,49:1→4,99:1 via `--couleur-terracotta-texte`), lien d'évitement clavier, JSON-LD `GeneralContractor`, `og-image.jpg` dédiée 1200×630, manifest/apple-touch-icon, `.htaccess` (cache/compression/sécurité, non testable en local faute de serveur Apache). `npm test` (14 tests) toujours vert après coup.
- [x] ~~Téléphone réel~~ — `06 14 59 13 74` communiqué par le client (2026-07-20), mis à jour dans `src/_data/site.json` (`telephone`/`telephoneLien`).
- [x] ~~Email réel~~ — `solybat@gmail.com` communiqué par le client (2026-07-20), mis à jour dans `src/_data/site.json` et `traiter-devis.php` (`$adresseContact`).
- [ ] **Backend PHP écrit mais non vérifié** — `traiter-devis.php`/`devis-validation.php`/`tests/test-devis-validation.php` sont écrits (Task 18 du plan) mais PHP n'est toujours pas installé sur la machine de dev, donc jamais exécutés (`php -l`, ni le script de test). Le formulaire `/devis` ne 404 plus mais reste à valider réellement une fois PHP disponible (local ou sur l'hébergement Hostinger/OVH).
- [x] ~~Nom de domaine réel~~ — `solybat18.fr` communiqué par le client (2026-07-20), mis à jour dans `src/_data/site.json` (`url`) et `src/robots.txt` (`Sitemap:`, non piloté par `site.json`, fichier statique copié tel quel). L'en-tête technique `From:` de `traiter-devis.php` a été alignée sur ce domaine (`no-reply@solybat18.fr`) — elle ne doit jamais porter `solybat@gmail.com` : un hébergement mutualisé qui usurpe une adresse gmail.com en "From" se fait généralement bloquer par les filtres anti-spoofing de Gmail.
- [ ] Contenu texte définitif à rédiger (le contenu actuel est provisoire mais réaliste, basé sur le positionnement du BRAND.md).
- [ ] Photos avant/après à collecter — dès qu'ajoutées dans `src/_data/realisations.json` (`photos.avant`/`photos.apres`), les composants basculent automatiquement du placeholder vers l'image/slider, sans retouche de template.
- [ ] **Informations légales réelles dans `src/mentions-legales.njk`** (SIRET, assurances, hébergeur, CGV, confidentialité — actuellement des placeholders explicites `[... à compléter]`, volontairement laissés ainsi : un faux SIRET/CGV présenté comme réel sous le nom de l'entreprise est un risque juridique, pas juste un défaut visuel).
- [ ] Plaquette PDF `/espace-pro` (actuellement un lien de repli vers `/devis/` en attendant, plus de `<span>` inerte).
- [ ] Déclinaisons du logo restantes (carte de visite, signature mail — favicon et apple-touch-icon dédiés déjà en place).

## CODEBASE_MAP.md

Généré et à jour à la racine du projet — le consulter avant d'ouvrir un fichier source pour savoir où écrire.
