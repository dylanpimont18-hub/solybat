# CODEBASE_MAP.md

Index de navigation du site Soly'bat (11ty). Voir `CLAUDE.md` pour la stack et les commandes, `BRAND.md` pour la marque, `docs/superpowers/plans/2026-07-17-site-solybat.md` pour le détail de chaque page.

## eleventy.config.cjs
Config 11ty (CommonJS — voir piège toolchain dans CLAUDE.md) : dossiers d'entrée/sortie, passthrough copy CSS/JS/images/PHP.

## src/_includes/layouts/base.njk
Layout HTML commun à toutes les pages : head, header, footer, imports CSS/JS.

## src/_includes/composants/header.njk
Header partagé : logo (macro sceau), nav principale, CTA devis, menu mobile.

## src/_includes/composants/footer.njk
Footer partagé : coordonnées, liens vers toutes les pages, zone d'intervention.

## src/_includes/composants/sceau.njk
Macro SVG du motif signature (bulle de niveau).
- sceau(taille, avecTexte) — cercle terracotta + bulle paramétrable

## src/_includes/composants/frise-process.njk
Macro de la frise des 4 étapes du chantier, avec ou sans délais.
- friseProcess(detaillee) — 4 étapes, délais si detaillee=true

## src/_includes/composants/carte-realisation.njk
Macro de vignette projet, avec fallback placeholder si pas de photo.
- carteRealisation(projet) — carte avec data-attributs pour filtre JS

## src/_includes/composants/formulaire-devis.njk
Formulaire de devis : profil, champs communs, blocs conditionnels, honeypot anti-spam.

## src/404.njk
Page 404 avec lien retour accueil.

## src/index.njk
Accueil : hero, frise process, aperçu réalisations, pour qui, garanties, CTA.

## src/renovation-location.njk
Présentation de l'offre avec onglets par profil (agence/investisseur/particulier).

## src/realisations/index.njk
Galerie de réalisations filtrable côté client par type de bien et ampleur.

## src/realisations/projet.njk
Fiche projet individuelle, générée par pagination 11ty sur `_data/realisations.json`.

## src/process.njk
Détail des 4 étapes avec délais moyens (frise en mode détaillé).

## src/espace-pro.njk
Page dédiée agences/gestionnaires, plaquette PDF en état "à venir".

## src/a-propos.njk
Histoire, valeurs, zone d'intervention (50 km autour de Vierzon).

## src/faq.njk
5 questions/réponses en accordéon natif `<details>` (aucun JS requis).

## src/devis.njk
Page contenant le formulaire de demande de devis.

## src/devis-merci.njk
Page de confirmation après soumission réussie du formulaire de devis.

## src/mentions-legales.njk
Mentions légales avec placeholders explicites pour infos réelles à compléter.

## src/_data/realisations.json
Données des projets (4 exemples) : slug, type, ampleur, photos, corps de métier.

## src/js/main.js
Point d'entrée JS unique, importe et initialise tous les modules interactifs.

## src/js/nav.js
Toggle du menu mobile.
- calculerProchainEtat(etatOuvert) — inverse l'état ouvert/fermé (pur)
- initNav() — câble le clic sur le bouton menu

## src/js/onglets.js
Système d'onglets accessible pour la page renovation-location.
- calculerOngletActif(boutons, cible) — trouve l'index du bouton actif (pur)
- initOnglets() — câble les clics, active le premier onglet

## src/js/filtre-galerie.js
Filtrage client-side de la galerie de réalisations.
- filtrerRealisations(realisations, filtres) — filtre par type/ampleur (pur)
- initFiltreGalerie() — lit le DOM, câble les selects

## src/js/slider-avant-apres.js
Slider de comparaison avant/après par glisser-déposer.
- calculerPositionPourcentage(clientX, rectLeft, rectWidth) — position curseur bornée (pur)
- initSliderAvantApres() — câble les événements pointer

## src/js/form-devis.js
Validation et soumission du formulaire de devis, avec pré-remplissage après erreur serveur.
- validerFormulaire(donnees) — valide profil/nom/email/message (pur)
- initFormDevis() — sélection profil, validation, relit les query params d'erreur

## src/css/tokens.css
Design tokens : couleurs, typographies, espacements (traduction directe de BRAND.md).

## src/css/base.css
Reset, styles globaux, import Google Fonts, classes utilitaires (`.bouton`, `.conteneur`).

## src/css/styles.css
Point d'entrée CSS, `@import` de tous les fichiers de composants/pages.

## src/css/sceau.css / header.css / footer.css / hero.css / frise.css / carte.css / onglets.css / galerie.css / slider.css / espace-pro.css / faq.css / formulaire.css
Un fichier par composant/page, tokens uniquement, pas de couleur en dur.

## src/images/logo-solybat.png
Logo Soly'bat, réutilisé aussi comme favicon en attendant une déclinaison dédiée.

## tests/nav.test.js / onglets.test.js / filtre-galerie.test.js / slider-avant-apres.test.js / form-devis.test.js
Tests `node --test` des fonctions pures de chaque module JS (14 tests au total).

## traiter-devis.php / devis-validation.php (non implémentés)
Backend de traitement du formulaire (Task 18, différée — PHP non installé en dev). Prévu : validation serveur, honeypot, envoi email, redirection avec pré-remplissage en cas d'erreur. Voir `docs/superpowers/plans/2026-07-17-site-solybat.md` Task 18 pour le code complet à écrire.
