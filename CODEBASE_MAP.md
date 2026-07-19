# CODEBASE_MAP.md

Index de navigation du site Soly'bat (11ty). Voir `CLAUDE.md` pour la stack et les commandes, `BRAND.md` pour la marque, `docs/superpowers/plans/2026-07-17-site-solybat.md` pour le détail de chaque page.

## eleventy.config.cjs
Config 11ty (CommonJS — voir piège toolchain dans CLAUDE.md) : dossiers d'entrée/sortie, passthrough copy CSS/JS/images/PHP/`manifest.json`/`.htaccess`.

## src/_includes/layouts/base.njk
Layout HTML commun à toutes les pages : head (title, description, canonical, Open Graph/Twitter Card avec `og-image.jpg` dédiée 1200×630, JSON-LD `GeneralContractor` avec `areaServed`, `noindex` optionnel via front-matter), manifest/apple-touch-icon/theme-color, polices Google Fonts en `<link rel="preconnect">`+`<link rel="stylesheet">` (plus de `@import` bloquant dans le CSS, graisses limitées à celles réellement utilisées : Fraunces 600, Inter 400/600), lien d'évitement `.lien-evitement` avant le header, header, footer, imports CSS/JS.

## src/_data/site.json
Données globales : `url` (placeholder `https://www.solybat.fr`, utilisé pour canonical/OG/sitemap.xml/robots.txt), `telephone`/`telephoneLien`/`email` (coordonnées fictives `02 48 00 00 00` / `contact@solybat.fr`, utilisées dans le footer et les mentions légales) — toutes à remplacer par les vraies valeurs avant mise en ligne.

## src/manifest.json
Web App Manifest (icônes, `theme_color`/`background_color` de marque, `display: standalone`) — copié tel quel vers `_site/manifest.json`, référencé depuis `base.njk`.

## src/.htaccess
Config Apache pour l'hébergement Hostinger/OVH — copiée tel quelle vers `_site/.htaccess` : redirection HTTPS forcée, `ErrorDocument 404 /404.html`, compression (mod_deflate), cache navigateur long (1 an) sur CSS/JS/images via `mod_expires`/`Header`, en-têtes de sécurité de base (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`), type MIME du manifest. Non testable en local (pas de serveur Apache dans l'environnement de dev) — à vérifier après déploiement.

## src/sitemap.njk
Génère `/sitemap.xml` à partir de `collections.all` (exclut lui-même, 404 et devis-merci via `eleventyExcludeFromCollections`).

## src/robots.txt
Copié tel quel (passthrough) vers `_site/robots.txt`, référence `sitemap.xml`.

## src/_includes/composants/header.njk
Header partagé : logo (image `/images/logo-solybat.png`, fond transparent), nav principale avec `aria-current="page"` sur le lien de la page courante (couvre aussi le CTA `/devis/` et les sous-pages `/realisations/[slug]/`), CTA devis (classes `bouton bouton--principal header__cta`, réutilise le style de bouton partagé), menu mobile.

## src/_includes/composants/placeholder-photo.njk
Macro d'emplacement photo manquante : motif du sceau en filigrane sur fond dégradé crème/bois-brûlé + légende "Photo à venir", réutilisée par le hero et les cartes réalisations.
- placeholderPhoto(rotation) — emplacement stylisé, pivoté pour éviter la répétition visuelle

## src/_includes/composants/hero-photos.njk
Macro de hero plein cadre à 1-3 photos (triptyque comme référence), overlay texte + CTA sur le premier panneau ; bascule automatiquement du placeholder à une vraie photo dès que les données la fournissent. Premier panneau (candidat LCP) en `fetchpriority="high"`, tous en `decoding="async"`, aucun n'est `loading="lazy"` (déjà dans le viewport initial).
- heroPhotos(titre, sousTitre, photos, ctaTexte, ctaLien, compact) — hero flexible plein cadre

## src/_includes/composants/footer.njk
Footer partagé : nom, zone d'intervention, coordonnées (`tel:`/`mailto:` depuis `_data/site.json`, valeurs fictives à remplacer), liens vers toutes les pages.

## src/_includes/composants/sceau.njk
Macro SVG du motif signature (bulle de niveau) — réutilisée dans la frise process et le bloc « chantier garanti », pas pour le logo complet (voir header/hero qui utilisent l'image PNG). `decoratif=true` bascule en `aria-hidden="true"` (usages répétés/redondants avec le texte adjacent) au lieu de `role="img" aria-label`.
- sceau(taille, avecTexte, decoratif) — cercle terracotta + bulle paramétrable

## src/_includes/composants/frise-process.njk
Macro de la frise des 4 étapes du chantier, avec ou sans délais. Sceaux en `decoratif=true` (répétés 4x, redondants avec les `<h3>` numérotés).
- friseProcess(detaillee) — 4 étapes, délais si detaillee=true

## src/_includes/composants/carte-realisation.njk
Macro de vignette projet (ombre, radius, léger soulèvement au survol), fallback vers placeholder-photo si pas de photo. Image en `loading="lazy" decoding="async"` (sous la ligne de flottaison).
- carteRealisation(projet) — carte avec data-attributs pour filtre JS

## src/_includes/composants/formulaire-devis.njk
Formulaire de devis : profil (boutons radio natifs stylés en pilules via `:has(input:checked)`, fonctionne nativement sans JS), champs communs, blocs conditionnels, honeypot anti-spam.

## src/404.njk
Page 404 avec lien retour accueil. `noindex: true` + exclue du sitemap (`eleventyExcludeFromCollections`).

## src/index.njk
Accueil : hero-photos (triptyque plein cadre, `heroPhotos` en front matter), frise process, aperçu réalisations, pour qui, garanties (sceau motif), CTA.

## src/renovation-location.njk
Hero-photos + présentation de l'offre avec onglets par profil (agence/investisseur/particulier), pattern ARIA Tabs complet (voir `js/onglets.js`).

## src/realisations/index.njk
Hero-photos compact (1 photo) + galerie de réalisations filtrable côté client par type de bien et ampleur. `<h2 class="sr-only">` avant la grille pour éviter un saut h1→h3.

## src/realisations/projet.njk
Fiche projet individuelle, générée par pagination 11ty sur `_data/realisations.json`. Fallback placeholder-photo si pas de photos avant/après. Curseur du slider avec `role="slider"`/`tabindex="0"`/`aria-value*` (piloté au clavier par `slider-avant-apres.js`). Le `<title>` de page utilise une variante de `projet.titre` sans le tiret cadratin interne (`replace(' — ', ', ')`) pour éviter le double tiret avant « — Soly'bat ». Photo "avant" en `fetchpriority="high"` (candidat LCP de la page), les deux calques en `decoding="async"`.

## src/process.njk
Détail des 4 étapes avec délais moyens (frise en mode détaillé). `<h2 class="sr-only">` intermédiaire avant la frise pour éviter un saut h1→h3. `<h1>` précédé du sceau (`.entete-page`) : seule touche de marque de la page, qui n'a pas de photo (contrairement au reste du site porté par la photographie de chantier).

## src/espace-pro.njk
Hero-photos + page dédiée agences/gestionnaires, plaquette PDF en préparation avec lien de repli vers `/devis/` (plus de `<span aria-disabled>` invalide, encart `.plaquette-a-venir` à liseré plein plutôt qu'en pointillés).

## src/a-propos.njk
Histoire, valeurs, zone d'intervention (50 km autour de Vierzon). `<h1>` précédé du sceau (`.entete-page`), seule touche de marque de la page (pas de photo).

## src/faq.njk
5 questions/réponses en accordéon natif `<details>` (aucun JS requis). Le délai moyen annoncé (7 à 11 semaines) couvre diagnostic+devis+chantier, cohérent avec le détail donné par `frise-process.njk` en mode détaillé. `<h1>` précédé du sceau (`.entete-page`), seule touche de marque de la page (pas de photo).

## src/devis.njk
Page du formulaire de demande de devis, en grille 2 colonnes dès 900px (`.devis`) : formulaire (`.devis__formulaire`) + encart de réassurance (`.devis__reassurance`, sceau + 4 points clés) qui occupe l'espace resté vide à droite du formulaire sur grand écran.

## src/devis-merci.njk
Page de confirmation après soumission réussie du formulaire de devis.

## src/mentions-legales.njk
Mentions légales. Téléphone/email depuis `_data/site.json` (fictifs, formatés en `tel:`/`mailto:`). SIRET, adresse, assurances, hébergeur, CGV, confidentialité restent des placeholders explicites `[... à compléter]` — volontairement non fabriqués (risque juridique d'un faux SIRET/CGV présenté comme réel).

## src/_data/realisations.json
Données des projets (4 exemples) : slug, type, ampleur, photos, corps de métier. `appartement-t3-vierzon-centre` a désormais de vraies photos avant/après (`t3-vierzon-avant.png` / `t3-vierzon-apres.png`), les 3 autres projets restent en placeholder.

## src/images/realisations/
18 photos réelles/générées de chantier, désormais en **JPEG** (converties depuis PNG, qualité 82 : 23,4 Mo → 2,5 Mo au total, -89%, aucune perte visible à l'écran — c'étaient des photos, pas des aplats, le PNG était le mauvais format). Référencées par `image:`/`photos.avant`/`photos.apres` dans les front-matters et `realisations.json` — voir `docs/prompts-photos.md` pour le mapping (18 emplacements, tous pourvus : hero accueil ×3, hero renovation-location ×3, hero réalisations ×1, hero espace-pro ×3, + avant/après des 4 réalisations). `cuisine-renovee.jpg` (accueil, régénérée) est volontairement laissée nette/léchée pour suggérer une photo prise par un professionnel sur la page d'accueil ; `sejour-renove.jpg`/`piece-a-renover.jpg` (autres photos hero de l'accueil) suivent la même logique. Les 15 autres fichiers sont passés par `post_traitement.py` (`--intensite moyenne`) pour un rendu plus crédible "photo de chantier au smartphone" (grain, léger flou, inclinaison + recadrage asymétrique, exposition irrégulière, vignettage, artefacts JPEG). Versions antérieures : `photos/_avant-correction-ia/` (artefact IA retiré), `photos/_avant-post-traitement/` (avant le passage smartphone), `photos/_avant-compression-jpeg/` (PNG originaux avant conversion JPEG).

## src/js/main.js
Point d'entrée JS unique, importe et initialise tous les modules interactifs.

## src/js/nav.js
Toggle du menu mobile.
- calculerProchainEtat(etatOuvert) — inverse l'état ouvert/fermé (pur)
- initNav() — câble le clic sur le bouton menu

## src/js/onglets.js
Système d'onglets accessible (pattern ARIA Tabs complet : `aria-controls`/`aria-labelledby`/roving `tabindex`) pour la page renovation-location.
- calculerOngletActif(boutons, cible) — trouve l'index du bouton actif (pur)
- initOnglets() — câble les clics + navigation clavier (flèches/Home/End), active le premier onglet

## src/js/filtre-galerie.js
Filtrage client-side de la galerie de réalisations.
- filtrerRealisations(realisations, filtres) — filtre par type/ampleur (pur)
- initFiltreGalerie() — lit le DOM, câble les selects

## src/js/slider-avant-apres.js
Slider de comparaison avant/après, pilotable à la souris/tactile (glisser-déposer) et au clavier (flèches/Home/End sur le curseur, pas de 5%).
- calculerPositionPourcentage(clientX, rectLeft, rectWidth) — position curseur bornée (pur)
- initSliderAvantApres() — câble les événements pointer + clavier, met à jour `aria-valuenow`

## src/js/form-devis.js
Validation et soumission du formulaire de devis, avec pré-remplissage après erreur serveur. Sélection de profil via de vrais boutons radio (`change`), plus de champ caché synchronisé en JS.
- validerFormulaire(donnees) — valide profil/nom/email/message (pur)
- initFormDevis() — sélection profil (coche le radio correspondant), validation, relit les query params d'erreur

## src/css/tokens.css
Design tokens : couleurs, typographies, espacements, + rayons (`--rayon-controle` pour les contrôles, `--rayon-surface` pour photos/cartes), ombres et transition partagée. `--couleur-terracotta-texte` : variante assombrie du terracotta (#AD4826), réservée aux fonds portant du texte crème clair — le terracotta standard n'atteint que 4,49:1 (sous le seuil AA 4,5:1) avec `--couleur-creme-claire` en texte.

## src/css/base.css
Reset, styles globaux, classes utilitaires (`.bouton` avec hover/focus, `.conteneur`, `.entete-page` pour l'icône sceau à côté d'un `<h1>`/`<h2>` de page), `:focus-visible` global, `overflow-x: hidden` (nécessaire pour le hero plein cadre en 100vw), `.lien-evitement` (skip link, visible seulement au focus clavier). Polices Google Fonts chargées depuis `base.njk` (`<link>`, plus de `@import` bloquant ici). Liens en `--couleur-bois-brule` par défaut (contraste AA sur fond crème, ~4,0:1 avec terracotta ne suffisait pas), `--couleur-terracotta` au hover/focus uniquement. `.bouton--principal` en `--couleur-terracotta-texte` (pas `--couleur-terracotta`, insuffisant en contraste avec le texte crème clair). `section` utilise `padding-block` et `.conteneur` utilise `padding-inline` (propriétés logiques sur des axes distincts, plus le raccourci `padding`) pour éviter que la spécificité de classe de `.conteneur` n'annule le padding vertical voulu par le sélecteur de type `section` — ce bug annulait tout le padding haut/bas de `<section class="conteneur">` sur tout le site (contenu collé au header et au footer sur Process/FAQ/À propos/Devis/Mentions légales). `section + section { padding-top: 0 }` évite que deux `<section>` empilées (accueil) ne cumulent 2× le padding.

## src/css/styles.css
Point d'entrée CSS, `@import` de tous les fichiers de composants/pages (inclut désormais `placeholder-photo.css` et `hero-photos.css`).

## src/css/placeholder-photo.css
Styles du motif placeholder signature (dégradé + sceau en filigrane pivoté + légende italique).

## src/css/hero-photos.css
Styles du hero plein cadre (breakout 100vw), grilles 1/2/3 panneaux, voile de contraste + texte superposé sur le premier panneau, variante `--compacte`.

## src/css/sceau.css / header.css / footer.css / hero.css / frise.css / carte.css / onglets.css / galerie.css / slider.css / espace-pro.css / faq.css / formulaire.css
Un fichier par composant/page, tokens uniquement, pas de couleur en dur. `hero.css` ne couvre plus que "pour qui"/"garanties"/aperçu réalisations (l'ancien hero centré est remplacé par `hero-photos.css`). Contrôles/boutons/champs/onglets/liens ont des états hover/focus-visible avec transition. `frise.css`/`hero.css`/`galerie.css` : palier tablette à 2 colonnes (`max-width: 900px`) avant le passage à 1 colonne (`max-width: 560px`). `header.css` : `.header__cta` réutilise `.bouton.bouton--principal`, surchargé via `.header__nav a.header__cta` (spécificité suffisante pour battre `.header__nav a` sans `!important`). `footer.css` : hover/focus des liens en `--couleur-creme-sable` + soulignement (le terracotta était quasi invisible sur le fond bois brûlé, ~1,6:1), `outline-color` du focus-visible forcée en crème claire dans le footer. `galerie.css` : `select` en `font: inherit` (sinon le texte des filtres retombe sur la police système au lieu d'Inter). `slider.css` : `.slider-avant-apres__calque` (les `<img>` avant/après) en `width/height: 100%; object-fit: cover` — sans ça l'image ne remplissait pas le cadre `aspect-ratio: 4/3` sur les viewports où sa largeur naturelle (~980px) est inférieure à la largeur du conteneur (jusqu'à ~1140px en desktop), laissant une bande crème vide sur le bord droit. `espace-pro.css` : `.plaquette-a-venir` en encart à liseré terracotta plein (`border-left`), plus la bordure pointillée qui se lisait comme un placeholder de maquette oublié. `formulaire.css` : bouton de profil = `<label>` habillant un radio cadré (`:has(input:checked)`, fond en `--couleur-terracotta-texte` — même correctif de contraste que `.bouton--principal`), message d'erreur en anthracite + liseré terracotta (le texte terracotta seul n'atteignait pas 4,5:1). `.devis`/`.devis__reassurance` : grille 2 colonnes (`minmax(0,600px) 1fr` dès 900px, empilée en dessous) pour le formulaire + l'encart de réassurance de `devis.njk`, qui comblent le vide à droite du formulaire sur grand écran.

## src/images/logo-solybat.png
Logo Soly'bat (644×635), fond détouré en transparent (flood-fill par tolérance de couleur) — utilisé dans le header et repris pour le hero photo. Quantifié en PNG palette (128 couleurs, `Image.FASTOCTREE`) : 193 Ko → 30 Ko, sans perte visible (peu de couleurs réelles, le poids venait de l'anti-aliasing des bords). Fichier source à la racine du projet toujours opaque, non modifié.

## src/images/favicon.png
Favicon dédié (256×256, transparent), recadré serré autour du sceau à partir du logo détouré, pour rester lisible en petite taille dans l'onglet du navigateur. Même quantification palette que le logo : 48 Ko → 10 Ko.

## src/images/apple-touch-icon.png
Icône iOS "ajouter à l'écran d'accueil" (180×180), générée depuis `favicon.png` avec fond crème sable opaque (iOS n'accepte pas la transparence). Référencée dans `base.njk`.

## src/images/og-image.jpg
Image de partage réseaux sociaux (1200×630, format standard Open Graph), composée par script (logo centré sur fond crème sable) plutôt qu'un recadrage du logo carré — évite un logo écrasé/pixelisé au partage d'un lien. Référencée dans `base.njk` (`og:image`/`twitter:image`).

## tests/nav.test.js / onglets.test.js / filtre-galerie.test.js / slider-avant-apres.test.js / form-devis.test.js
Tests `node --test` des fonctions pures de chaque module JS (14 tests au total).

## tests/test-devis-validation.php
Script `assert()`-style (pas de framework) pour `devis-validation.php` : données valides/incomplètes, détection honeypot, neutralisation d'injection d'en-tête. Lancer avec `php tests/test-devis-validation.php` — pas encore exécuté (PHP non installé en dev), à vérifier dès que possible.

## devis-validation.php
Logique pure du formulaire de devis : `estHoneypotRempli()`, `nettoyerValeur()` (neutralise l'injection d'en-têtes email via `\r\n`), `validerDonnees()` (profil/nom/email/message, retourne `['valide' => bool, 'erreurs' => array]`). Consommé par `traiter-devis.php` et `tests/test-devis-validation.php`.

## traiter-devis.php
Handler POST du formulaire de devis, copié tel quel vers `_site/`. Rejette le honeypot silencieusement (redirection succès sans envoi), redirige vers `/devis/?erreur=1&...` avec les valeurs saisies repassées en query string si la validation serveur échoue (page `/devis/` statique, relu côté client par `form-devis.js`), sinon envoie l'email via `mail()` et redirige vers `/devis-merci/`. `$adresseContact` est un placeholder codé en dur (`contact@solybat.fr`, à synchroniser avec `src/_data/site.json > email` une fois l'adresse réelle connue — PHP n'a pas accès à `site.json` en production, seul `_site/` est déployé). **Non vérifié avec `php -l`/exécution réelle : PHP n'est pas installé sur la machine de dev** — code recopié du plan déjà réalisé (`docs/superpowers/plans/2026-07-17-site-solybat.md` Task 18), à valider une fois PHP disponible (local ou sur l'hébergement).
