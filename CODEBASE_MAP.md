# CODEBASE_MAP.md

Index de navigation du site Soly'bat (11ty). Voir `CLAUDE.md` pour la stack et les commandes, `BRAND.md` pour la marque, `docs/superpowers/plans/2026-07-17-site-solybat.md` pour le détail de chaque page.

## eleventy.config.cjs
Config 11ty (CommonJS — voir piège toolchain dans CLAUDE.md) : dossiers d'entrée/sortie, passthrough copy CSS/JS/images/documents/PHP/`manifest.json`/`.htaccess`, plus trois ajouts de la passe perf du 2026-08-19 :
- filtre `dimensionsImage(cheminSite)` — lit les dimensions natives d'une image (cache par build) pour écrire `width`/`height` sur chaque `<img>` et supprimer le décalage de mise en page
- donnée globale `modulesJs` — liste les modules ES à précharger, consommée par `base.njk` (`<link rel="modulepreload">`)
- hook `eleventy.after` → `assemblerFeuillesDeStyle()` — assemble les 21 feuilles en un seul `_site/css/styles.css` minifié, **et supprime les feuilles individuelles de `_site/css/`** (elles ne sont plus référencées ; les laisser reviendrait à téléverser une seconde copie du CSS en FTP)

## lib/assembler-css.cjs
Résolution des `@import` et minification prudente, en CommonJS (la config 11ty doit rester CJS). Testé par `tests/assembler-css.test.js`.
- resoudreImports(contenu, lireFichier) — inline récursif, un import déjà vu est ignoré (pas de boucle infinie), un import introuvable est conservé tel quel plutôt que perdu
- minifierCss(css) — retire commentaires et espaces superflus. **Ne touche volontairement pas aux espaces autour de `:` ni des combinateurs** (`a :hover` ≠ `a:hover`), et recopie le contenu des chaînes à l'identique pour préserver les `url("data:image/svg+xml,…")`
- assembler(contenuRacine, lireFichier) — les deux en une passe

## lib/synthese-rentabilite.cjs
Agrégats des opérations chiffrées, calculés au build et exposés en donnée globale `syntheseRentabilite`. Écrire « 8/8 » en dur dans le gabarit le rendrait faux à la première opération ajoutée dans `retoursClients.json` ; ici le chiffre suit la donnée. Testé par `tests/synthese-rentabilite.test.js`.
- calculerSynthese(operations) — comptages, moyennes, bornes, cumuls, plus des `libelles` prêts à afficher et **volontairement lisibles par `analyserValeur()` de `compteurs.js`** (sinon l'animation écraserait le texte)
- meilleuresOperations(operations, n) — les n plus rentables, tri stable
- lireNombre(valeur) — retourne `null` et non `NaN` sur une entrée illisible : un NaN se propagerait silencieusement dans toutes les moyennes

## lib/dimensions-image.cjs
Lecture des dimensions dans l'en-tête binaire, sans dépendance (le projet n'a aucune bibliothèque d'image et on n'a besoin que de deux entiers). Testé par `tests/dimensions-image.test.js`.
- lireDimensions(donnees) — PNG (bloc IHDR) ou JPEG (marqueur SOF), null si format inconnu ou fichier tronqué
- Piège traité : dans un JPEG, les marqueurs 0xC4/0xC8/0xCC sont dans la plage des SOF sans en être — les confondre donne des dimensions absurdes

## src/documents/
Fichiers statiques copiés tels quels (`documents/` en sortie). Contient `plaquette-solybat.pdf` (**3 pages A4 paysage**, liée depuis `espace-pro.njk`), **produit dérivé de `identite-visuelle/plaquette-solybat.html`** — ne jamais tenter de modifier le PDF, éditer le HTML puis relancer `msedge --headless=new --no-pdf-header-footer --print-to-pdf` (commande complète dans `identite-visuelle/README.md`). `npm run build` recopie le PDF tel quel mais ne le regénère pas.

## identite-visuelle/
Déclinaisons du logo hors site (pas buildées par 11ty) : `carte-visite-recto.png`/`-verso.png` (1004×650 px/300 dpi, génériques sans nom de personne ni adresse, cf. CLAUDE.md), `signature-email-solybat.html` (bloc HTML table-based à coller dans un client mail, référence `https://www.solybat18.fr/images/signature-sceau.png` — ne s'affichera qu'une fois le site déployé), `signature-email-apercu.png` (rendu de contrôle). Contient aussi `plaquette-solybat.html` (source de `src/documents/plaquette-solybat.pdf`, **A4 paysage, 3 pages** : couverture typographique anthracite — pas de photo, les photos disponibles étant des rendus IA qu'une agence repère —, puis « ce que nous prenons en charge » (9 corps de métier, frise process horizontale, 4 raisons), puis la preuve chiffrée (4 agrégats + les 3 meilleures opérations). Le logo se pose tel quel sur l'anthracite : son disque intérieur est crème, seul le pourtour du cercle est détouré, donc **aucune variante inversée n'est nécessaire**. Les chiffres de la page 3 sont écrits en dur et gardés par `tests/plaquette.test.js`) et `publicite-climatisation.html`/`.png` (1080×1350, publicité climatisation réseaux sociaux/impression, générée le 2026-08-01 : reproduction ton/palette Soly'bat d'une publicité concurrente fournie par l'utilisateur, prix "à partir de 2 500 € HT" conservé, mention TVA reprise du bandeau du site — "possible sous conditions" — voir détail dans `identite-visuelle/README.md`). Voir `identite-visuelle/README.md`.

## src/_includes/layouts/base.njk
Layout HTML commun à toutes les pages : head (title, description, canonical, Open Graph/Twitter Card avec `og-image.jpg` dédiée 1200×630, JSON-LD `GeneralContractor` avec `areaServed`, `noindex` optionnel via front-matter), manifest/apple-touch-icon/theme-color, polices Google Fonts en `<link rel="preconnect">`+`<link rel="stylesheet">` (plus de `@import` bloquant dans le CSS, graisses limitées à celles réellement utilisées : Fraunces 600, Inter 400/600), lien d'évitement `.lien-evitement` avant le header, bandeau nouveauté (`composants/bandeau-nouveaute.njk`) juste après, header, footer, imports CSS/JS. Barre d'appel mobile (`.barre-appel-mobile`, lien `tel:` avec `icone-telephone.njk`) juste avant le script, fixée en bas de viewport uniquement sous 1100px (CSS dans `barre-appel.css`) — redondante avec le lien téléphone du header qui, lui, n'est visible qu'en desktop.

## src/_includes/composants/bandeau-nouveaute.njk
Bandeau global statique (pas de JS, pas de bouton fermer), affiché sur toutes les pages au-dessus du header. Annonce actuelle : pose de climatisation via partenaires certifiés RGE, TVA 5,5% formulée "sous conditions" (pas affirmée comme acquise pour toute pose — le type d'équipement exact ouvrant droit au taux réduit n'était pas confirmé par le client). Lien vers `/renovation-location/`.

## src/_data/site.json
Données globales, toutes réelles depuis 2026-07-20 (communiquées par le client) : `url` (`https://www.solybat18.fr`, utilisé pour canonical/OG/JSON-LD/sitemap.xml), `telephone`/`telephoneLien` (`06 14 59 13 74` / `+33614591374`), `email` (`solybat@gmail.com`) — utilisées dans le footer, les mentions légales et le JSON-LD. `src/robots.txt` référence aussi le domaine mais n'est pas piloté par ce fichier (passthrough statique, mis à jour séparément).

## src/manifest.json
Web App Manifest (icônes, `theme_color`/`background_color` de marque, `display: standalone`) — copié tel quel vers `_site/manifest.json`, référencé depuis `base.njk`.

## src/.htaccess
Config Apache pour l'hébergement Hostinger/OVH — copiée tel quelle vers `_site/.htaccess` : redirection HTTPS forcée, `ErrorDocument 404 /404.html`, compression (mod_deflate), cache navigateur long (1 an) sur CSS/JS/images via `mod_expires`/`Header`, en-têtes de sécurité de base (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`), type MIME du manifest. Non testable en local (pas de serveur Apache dans l'environnement de dev) — à vérifier après déploiement.

## src/sitemap.njk
Génère `/sitemap.xml` à partir de `collections.all` (exclut lui-même, 404 et devis-merci via `eleventyExcludeFromCollections`).

## src/robots.txt
Copié tel quel (passthrough) vers `_site/robots.txt`, référence `sitemap.xml`.

## src/_includes/composants/header.njk
Header partagé : logo (image `/images/logo-solybat.png`, fond transparent), lien téléphone cliquable (`tel:`, icône `icone-telephone.njk`) en première position de la nav — visible en permanence en desktop, replié avec le reste de la nav dans le menu mobile (redondant avec `barre-appel-mobile` du layout, qui couvre le cas mobile fermé), nav principale avec `aria-current="page"` sur le lien de la page courante (couvre aussi le CTA `/devis/` et les sous-pages `/realisations/[slug]/`), CTA devis (classes `bouton bouton--principal header__cta`, réutilise le style de bouton partagé), menu mobile.

## src/_includes/composants/icone-telephone.njk
Macro SVG minimaliste (trait, `currentColor`) du pictogramme téléphone — réutilisée dans le header (desktop) et la barre d'appel mobile (`base.njk`).
- iconeTelephone(taille) — icône combiné téléphone, taille paramétrable

## src/_includes/composants/placeholder-photo.njk
Macro d'emplacement photo manquante : motif du sceau en filigrane sur fond dégradé crème/bois-brûlé + légende "Photo à venir", réutilisée par le hero et les cartes réalisations.
- placeholderPhoto(rotation) — emplacement stylisé, pivoté pour éviter la répétition visuelle

## src/_includes/composants/hero-photos.njk
Macro de hero plein cadre à 1-3 photos (triptyque comme référence), overlay texte + CTA sur le premier panneau ; bascule automatiquement du placeholder à une vraie photo dès que les données la fournissent. Premier panneau (candidat LCP) en `fetchpriority="high"`, tous en `decoding="async"`, aucun n'est `loading="lazy"` (déjà dans le viewport initial). CTA secondaire "Appeler" optionnel (`telephone`/`telephoneLien`, `.bouton--secondaire` surchargé en crème claire pour rester lisible sur l'overlay sombre) affiché à côté du CTA principal — passé depuis l'accueil, `/renovation-location` et `/espace-pro` (pas la galerie réalisations, hero compact sans CTA par choix de design).
- heroPhotos(titre, sousTitre, photos, ctaTexte, ctaLien, compact, telephone, telephoneLien) — hero flexible plein cadre

## src/_includes/composants/footer.njk
Footer partagé : nom, zone d'intervention, coordonnées (`tel:`/`mailto:` depuis `_data/site.json`, valeurs fictives à remplacer), liens vers toutes les pages.

## src/_includes/composants/sceau.njk
Macro SVG du motif signature (bulle de niveau) — réutilisée dans la frise process et le bloc « chantier garanti », pas pour le logo complet (voir header/hero qui utilisent l'image PNG). `decoratif=true` bascule en `aria-hidden="true"` (usages répétés/redondants avec le texte adjacent) au lieu de `role="img" aria-label`.
- sceau(taille, avecTexte, decoratif) — cercle terracotta + bulle paramétrable

## src/_includes/composants/frise-process.njk
Macro de la frise des 4 étapes du chantier, avec ou sans délais. Sceaux en `decoratif=true` (répétés 4x, redondants avec les `<h3>` numérotés).
- friseProcess(detaillee) — 4 étapes, délais si detaillee=true

## src/_includes/composants/carte-realisation.njk
Macro de vignette projet (ombre, radius, léger soulèvement au survol), fallback vers placeholder-photo si pas de photo. Image en `loading="lazy" decoding="async"` (sous la ligne de flottaison). Affiche aussi les corps de métier (`projet.corpsDeMetier`) en pastilles (`.carte-realisation__corps-de-metier`) sous la surface/durée, pour expliciter les travaux dès l'aperçu (accueil + galerie), pas seulement sur la fiche projet.
- carteRealisation(projet) — carte avec data-attributs pour filtre JS

## src/_includes/composants/formulaire-devis.njk
Formulaire de devis : profil (boutons radio natifs stylés en pilules via `:has(input:checked)`, fonctionne nativement sans JS), champs communs, blocs conditionnels, honeypot anti-spam.

## src/404.njk
Page 404 avec lien retour accueil. `noindex: true` + exclue du sitemap (`eleventyExcludeFromCollections`).

## src/_includes/composants/hero-3d.njk
Hero de l'accueil depuis la refonte 2026-08-19 : `<canvas>` piloté par `src/js/hero-3d/`, photo de chantier en repli/fond d'ambiance derrière, voile de lisibilité, titre en lignes masquées révélées une par une. Le texte reste du HTML (indexable, sélectionnable) ; le canvas est `aria-hidden`.
- hero3d(surtitre, lignesTitre, sousTitre, ctaTexte, ctaLien, telephone, telephoneLien, photoRepli, legende)

## src/_includes/composants/bloc-rentabilite.njk
Bloc « Cas chiffrés » de l'accueil (ajouté le 2026-08-19) : 4 chiffres agrégés en compteurs animés, les 3 opérations les plus rentables en cartes, mention des hypothèses, CTA vers `/retour-client/`. Les chiffres viennent de `syntheseRentabilite`, jamais écrits en dur. L'ordre du balisage reste `<dt>` puis `<dd>` (exigé par HTML) ; c'est le CSS qui inverse l'affichage pour mettre le grand chiffre au-dessus de son libellé.
- blocRentabilite(synthese, lienPage)

## src/css/bloc-rentabilite.css
Mise en page du bloc. `flex-direction: column-reverse` sur chaque chiffre (voir ci-dessus), `font-variant-numeric: tabular-nums` pour que le libellé ne sautille pas pendant l'animation du compteur, et `margin-top: auto` sur les chiffres des cartes pour les aligner malgré des titres de longueurs différentes. Mobile : chiffres en 2 colonnes, cartes empilées, bouton pleine largeur (mesuré à 405px : aucun débordement).

## src/_includes/composants/bande-photos.njk
Bande de photos de chantier « preuve », placée juste après le hero 3D de l'accueil — les vraies photos passent en écran 2 au lieu du triptyque de hero. Colonne centrale décalée verticalement pour éviter l'effet bandeau.
- bandePhotos(photos) — photos = [{ image, alt, legende }]

## src/css/hero-3d.css
Mise en page du hero 3D : fond dégradé anthracite, voile orienté (par le bas en portrait, par la gauche en paysage), révélation masquée des lignes du titre. Le bloc `@media (max-width: 760px)` est dimensionné pour que **les CTA tiennent au-dessus de la ligne de flottaison**, barre d'appel fixe déduite (mesuré : 660px de hero, CTA à 767px sur un écran de 844px).

## src/css/bande-photos.css
Grille 3 colonnes décalée de la bande photo, repliée en colonne unique sous 760px (format 3/2 au lieu de 4/5 pour limiter le défilement).

## src/css/sections-sombres.css
Sections anthracite (`.section--sombre`) : grain SVG local (pas de calque plein écran, qui provoquerait des repeintures au scroll), halo terracotta, et toutes les surcharges de lisibilité — sceau (variables de marque redéfinies localement sur le SVG uniquement), liste des corps de métier, cartes, boutons secondaires.

## src/css/mouvement.css
Couche de mouvement transverse, **importée en dernier** pour surcharger les états de survol des composants : apparitions au scroll, basculement 3D des cartes + reflet, header collant condensé, trait de la frise process qui se dessine, transitions de page (View Transitions API), et le bloc `prefers-reduced-motion` qui neutralise tout.

## src/index.njk
Accueil : **hero 3D** (`composants/hero-3d.njk`, maquette WebGL + titre en 3 lignes révélées, CTA devis + appel), puis **bande photos « preuve »** qui récupère les 3 photos réelles de l'ancien triptyque, **publicité climatisation** (carte cliquable vers `/devis/`, image `src/images/publicite-climatisation.png`, ajoutée le 2026-08-02 à la demande du client — voir `identite-visuelle/README.md` pour la source éditable), frise process, aperçu réalisations, pour qui (colonne investisseurs pointe vers `/retour-client/`, "Voir des cas chiffrés"), garanties (sceau motif), CTA final réchauffé ("Discutons de votre projet", boutons appel + devis via `.boutons-groupe`).

## src/renovation-location.njk
Hero-photos (sous-titre citant explicitement les corps de métier, CTA devis + appel — absent avant, ajouté pour cohérence conversion avec les autres heros) + section "Tous corps de métier, un seul interlocuteur" (`.liste-corps-de-metier`, 9 corps de métier dont maçonnerie/plâtrerie/climatisation) + présentation de l'offre avec onglets par profil (agence/investisseur/particulier), pattern ARIA Tabs complet (voir `js/onglets.js`). Climatisation ajoutée (pose via partenaires certifiés RGE) suite à une demande client de mise en avant de ce nouveau service. Le panneau investisseur pointe vers `/retour-client/` ("Voir des cas chiffrés").

## src/retour-client.njk
Page "Retour client" : 8 opérations réelles d'investissement locatif (ex-`Scenarios.md`, chiffres réels communiqués par le client, prénoms des clients perdus). Pas dans le menu principal (accès uniquement via le panneau investisseur de `/renovation-location`), pas de hero-photo (aucune photo disponible pour ces opérations, cohérent avec la règle "jamais de stock"). Mention `.retour-client__avertissement` en haut de page ("les prénoms ont été changés") : les prénoms+initiales de `retoursClients.json` sont fictifs (choisis pour la diversité, cohérents avec le bassin de population de Vierzon) alors que les chiffres sont réels — présenter des prénoms inventés sans cette mention aurait constitué un faux témoignage client (pratique commerciale trompeuse, Code de la consommation art. L121-1). Légende des 3 termes financiers (rentabilité brute/cash-flow/DSCR) affichée une fois en haut de page. Avertissement de bas de page repris de `Scenarios.md` (financement 100 % non garanti).

## src/_data/retoursClients.json
8 profils anonymisés pour `retour-client.njk` : prénom+initiale fictifs, type de bien, quartier, description travaux, et les vraies données chiffrées (prix, travaux, coût total, loyer, crédit, rentabilité brute, cash-flow, DSCR) reprises telles quelles de `Scenarios.md`.

## src/_includes/composants/carte-retour-client.njk
Macro de carte profil pour `/retour-client/` : pas de photo (texte + `<dl>` de chiffres clés uniquement), pattern visuel proche de `carte-realisation.njk` mais sans lien cliquable (pas de fiche détail individuelle).
- carteRetourClient(retour) — carte profil + chiffres, sans photo

## src/realisations/index.njk
Hero-photos compact (1 photo) + galerie de réalisations filtrable côté client par type de bien et ampleur. `<h2 class="sr-only">` avant la grille pour éviter un saut h1→h3.

## src/realisations/photos-vrac.njk
Page "photos de chantier en vrac" : grille de 41 photos issues de `photos_farid/` (tout le dossier, y compris chantiers hors périmètre habituel du site — extérieur/tertiaire — et 2 rendus 3D, présentés comme réalisations Soly'bat à la demande explicite de l'utilisateur malgré la réserve de provenance signalée). Chaque vignette est un `<a target="_blank">` vers l'image pleine taille, pas de lightbox JS (cohérent avec la règle de marque "mouvement minimal"). Lien depuis `/realisations/index.njk` (`.galerie__plus-de-photos`).

## src/_data/photosVrac.json
Liste des 43 photos de `photos-vrac.njk` (nom de fichier + texte alternatif descriptif). Les 41 premières dérivent de `photos_farid/CONTENU.md` (provenance non vérifiée, voir note ci-dessous). Les 2 dernières (`chantier-11-*`) sont des photos réelles fournies directement par l'utilisateur le 2026-08-01 (captures depuis son téléphone) : plâtrerie (enduit de plafond sur échafaudage) et combles en cours d'isolation — pas de réserve de provenance sur celles-ci.

## src/images/photos-vrac/
43 photos. 41 redimensionnées depuis `photos_farid/*.jpeg` (1200px de long côté, JPEG qualité 82, EXIF non préservé) — 12,2 Mo → 5,3 Mo au total, générées par un script Python one-off (Pillow), non versionné. Les 2 `chantier-11-*` ajoutées le 2026-08-01 depuis des photos fournies par l'utilisateur (recompressées JPEG qualité 82, déjà sous 1200px de long côté donc pas de redimensionnement).

## src/realisations/projet.njk
Fiche projet individuelle, générée par pagination 11ty sur `_data/realisations.json`. Trois états : slider avant/après si les deux photos existent ; sinon photo "après" seule dans `.projet__photo-seule` si `photos.apres` existe sans `avant` (cas des projets avec une seule vraie photo dispo, ex. `local-commercial-transforme-saint-florent`) ; sinon fallback placeholder-photo. Curseur du slider avec `role="slider"`/`tabindex="0"`/`aria-value*` (piloté au clavier par `slider-avant-apres.js`). Le `<title>` de page utilise une variante de `projet.titre` sans le tiret cadratin interne (`replace(' — ', ', ')`) pour éviter le double tiret avant « — Soly'bat ». Photo "avant" (ou "après" seule) en `fetchpriority="high"` (candidat LCP de la page), les calques du slider en `decoding="async"`.

## src/process.njk
Détail des 4 étapes avec délais moyens (frise en mode détaillé). `<h2 class="sr-only">` intermédiaire avant la frise pour éviter un saut h1→h3. `<h1>` précédé du sceau (`.entete-page`) : seule touche de marque de la page, qui n'a pas de photo (contrairement au reste du site porté par la photographie de chantier).

## src/espace-pro.njk
Hero-photos (CTA devis + appel, ajouté pour cohérence conversion) + page dédiée agences/gestionnaires. Lien de téléchargement direct vers `documents/plaquette-solybat.pdf` (le lien de repli vers `/devis/` et le CSS `.plaquette-a-venir`/`espace-pro.css` ont été supprimés le 2026-07-30, la plaquette étant désormais disponible).

## src/a-propos.njk
Histoire, valeurs, zone d'intervention (Vierzon et les communes alentour — Bourges, Issoudun, Romorantin-Lanthenay). **Aucun rayon en kilomètres n'est annoncé** : la mention « rayon d'environ 50 km » a été retirée le 2026-08-24 à la demande du client, des 6 emplacements où elle figurait (ce fichier, le chapeau et le `<h2>` de cette page, la réponse FAQ « Intervenez-vous en dehors de Vierzon ? », le surtitre du hero d'accueil, le footer et l'`areaServed` du JSON-LD). `<h1>` précédé du sceau (`.entete-page`), seule touche de marque de la page (pas de photo).

## src/faq.njk
5 questions/réponses en accordéon natif `<details>` (aucun JS requis). Le délai moyen annoncé (7 à 11 semaines) couvre diagnostic+devis+chantier, cohérent avec le détail donné par `frise-process.njk` en mode détaillé. `<h1>` précédé du sceau (`.entete-page`), seule touche de marque de la page (pas de photo).

## src/devis.njk
Page du formulaire de demande de devis, en grille 2 colonnes dès 900px (`.devis`) : formulaire (`.devis__formulaire`) + encart de réassurance (`.devis__reassurance`, sceau + 4 points clés + mention "Vous préférez nous appeler directement ?" en pied d'encart, `.devis__appel`) qui occupe l'espace resté vide à droite du formulaire sur grand écran.

## src/devis-merci.njk
Page de confirmation après soumission réussie du formulaire de devis.

## src/mentions-legales.njk
Mentions légales. Téléphone/email depuis `_data/site.json` (fictifs, formatés en `tel:`/`mailto:`). SIRET, adresse, assurances, hébergeur, CGV, confidentialité restent des placeholders explicites `[... à compléter]` — volontairement non fabriqués (risque juridique d'un faux SIRET/CGV présenté comme réel).

## src/_data/realisations.json
Données des projets (6 exemples) : slug, type, ampleur, photos, corps de métier. Les 4 premiers ont des photos avant/après démo générées par IA (JPEG). `maison-mitoyenne-mehun-sur-yevre` a un vrai couple avant/après (`mehun-sur-yevre-avant.jpg`/`-apres.jpg`, salle de bain), issu de `photos_farid/` (lot de photos réelles de chantiers tiers fournies par l'utilisateur, sans lien vérifié avec un chantier Soly'bat identifié — voir `photos_farid/CONTENU.md`) : à remplacer par de vraies photos Soly'bat dès qu'elles seront disponibles. `local-commercial-transforme-saint-florent` a un "après" réel (`saint-florent-apres.jpg`, cuisine, même provenance `photos_farid/`) complété le 2026-07-30 par un "avant" **généré par IA** (`saint-florent-avant.jpg`, local commercial vide avant travaux, skill `generer-image` + `post_traitement.py --intensite moyenne`) faute de vraie photo "avant" disponible pour ce chantier dans `photos_farid/` — ce couple mélange donc une photo réelle (après) et une photo IA (avant), à garder en tête si remplacement futur par du vrai. Le fallback photo-seule de `projet.njk` n'est donc plus déclenché par aucun des 6 projets actuels (tous ont avant + après) mais reste en place pour un futur projet sans photo "avant". Ces 2 projets (mehun, saint-florent) citent explicitement "maçonnerie" et "plâtrerie (placo)" dans `corpsDeMetier`, absents des 4 premiers, suite au retour client demandant plus d'explicite sur les corps de métier.

## src/images/realisations/
18 photos réelles/générées de chantier (voir historique ci-dessous), désormais en **JPEG** (converties depuis PNG, qualité 82 : 23,4 Mo → 2,5 Mo au total, -89%, aucune perte visible à l'écran — c'étaient des photos, pas des aplats, le PNG était le mauvais format), + 3 photos réelles (`mehun-sur-yevre-avant.jpg`, `mehun-sur-yevre-apres.jpg`, `saint-florent-apres.jpg`, redimensionnées à 1200px de long côté et recompressées qualité 82 depuis `photos_farid/`, cf. ci-dessus) + 1 photo générée par IA le 2026-07-30 (`saint-florent-avant.jpg`, local commercial vide avant travaux, skill `generer-image` + `post_traitement.py --intensite moyenne`, pas de prompt documenté dans `docs/prompts-photos.md` car ajoutée hors du lot initial de 18). Référencées par `image:`/`photos.avant`/`photos.apres` dans les front-matters et `realisations.json` — voir `docs/prompts-photos.md` pour le mapping des 18 emplacements du lot initial (hero accueil ×3, hero renovation-location ×3, hero réalisations ×1, hero espace-pro ×3, + avant/après des 4 premières réalisations). `cuisine-renovee.jpg` (accueil, régénérée) est volontairement laissée nette/léchée pour suggérer une photo prise par un professionnel sur la page d'accueil ; `sejour-renove.jpg`/`piece-a-renover.jpg` (autres photos hero de l'accueil) suivent la même logique. Les 15 autres fichiers générés du lot initial + `saint-florent-avant.jpg` sont passés par `post_traitement.py` (`--intensite moyenne`) pour un rendu plus crédible "photo de chantier au smartphone" (grain, léger flou, inclinaison + recadrage asymétrique, exposition irrégulière, vignettage, artefacts JPEG). Versions antérieures : `photos/_avant-correction-ia/` (artefact IA retiré), `photos/_avant-post-traitement/` (avant le passage smartphone), `photos/_avant-compression-jpeg/` (PNG originaux avant conversion JPEG). `src/images/signature-sceau.png` (180×180, hors de ce dossier réalisations) : sceau détouré en transparent (recadré depuis `logo-solybat.png` en évitant l'artefact de type filigrane connu près du bord droit, voir note plus haut sur `chantier-coordination.jpg`), utilisé par la signature email dans `identite-visuelle/`.

## src/js/main.js
Point d'entrée JS unique, importe et initialise tous les modules interactifs — d'abord les modules fonctionnels historiques (nav, onglets, filtre, slider, formulaire), puis la couche visuelle ajoutée par la refonte 2026-08-19 (`initHeaderCondense`, `initReveals`, `initTiltCartes`, `initCompteurs`, `initHero3d`). Chaque `init*()` sort immédiatement si sa cible est absente de la page.

## src/js/hero-3d/
Maquette 3D WebGL du hero de l'accueil, écrite à la main (aucune bibliothèque : ~3 Ko gzip contre ~165 Ko pour Three.js, pour une scène de 66 triangles). Découpée en modules purs testables + une couche de rendu.

### src/js/hero-3d/matrices.js
Matrices 4×4 colonne-majeure (convention WebGL), toutes pures. `multiplierMatrices(a,b)` renvoie a·b, donc b s'applique en premier.
- matriceIdentite(), matricePerspective(fov, rapport, proche, lointain), matriceRotationX/Y(angle), matriceTranslation(x,y,z), multiplierMatrices(a,b)
- matriceVueOrbite(rayon, azimut, elevation, hauteurCible) — caméra en orbite autour d'un point de l'axe Y

### src/js/hero-3d/geometrie-maison.js
Génère la maquette (dalle, 4 murs percés, cloison, 2 pignons, 2 versants de toit, cheminée, vitres, porte) — 66 triangles, normales **imposées** et non déduites du sens de parcours. Chaque pièce porte un `ordre` de construction (7 étapes distinctes).
- construireGeometrieMaison() — pièces prêtes pour le GPU (positions, normales, arêtes)
- compterEtapes(pieces), construireGrilleSol(demiEtendue, pas), extrairePointsDeConvergence(pieces, maximum), normaliser(v)
- COULEURS, DIMENSIONS — palette de marque en 0..1, cotes de la maquette

### src/js/hero-3d/phases.js
Toute la chorégraphie de la boucle de 11,6 s (essaim → fil de fer → construction → terminée → fondu), sous forme pure : un temps en secondes donne un état complet de scène. La scène est transparente au début ET à la fin de la boucle, ce qui masque le rebouclage.
- calculerEtatScene(temps, nombreEtapes) — état complet (opacités, émergences, convergence, lumière des fenêtres)
- calculerPhase(temps), calculerEmergence(progression, ordre, nombreEtapes), etatImmobile(nombreEtapes), adoucir(t), adoucirSortie(t), borner01(v)
- SEQUENCE, DUREE_BOUCLE

### src/js/hero-3d/webgl.js
Enrobage WebGL minimal + les trois paires de shaders (faces pleines, lignes, points). Éclairage **hémisphérique** (ciel neutre / sol chaud) : une ambiante plate faisait lire le crème comme du gris. Éclairage deux faces via `gl_FrontFacing`, car murs et cloison se voient des deux côtés.
- creerContexte(canvas), creerProgramme(gl, vs, fs) — introspecte attributs/uniformes actifs
- creerTampon(gl, donnees), lierAttribut(gl, tampon, emplacement, taille)

### src/js/hero-3d/scene-hero.js
Assemblage des tampons, caméra, boucle de rendu. Densité de pixels plafonnée à 1,5, `POLYGON_OFFSET_FILL` pour que les arêtes se posent sur les faces sans z-fighting, lumière qui suit partiellement la caméra pour éviter le contre-jour. La boucle **reprend où elle en était** après une pause (écart borné à 0,1 s), elle ne redémarre pas à zéro.
- creerSceneHero(canvas, options) — retourne demarrer/arreter/detruire/dessinerInstant/viserParallaxe, ou null si WebGL est indisponible
- calculerRayonCamera(rapport) — recule la caméra en portrait (pur)
- calculerDecalageCamera(rapport) — décale la maquette à droite en paysage, vers le haut en portrait, pour qu'elle ne passe pas sous le texte (pur)

### src/js/hero-3d/index.js
Câblage DOM. Init différée après le premier rendu (`requestIdleCallback`) pour ne pas peser sur le LCP. La boucle ne tourne que si le hero est dans le viewport ET l'onglet au premier plan. Bascule sur le repli photo (`.hero-3d--repli`) si WebGL manque, si les shaders échouent ou si le contexte est perdu.
- initHero3d() — cible `[data-hero-3d]`, retourne null si absent

## src/js/reveals.js
Apparition des blocs au scroll (`IntersectionObserver`, une seule fois, décalage plafonné à 350 ms). Dégradation : le CSS ne masque que sous la classe `reveals-actifs` posée par ce module — sans JS, rien n'est caché.
- calculerDecalage(rang, pas, plafond) — retard d'apparition (pur)
- calculerRangsParGroupe(elements) — rang de chaque élément parmi ses frères (pur)
- initReveals()

## src/js/tilt-cartes.js
Basculement 3D des cartes au survol, réservé aux pointeurs fins. Une seule mise à jour par image (`requestAnimationFrame`).
- calculerInclinaison(x, y, cadre, amplitude) — rotations + position du reflet, bornées hors cadre (pur)
- initTiltCartes()

## src/js/compteurs.js
Chiffres qui montent à l'entrée dans le viewport (`[data-compteur]`, utilisé sur les 2 métriques clés de `/retour-client`). Le HTML porte toujours la valeur finale : sans JS, le chiffre est simplement là.
- analyserValeur(texte) — relève nombre + habillage (préfixe, suffixe, décimales, séparateur de milliers insécable). Chaque espace interne doit être suivi d'un chiffre, sinon « 42 500 € » avalait l'espace avant l'unité.
- formaterValeur(valeur, format), calculerValeurAffichee(depart, arrivee, progression), adoucirSortie(t)
- initCompteurs()

## src/js/header-condense.js
Header collant qui se condense au défilement, avec hystérésis (24 px) pour éviter le clignotement autour du seuil.
- calculerEtatHeader(defilement, etaitCondense, seuil, hysteresis) — pur
- initHeaderCondense()

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
Reset, styles globaux, classes utilitaires (`.bouton` avec hover/focus, `.boutons-groupe` — ligne de boutons centrée avec espacement, réutilisée pour le CTA final de l'accueil, `.conteneur`, `.entete-page` pour l'icône sceau à côté d'un `<h1>`/`<h2>` de page), `:focus-visible` global, `overflow-x: hidden` (nécessaire pour le hero plein cadre en 100vw), `.lien-evitement` (skip link, visible seulement au focus clavier). Polices Google Fonts chargées depuis `base.njk` (`<link>`, plus de `@import` bloquant ici). Liens en `--couleur-bois-brule` par défaut (contraste AA sur fond crème, ~4,0:1 avec terracotta ne suffisait pas), `--couleur-terracotta` au hover/focus uniquement. `.bouton--principal` en `--couleur-terracotta-texte` (pas `--couleur-terracotta`, insuffisant en contraste avec le texte crème clair). `section` utilise `padding-block` et `.conteneur` utilise `padding-inline` (propriétés logiques sur des axes distincts, plus le raccourci `padding`) pour éviter que la spécificité de classe de `.conteneur` n'annule le padding vertical voulu par le sélecteur de type `section` — ce bug annulait tout le padding haut/bas de `<section class="conteneur">` sur tout le site (contenu collé au header et au footer sur Process/FAQ/À propos/Devis/Mentions légales). `section + section { padding-top: 0 }` évite que deux `<section>` empilées (accueil) ne cumulent 2× le padding.

## src/css/styles.css
Point d'entrée CSS, `@import` de tous les fichiers de composants/pages (inclut désormais `placeholder-photo.css`, `hero-photos.css`, `bandeau-nouveaute.css`, `photos-vrac.css`, `retour-client.css`, `barre-appel.css` et `publicite-climatisation.css`).

## src/css/publicite-climatisation.css
Styles de la carte publicité climatisation de l'accueil (`.publicite-climatisation`) : lien centré, largeur max 420px, `--rayon-surface`/`--ombre-surface` (mêmes tokens que les autres cartes), soulèvement au survol.

## src/images/publicite-climatisation.png
Export de `identite-visuelle/publicite-climatisation.png` (1080×1350) quantifié en PNG palette (64 couleurs, `Image.FASTOCTREE`) pour l'usage sur le site : 126 Ko → 36 Ko, sans perte visible (graphisme à aplats de couleur + texte, pas de dégradé). Affiché sur `src/index.njk`, lien vers `/devis/`.

## src/css/barre-appel.css
Barre d'appel collante mobile (`.barre-appel-mobile`) : masquée par défaut, `position: fixed; bottom: 0` uniquement sous 1100px (même palier que `header.css`, où le lien téléphone du header disparaît dans le menu burger), fond `--couleur-terracotta-texte`, `padding-bottom` ajouté sur `body` dans la même media query pour que le contenu ne passe pas sous la barre, `env(safe-area-inset-bottom)` pour les mobiles à encoche.

## src/css/bandeau-nouveaute.css
Bandeau global d'annonce : fond bois brûlé + texte crème claire (même combo que `footer.css`, contraste déjà validé), lien souligné, `outline-color` du focus-visible forcée en crème claire (comme le footer, sinon peu visible sur ce fond).

## src/css/placeholder-photo.css
Styles du motif placeholder signature (dégradé + sceau en filigrane pivoté + légende italique).

## src/css/hero-photos.css
Styles du hero plein cadre, grilles 1/2/3 panneaux, voile de contraste + texte superposé sur le premier panneau, variante `--compacte`. `.hero-photos__ctas` : ligne de boutons (CTA devis + CTA "Appeler"), `.bouton--secondaire` y est surchargé en crème claire (bordure/texte) — le style par défaut (bordure anthracite) serait invisible sur l'overlay sombre du hero.

Trois correctifs responsive appliqués le 2026-08-02 (le hero était la seule vraie faiblesse mobile du site, le reste des pages était déjà correct) :
- **Texte coupé sous 900px** : `.hero-photos__panneau` est désormais `display:flex; align-items:flex-end` et `.hero-photos__texte` est en `position:relative` (dans le flux) au lieu de `position:absolute; bottom:0`. Avec l'ancien absolute, un texte plus haut que le `min-height` du panneau débordait **vers le haut** et était rogné par `overflow:hidden` — mesuré à 375px de viewport : panneau 320px pour un texte de 429px, soit 109px coupés et la première ligne du `<h1>` invisible. En flux, le panneau s'étire à la hauteur du texte ; l'alignement bas préserve le rendu desktop d'origine.
- **Débordement horizontal de 8px** : l'ancienne sortie de cadre (`width:100vw` + `left:50%` + `margin-left:-50vw`) était redondante — `<main>` n'est pas contraint en largeur, donc `width:100%` suffit — et débordait de la largeur de la barre de défilement, `100vw` l'incluant. C'est ce débordement que le `overflow-x:hidden` de `base.css` masquait (ce dernier est conservé comme filet de sécurité).
- **Bande crème de 6rem entre header et hero** : le hero étant un `<section>`, il héritait du `padding-block: var(--espace-xl)` global de `base.css` et se retrouvait détaché du haut de page. Neutralisé par `padding-block: 0`, avec `.hero-photos + section { padding-top: var(--espace-xl) }` pour rendre son espacement à la section suivante (que la règle `section + section { padding-top: 0 }` de `base.css` annulait sinon).

Vérifié sur 8 pages × 4 largeurs (320/390/768/1280px) : aucun débordement horizontal, aucun texte rogné.

## src/css/retour-client.css
Styles de `/retour-client/` : `.retour-client__avertissement` en encart à liseré terracotta plein (même traitement que `.plaquette-a-venir` d'`espace-pro.css`, pour une mention qui doit rester visible et non passer pour du texte secondaire), légende des 3 termes financiers en grille 3 colonnes (1 sous 900px), grille de cartes profil 2 colonnes (1 sous 560px). `.carte-retour-client` : pas de photo (contrairement à `.carte-realisation`), `<dl>` de chiffres en grille 2 colonnes (1 sous 560px).

## src/css/sceau.css / header.css / footer.css / hero.css / frise.css / carte.css / onglets.css / galerie.css / slider.css / espace-pro.css / faq.css / formulaire.css
Un fichier par composant/page, tokens uniquement, pas de couleur en dur. `hero.css` ne couvre plus que "pour qui"/"garanties"/aperçu réalisations (l'ancien hero centré est remplacé par `hero-photos.css`). Contrôles/boutons/champs/onglets/liens ont des états hover/focus-visible avec transition. `frise.css`/`hero.css`/`galerie.css` : palier tablette à 2 colonnes (`max-width: 900px`) avant le passage à 1 colonne (`max-width: 560px`). `header.css` : `.header__cta` réutilise `.bouton.bouton--principal`, surchargé via `.header__nav a.header__cta` (spécificité suffisante pour battre `.header__nav a` sans `!important`). `.header__telephone` : lien `tel:` + icône, même traitement hover/focus que les autres liens de nav. **Le nav desktop à 9 entrées ne tient pas dans les 1200px du conteneur avec les réglages d'origine** (écart de 2rem + texte à 1rem = ~1250px de contenu pour ~1150px disponibles) : les liens étaient compressés et cassaient chacun en 2 lignes, numéro de téléphone compris, dès le plein écran. Corrigé par trois réglages solidaires — `white-space: nowrap` sur `.header__nav a` (garde-fou : plus aucun libellé ne peut se couper), `gap: clamp(0.9rem, 1.5vw, 1.5rem)` et `font-size: var(--texte-sm)` sur `.header__nav`, `padding` resserré sur `.header__cta` — ce qui ramène le nav à ~884-944px. Le palier du menu burger passe donc de 768px à **1100px** : en dessous, le nav complet ne rentre plus (mesuré : 90px de marge libre à 1101px, l'étranglement, contre 144px à 1920px). `footer.css` : hover/focus des liens en `--couleur-creme-sable` + soulignement (le terracotta était quasi invisible sur le fond bois brûlé, ~1,6:1), `outline-color` du focus-visible forcée en crème claire dans le footer. `carte.css` : `.carte-realisation__corps-de-metier` — pastilles (fond crème sable) listant les corps de métier du projet sous la surface/durée. `galerie.css` : `select` en `font: inherit` (sinon le texte des filtres retombe sur la police système au lieu d'Inter). `slider.css` : `.slider-avant-apres__calque` (les `<img>` avant/après) en `width/height: 100%; object-fit: cover` — sans ça l'image ne remplissait pas le cadre `aspect-ratio: 4/3` sur les viewports où sa largeur naturelle (~980px) est inférieure à la largeur du conteneur (jusqu'à ~1140px en desktop), laissant une bande crème vide sur le bord droit. `slider.css` contient aussi `.projet__photo-seule` (même `aspect-ratio`/`border-radius`/`box-shadow` que `.slider-avant-apres`, mais une seule `<img>` en `object-fit: cover`) pour le fallback "après seule" de `projet.njk`. `onglets.css` contient aussi `.liste-corps-de-metier` (grille 2 colonnes, 1 sous 560px) pour la section "Tous corps de métier, un seul interlocuteur" de `renovation-location.njk`. `espace-pro.css` : `.plaquette-a-venir` en encart à liseré terracotta plein (`border-left`), plus la bordure pointillée qui se lisait comme un placeholder de maquette oublié. `formulaire.css` : bouton de profil = `<label>` habillant un radio cadré (`:has(input:checked)`, fond en `--couleur-terracotta-texte` — même correctif de contraste que `.bouton--principal`), message d'erreur en anthracite + liseré terracotta (le texte terracotta seul n'atteignait pas 4,5:1). `.devis`/`.devis__reassurance` : grille 2 colonnes (`minmax(0,600px) 1fr` dès 900px, empilée en dessous) pour le formulaire + l'encart de réassurance de `devis.njk`, qui comblent le vide à droite du formulaire sur grand écran. `.devis__appel` : séparateur (liseré bois brûlé) + texte en gras au pied de l'encart de réassurance, pour la mention "Vous préférez nous appeler directement ?".

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

## tests/plaquette.test.js
Garde-fou du seul livrable que le build ne regénère pas : compare les chiffres écrits en dur dans `identite-visuelle/plaquette-solybat.html` à ceux calculés par `lib/synthese-rentabilite.cjs` sur `retoursClients.json` (agrégats, et les 3 meilleures opérations ligne à ligne). Une 9ᵉ opération ajoutée fait échouer `npm test` avec le rappel de regénérer le PDF. Pitié pour les espaces : le formateur de `lib/` pose une fine insécable (U+202F) dans `410 200 €` là où le HTML pose des insécables ordinaires (U+00A0) pour retenir ses unités en fin de ligne — la comparaison passe donc par `normaliser()` des deux côtés. Vérifie aussi qu'aucune durée de chantier chiffrée n'y réapparaît.

## tests/test-devis-validation.php
Script `assert()`-style (pas de framework) pour `devis-validation.php` : données valides/incomplètes, détection honeypot, neutralisation d'injection d'en-tête. Lancer avec `php tests/test-devis-validation.php` — exécuté le 2026-07-30 (PHP 8.5.9 installé en portable dans `C:\Users\Dylan\php`, ajouté au PATH utilisateur), tous les tests passent.

## devis-validation.php
Logique pure du formulaire de devis : `estHoneypotRempli()`, `nettoyerValeur()` (neutralise l'injection d'en-têtes email via `preg_replace('/[\r\n]+/', ' ', ...)`, corrigé le 2026-07-30 — l'ancien `str_replace(["\r","\n"], ' ', ...)` laissait un double espace au lieu d'un seul sur une séquence CRLF), `validerDonnees()` (profil/nom/email/message, retourne `['valide' => bool, 'erreurs' => array]`). Consommé par `traiter-devis.php` et `tests/test-devis-validation.php`.

## traiter-devis.php
Handler POST du formulaire de devis, copié tel quel vers `_site/`. Rejette le honeypot silencieusement (redirection succès sans envoi), redirige vers `/devis/?erreur=1&...` avec les valeurs saisies repassées en query string si la validation serveur échoue (page `/devis/` statique, relu côté client par `form-devis.js`), sinon envoie l'email via `mail()` et redirige vers `/devis-merci/`. `$adresseContact` est **temporairement** `dylan.pimont@orange.fr` (redirigé pour test le 2026-07-30 en attendant la validation complète avant mise en ligne) au lieu de la vraie valeur `solybat@gmail.com` — **à remettre avant toute mise en prod**. L'en-tête `From:` (`no-reply@solybat18.fr`) reste la vraie valeur communiquée par le client, pour éviter un rejet anti-spoofing côté destinataires. Vérifié le 2026-07-30 avec PHP 8.5.9 : `php -l` OK, `php -S` + `curl` confirment les 3 chemins (validation réussie → tentative d'envoi mail, données invalides → redirect `/devis/?erreur=1`, honeypot → redirect `/devis-merci/`). Le `mail()` local échoue par nature (pas de serveur SMTP sur la machine de dev, et `mail()` natif Windows ne supporte pas l'authentification SMTP qu'exigent Orange/Gmail) — comportement attendu, non représentatif de l'hébergement Hostinger/OVH réel où `sendmail` est préconfiguré ; la composition du mail (destinataire, sujet, en-têtes, anti-injection) a été vérifiée hors `mail()` via un script de simulation.
