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

## Refonte visuelle 2026-08-19

Le site a reçu une refonte visuelle complète, décidée avec le client après lui avoir signalé qu'elle contredisait deux règles de `BRAND.md` (mouvement minimal, fond crème partout) — les deux règles ont été révisées dans `BRAND.md`, elles ne sont plus une source de vérité périmée.

- **Hero de l'accueil** : maquette 3D d'une maison qui se construit en boucle (dalle → murs → cloison → pignons → toit → cheminée → finitions), **en WebGL écrit à la main**, sans Three.js. 66 triangles, ~3 Ko gzip contre ~165 Ko pour la bibliothèque. Voir `src/js/hero-3d/` et son entrée dans `CODEBASE_MAP.md`.
- **Les 3 photos réelles du triptyque de hero** n'ont pas disparu : elles descendent en section « preuve » juste sous le hero, en plus grand (`composants/bande-photos.njk`). L'ancre de crédibilité de `BRAND.md` est préservée, elle arrive en écran 2.
- **Couche de mouvement transverse** (`src/css/mouvement.css` + 4 modules JS) : apparitions au scroll, basculement 3D des cartes, header collant condensé, trait de la frise qui se dessine, compteurs, transitions de page.
- **Rythme sombre/clair** : sections `.section--sombre` en anthracite profond alternées avec le crème.
- **Garde-fous** : `prefers-reduced-motion` neutralise tout (le hero rend alors une image fixe de la maison terminée) ; sans WebGL, sans JS ou après perte de contexte, la photo de chantier redevient le hero complet ; boucle stoppée hors viewport et onglet en arrière-plan ; densité de pixels plafonnée à 1,5.
- **Vérification** : 83 tests `node --test` (69 ajoutés, toute la géométrie et la chorégraphie sont testées sans navigateur). Mesures de layout mobile faites en encapsulant la page dans une iframe de largeur fixe — `--window-size` d'Edge headless n'est pas respecté sous ~500px, et les captures d'écran figent des images en cours d'animation : ajouter `--force-prefers-reduced-motion` pour capturer un état stable.
- **Reste à faire** : Lighthouse n'a **pas** été re-mesuré après la refonte (références d'avant : accueil 74 perf / 100 accessibilité, LCP 5,9 s). À refaire avant mise en ligne.

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
- [x] ~~Plaquette PDF `/espace-pro`~~ — générée le 2026-07-30 (HTML → PDF via Edge headless `--print-to-pdf`, voir `src/documents/plaquette-solybat.pdf`), 2 pages A4, contenu repris du positionnement/process/corps de métier déjà validés ailleurs sur le site. Liée depuis `espace-pro.njk` (le lien de repli et `espace-pro.css` associé ont été supprimés).
- [x] ~~Déclinaisons du logo restantes~~ — carte de visite (recto/verso, générique sans nom de personne ni adresse à la demande de l'utilisateur) et signature email générées le 2026-07-30, voir `identite-visuelle/`. Favicon et apple-touch-icon dédiés déjà en place depuis la passe perf/SEO.

## CODEBASE_MAP.md

Généré et à jour à la racine du projet — le consulter avant d'ouvrir un fichier source pour savoir où écrire.
