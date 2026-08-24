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

- **Soly'bat** : BTP / rénovation de biens immobiliers en vue de mise en location, Vierzon et les communes alentour (Cher) — pas de rayon kilométrique annoncé.
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

## Refonte visuelle 2026-08-19

Le site a reçu une refonte visuelle complète, décidée avec le client après lui avoir signalé qu'elle contredisait deux règles de `BRAND.md` (mouvement minimal, fond crème partout) — les deux règles ont été révisées dans `BRAND.md`, elles ne sont plus une source de vérité périmée.

- **Hero de l'accueil** : maquette 3D d'une maison qui se construit en boucle (dalle → murs → cloison → pignons → toit → cheminée → finitions), **en WebGL écrit à la main**, sans Three.js. 66 triangles, ~3 Ko gzip contre ~165 Ko pour la bibliothèque. Voir `src/js/hero-3d/` et son entrée dans `CODEBASE_MAP.md`.
- **Les 3 photos réelles du triptyque de hero** n'ont pas disparu : elles descendent en section « preuve » juste sous le hero, en plus grand (`composants/bande-photos.njk`). L'ancre de crédibilité de `BRAND.md` est préservée, elle arrive en écran 2.
- **Couche de mouvement transverse** (`src/css/mouvement.css` + 4 modules JS) : apparitions au scroll, basculement 3D des cartes, header collant condensé, trait de la frise qui se dessine, compteurs, transitions de page.
- **Rythme sombre/clair** : sections `.section--sombre` en anthracite profond alternées avec le crème.
- **Garde-fous** : `prefers-reduced-motion` neutralise tout (le hero rend alors une image fixe de la maison terminée) ; sans WebGL, sans JS ou après perte de contexte, la photo de chantier redevient le hero complet ; boucle stoppée hors viewport et onglet en arrière-plan ; densité de pixels plafonnée à 1,5.
- **Vérification** : 83 tests `node --test` (69 ajoutés, toute la géométrie et la chorégraphie sont testées sans navigateur). Mesures de layout mobile faites en encapsulant la page dans une iframe de largeur fixe — `--window-size` d'Edge headless n'est pas respecté sous ~500px, et les captures d'écran figent des images en cours d'animation : ajouter `--force-prefers-reduced-motion` pour capturer un état stable.
## Audit et passe perf du 2026-08-19

Audit complet mené après la refonte, puis correctifs appliqués (lots choisis par le client). Lighthouse mobile sur l'accueil :

| | Avant refonte | Après refonte | Après passe perf |
|---|---|---|---|
| Performance | 74 | 68 | **82** |
| LCP | 5,9 s | 4,7 s | **4,0 s** |
| Accessibilité | 100 | 100 | **100** |
| Requêtes CSS | — | 26 | **2** |
| Requêtes totales | — | 55 | **30** |

- **CSS assemblé au build** (`lib/assembler-css.cjs`) : les 21 `@import` chaînés étaient sérialisés et tous bloquants. C'était le plus gros gain disponible, sans aucun coût visuel.
- **`modulepreload`** sur les 15 modules ES : aplatit la cascade de découverte (3 allers-retours réseau avant que le JS tourne).
- **`width`/`height` sur toutes les images**, via le filtre `dimensionsImage` (lecture de l'en-tête binaire, sans dépendance).
- **Deux contrastes AA corrigés**, tous deux introduits par la refonte : `.surtitre` (4,46:1) réutilisait `--couleur-terracotta-texte`, calibré pour du texte crème **sur** terracotta et non l'inverse — d'où la nouvelle variable `--couleur-terracotta-sur-creme` (#A74A2A, 4,55:1). Et `.hero-3d__legende` (3,65:1 → 6,29:1).
- **`<h2>` manquant** sur `/retour-client` (saut h1 → h3).

**Attention à ne pas mal lire le TBT** : il tombe de 370 ms à 0 ms, mais c'est un artefact de fenêtre de mesure. Le travail sur le fil principal reste quasi identique (3 422 → 3 064 ms) et `scene-hero.js` coûte toujours ~1 037 ms d'exécution sous throttling Lighthouse. Le coût CPU de la 3D n'a pas disparu, il a été déplacé hors de la fenêtre mesurée. La 3D a été conservée telle quelle sur décision du client.

## Mise en avant des cas chiffrés (2026-08-19)

Les 8 opérations chiffrées n'étaient accessibles que par **deux liens en petit texte**, dont un caché derrière un onglet, et la page était absente du menu **et** du footer. C'est pourtant le contenu le plus convaincant du site pour un investisseur : 8/8 opérations en cash-flow positif, 8/8 avec un DSCR > 1, rentabilité brute de 9,75 % à 16,08 %.

- **Bloc « Cas chiffrés » sur l'accueil** (`composants/bloc-rentabilite.njk`), en section sombre entre la bande photos et la publicité climatisation : 4 chiffres agrégés en compteurs animés, les 3 opérations les plus rentables, mention des hypothèses, CTA. Cela décale la publicité climatisation d'une position (signalé au client, qui a validé).
- **Entrée « Cas chiffrés » au menu principal et au footer.** L'**URL reste `/retour-client/`** — seul le libellé affiché change, donc aucun lien externe cassé.
- **Tous les chiffres sont calculés au build** (`lib/synthese-rentabilite.cjs`), jamais écrits en dur : ajouter une 9ᵉ opération dans `retoursClients.json` met à jour l'accueil et la page tout seuls. Le `<h1>` et le chapeau de `/retour-client` sont eux aussi dynamiques.
- **Vocabulaire** : ce sont des **opérations réelles**, pas des simulations. Ne pas revenir à un vocabulaire de projection, ce serait les affaiblir (voir aussi la note « retour client » dans la mémoire projet).
- Vérifié : contrastes (14 combinaisons, 0 échec), rendu desktop, et mobile mesuré à 405px — chiffres en 2 colonnes, cartes empilées, bouton pleine largeur, aucun débordement.

### Piège : `width`/`height` en attribut annulent `aspect-ratio`

Depuis que chaque `<img>` porte ses dimensions natives en attributs, **`img { height: auto }` dans `base.css` n'est plus cosmétique, il est indispensable**. Sans lui, l'attribut `height` compte comme une hauteur définie ; `aspect-ratio` n'est appliqué que si l'une des deux dimensions est `auto`, donc il est ignoré. Concrètement : une photo 1200×896 dans `.bande-photos` s'affichait 326×896 au lieu de 326×217 sur mobile, et la page d'accueil mesurait 2 164 px de trop.

Les composants qui pilotent eux-mêmes la hauteur (cartes, heros, slider, photos-vrac) déclarent `height: 100%` via un sélecteur de classe, plus spécifique que `img` — ils n'étaient donc pas touchés. Si un futur composant dimensionne une image par `aspect-ratio` seul, ne pas lui donner de `height` en CSS.

**Points laissés ouverts par l'audit** (non retenus dans les lots appliqués) :
- `traiter-devis.php` reçoit toujours sur `dylan.pimont@orange.fr` — **seul vrai bloquant pour une mise en ligne réelle**.
- Les 7 placeholders légaux (SIRET, assurances, hébergeur, CGV, confidentialité).
- `/realisations/photos-vrac` : 5,7 Mo, et ses photos les plus lourdes sont des chantiers extérieurs (terrasse, piscine, façade) hors du périmètre intérieur de Soly'bat.
- La publicité climatisation est une image PNG de texte : le prix « 2 500 € HT » n'est pas indexable.
- Métas descriptions courtes sur `/devis`, `/realisations`, 404, devis-merci ; `<title>` de 77 caractères sur la fiche Saint-Florent.
- Images en JPEG, pas de WebP/AVIF.

## État du projet

Les 10 pages (les 9 du BRAND.md + `/devis-merci`) sont construites avec contenu provisoire crédible et données de démo. Un audit complet (accessibilité, SEO, cohérence de marque, contraste, responsive) a été passé et les correctifs de code ont été appliqués directement (voir historique git). Reste avant mise en ligne, par ordre d'impact :

- [x] ~~Photos hero IA à régénérer~~ — les 18 emplacements de `docs/prompts-photos.md` sont désormais pourvus (skill `generer-image`, API Mammouth AI). Les 3 photos hero de l'accueil restent volontairement nettes (suggère une photo pro pour la page vitrine) — `piece-a-renover.jpg` avait aussi l'artefact IA (étoile), retiré par recadrage (bord droit coupé) sans passer par le post-traitement smartphone, pour rester cohérente avec les 2 autres photos hero de l'accueil ; les 15 autres (heros `/renovation-location`, `/realisations`, `/espace-pro`, avant/apres des 4 réalisations) sont passées par `post_traitement.py` pour un rendu plus crédible "smartphone de chantier" (grain, flou léger, inclinaison/recadrage asymétrique, vignettage). Anciennes versions dans `photos/_avant-correction-ia/` et `photos/_avant-post-traitement/` (cette dernière contient encore, sur `chantier-coordination.jpg`, un logo de marque réelle "Placo" halluciné par le modèle sur des cartons en arrière-plan — le recadrage du post-traitement l'a fait sortir du cadre sur la version actuellement utilisée, mais à surveiller si l'image est régénérée). Le rendu reste plus "mise en scène" que le style brut visé par `docs/prompts-photos.md` — à remplacer par de vraies photos de chantier dès que possible, une agence immobilière repère ce type de rendu.
- [x] ~~Passe technique perf/accessibilité/SEO~~ — audit Lighthouse réel (Chrome headless) avant/après : accueil 67→74 perf / 95→100 accessibilité, LCP 47,6s→5,9s ; fiche réalisation 68→80 perf, LCP 16,8s→4,1s. Détail : les 18 photos converties PNG→JPEG (23,4 Mo→2,5 Mo, -89%, voir `src/images/realisations/`), logo/favicon quantifiés en PNG palette (-84%), `loading="lazy"` sur les cartes de galerie, `fetchpriority="high"` sur l'image LCP de chaque hero/fiche projet, polices Google Fonts en `<link preconnect>` (plus de `@import` bloquant) et limitées aux graisses réellement utilisées, contraste du bouton CTA principal et du bouton de profil sélectionné corrigés (4,49:1→4,99:1 via `--couleur-terracotta-texte`), lien d'évitement clavier, JSON-LD `GeneralContractor`, `og-image.jpg` dédiée 1200×630, manifest/apple-touch-icon, `.htaccess` (cache/compression/sécurité, non testable en local faute de serveur Apache). `npm test` (14 tests) toujours vert après coup.
- [x] ~~Téléphone réel~~ — `06 14 59 13 74` communiqué par le client (2026-07-20), mis à jour dans `src/_data/site.json` (`telephone`/`telephoneLien`).
- [x] ~~Email réel~~ — `solybat@gmail.com` communiqué par le client (2026-07-20), mis à jour dans `src/_data/site.json` et `traiter-devis.php` (`$adresseContact`).
- [x] ~~Backend PHP écrit mais non vérifié~~ — PHP 8.5.9 installé en local le 2026-07-30 (portable, `C:\Users\Dylan\php`, sans droits admin, ajouté au PATH utilisateur). `php -l` OK sur les deux fichiers, `tests/test-devis-validation.php` passe (un vrai bug trouvé et corrigé au passage : `nettoyerValeur()` neutralisait bien les injections d'en-tête `\r\n` mais laissait un double espace au lieu d'un seul). Testé de bout en bout via `php -S` + `curl` sur les 3 chemins (succès, erreur de validation, honeypot) — tous corrects. Le `mail()` réel échoue en local (pas de serveur SMTP sur la machine de dev, et `mail()` natif Windows ne gère pas l'auth SMTP qu'exigent Orange/Gmail) : comportement attendu, à re-tester une fois déployé sur Hostinger/OVH où `sendmail` est préconfiguré par l'hébergeur. **Important** : `$adresseContact` dans `traiter-devis.php` a été temporairement basculée sur `dylan.pimont@orange.fr` (au lieu de `solybat@gmail.com`) le temps de ces tests — **à remettre sur `solybat@gmail.com` avant toute mise en ligne réelle**.
- [x] ~~Nom de domaine réel~~ — `solybat18.fr` communiqué par le client (2026-07-20), mis à jour dans `src/_data/site.json` (`url`) et `src/robots.txt` (`Sitemap:`, non piloté par `site.json`, fichier statique copié tel quel). L'en-tête technique `From:` de `traiter-devis.php` a été alignée sur ce domaine (`no-reply@solybat18.fr`) — elle ne doit jamais porter `solybat@gmail.com` : un hébergement mutualisé qui usurpe une adresse gmail.com en "From" se fait généralement bloquer par les filtres anti-spoofing de Gmail.
- [ ] Contenu texte définitif à rédiger (le contenu actuel est provisoire mais réaliste, basé sur le positionnement du BRAND.md).
- [ ] Photos avant/après réelles à collecter — les 6 fiches de `src/_data/realisations.json` ont désormais toutes un couple `avant`/`apres` (plus de fallback photo-seule actif), mais seules `maison-mitoyenne-mehun-sur-yevre` (avant+après) et `local-commercial-transforme-saint-florent` (après seulement) utilisent de vraies photos (`photos_farid/`, provenance non vérifiée comme chantier Soly'bat — voir `photos_farid/CONTENU.md`) ; les 4 autres réalisations + le "avant" de saint-florent restent des rendus IA. Dès que de vraies photos Soly'bat arrivent, les composants basculent automatiquement sur les nouveaux chemins dans `realisations.json`, sans retouche de template.
- [ ] **Informations légales réelles dans `src/mentions-legales.njk`** (SIRET, assurances, hébergeur, CGV, confidentialité — actuellement des placeholders explicites `[... à compléter]`, volontairement laissés ainsi : un faux SIRET/CGV présenté comme réel sous le nom de l'entreprise est un risque juridique, pas juste un défaut visuel).
- [x] ~~Plaquette PDF `/espace-pro`~~ — générée le 2026-07-30 (HTML → PDF via Edge headless `--print-to-pdf`, voir `src/documents/plaquette-solybat.pdf`), 2 pages A4, contenu repris du positionnement/process/corps de métier déjà validés ailleurs sur le site. **Refondue le 2026-08-24** : le client la trouvait pas assez haut de gamme. Désormais **A4 paysage, 3 pages**, source versionnée dans `identite-visuelle/plaquette-solybat.html` (la version du 2026-07-30 avait été produite à partir d'un HTML jeté après coup). Couverture typographique anthracite sans photo — choix assumé : les photos disponibles sont des rendus IA, et une pleine page les trahit. Ajout des **8 opérations chiffrées** en page 3, l'argument le plus fort pour une agence, jusque-là absent de la plaquette. Les filets fins remplacent les cartes à coins arrondis, qui faisaient « capture d'écran de site web ». Le PDF n'est pas regénéré par `npm run build` — commande dans `identite-visuelle/README.md`, et `tests/plaquette.test.js` détecte les chiffres périmés. Liée depuis `espace-pro.njk` (le lien de repli et `espace-pro.css` associé ont été supprimés).
- [x] ~~Déclinaisons du logo restantes~~ — carte de visite (recto/verso, générique sans nom de personne ni adresse à la demande de l'utilisateur) et signature email générées le 2026-07-30, voir `identite-visuelle/`. Favicon et apple-touch-icon dédiés déjà en place depuis la passe perf/SEO.

## CODEBASE_MAP.md

Généré et à jour à la racine du projet — le consulter avant d'ouvrir un fichier source pour savoir où écrire.
