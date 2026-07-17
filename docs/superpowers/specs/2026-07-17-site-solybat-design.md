# Site Soly'bat — Design v1 (les 9 pages)

Date : 2026-07-17
Référence : `BRAND.md` (source de vérité sur la marque, la DA et l'arborescence cible)

## Contexte et objectif

Construire le site vitrine de Soly'bat (rénovation de biens en vue de mise en location, autour de Vierzon) en HTML/CSS/JS, hébergé sur Hostinger ou OVH (hébergement mutualisé, FTP). Le projet part de zéro : seuls `BRAND.md` et `logo-solybat.png` existent. Aucun contenu texte définitif, aucune photo de chantier, aucune stack technique n'étaient encore choisis avant ce spec.

Ce spec couvre la totalité des 9 pages listées au BRAND.md §4, plus une page de confirmation de formulaire (`/devis-merci`) identifiée comme nécessaire pendant le design.

## Décisions de cadrage

- **Contenu** : texte provisoire mais crédible (pas de lorem ipsum), basé sur le positionnement du BRAND.md, à affiner par l'utilisateur ensuite.
- **Photos réalisations** : aucune n'existe encore → placeholders identifiés (bloc visuel avec label), pas de photos stock (le BRAND.md l'interdit explicitement en production).
- **Périmètre** : les 9 pages + confirmation sont construites en un seul passage plutôt que par itérations.
- **Hébergement** : Hostinger ou OVH mutualisé — compatible avec une sortie 100% statique (HTML/CSS/JS) et un script PHP.

## Architecture technique

- **Générateur de site statique : 11ty**, choisi plutôt qu'un site pur sans build, parce que le nombre de pages va croître dans le temps (chaque nouveau chantier ajoute une fiche `/realisations/[slug]`) et que le header/footer/nav communs doivent être modifiables en un seul endroit. La sortie de build reste du HTML/CSS/JS pur, déployable tel quel en FTP.
- **Templating : Nunjucks** (le plus utilisé avec 11ty, supporte layouts + includes de composants).
- **CSS : CSS pur (pas de préprocesseur)**, organisé en fichiers modulaires (tokens + un fichier par composant), assemblés dans un point d'entrée unique `styles.css`.
- **JS : modules ES natifs** (`<script type="module">`), un fichier par fonctionnalité interactive, pas de bundler.
- **Formulaire de devis : script PHP unique** (`traiter-devis.php`), compatible avec l'hébergement mutualisé Hostinger/OVH, pas de dépendance à un service tiers.

### Arborescence de fichiers

```
Solybat/
├── .eleventy.js
├── package.json
├── src/
│   ├── _data/
│   │   └── realisations.json
│   ├── _includes/
│   │   ├── layouts/
│   │   │   └── base.njk
│   │   └── composants/
│   │       ├── header.njk
│   │       ├── footer.njk
│   │       ├── sceau.njk
│   │       ├── frise-process.njk
│   │       ├── carte-realisation.njk
│   │       └── formulaire-devis.njk
│   ├── css/
│   │   ├── tokens.css
│   │   ├── base.css
│   │   ├── header.css / footer.css / hero.css / frise.css / galerie.css / carte.css / formulaire.css
│   │   └── styles.css
│   ├── js/
│   │   ├── main.js
│   │   ├── nav.js
│   │   ├── slider-avant-apres.js
│   │   ├── filtre-galerie.js
│   │   └── form-devis.js
│   ├── images/
│   │   └── logo-solybat.png
│   ├── index.njk
│   ├── renovation-location.njk
│   ├── realisations/
│   │   ├── index.njk
│   │   └── projet.njk
│   ├── process.njk
│   ├── espace-pro.njk
│   ├── a-propos.njk
│   ├── faq.njk
│   ├── devis.njk
│   ├── devis-merci.njk
│   └── mentions-legales.njk
├── traiter-devis.php
└── _site/                 # sortie générée — dossier à uploader en FTP
```

- `traiter-devis.php` est copié tel quel dans `_site/` via passthrough copy (11ty ne l'exécute pas).
- Une seule fiche `/realisations/[slug]` par entrée de `realisations.json`, générée par pagination 11ty.
- `base.njk` importe un seul `styles.css` et un seul `main.js`.

## Design system

**`tokens.css`** — traduction directe du BRAND.md §2 en custom properties : couleurs (`--couleur-terracotta #B5502E`, `--couleur-bois-brule #6B4A32`, `--couleur-creme-sable #EDE4D3`, `--couleur-creme-claire #F6F1E7`, `--couleur-anthracite #2B2723`, `--couleur-vert-olivier #7A8560`), typographies (`--police-display: 'Fraunces'`, `--police-texte: 'Inter'`), échelle d'espacement, rayon de badge, largeur max de contenu.

**Composants partagés :**

| Composant | Rôle | Réutilisé sur |
|---|---|---|
| `sceau.njk` | Motif bulle de niveau (SVG inline paramétrable) | Logo header, frise process, tampon garanties, favicon |
| `frise-process.njk` | 4 étapes numérotées (01→04) avec le sceau comme repère | Accueil, `/process` |
| `carte-realisation.njk` | Vignette projet (photo ou placeholder, titre, type de bien) | Accueil, `/realisations` |
| `header.njk` | Logo, nav, CTA devis, menu mobile | `base.njk` (toutes les pages) |
| `footer.njk` | Coordonnées, liens légaux, zone d'intervention | `base.njk` |
| `formulaire-devis.njk` | Champs communs + blocs conditionnels par profil | `/devis` |

Le sceau est implémenté une seule fois en SVG inline paramétrable (taille, présence du point olive) plutôt que dupliqué, pour garantir la cohérence visuelle du motif signature à travers le site.

## Structure des données réalisations

`_data/realisations.json`, une entrée par projet :

```json
[
  {
    "slug": "appartement-t3-vierzon-centre",
    "titre": "Appartement T3 — Vierzon Centre",
    "typeDeBien": "appartement",
    "ampleurChantier": "renovation-complete",
    "surface": "62 m²",
    "duree": "6 semaines",
    "corpsDeMetier": ["plomberie", "electricite", "peinture", "sol"],
    "resume": "Appartement vétuste transformé en T3 prêt à louer, livré avec cuisine équipée.",
    "photos": { "avant": null, "apres": null }
  }
]
```

- `typeDeBien` et `ampleurChantier` alimentent les deux filtres de `/realisations`.
- `photos.avant`/`photos.apres` valent `null` tant qu'aucune vraie photo n'existe. `carte-realisation.njk` détecte ce cas et affiche un placeholder (bloc ratio 4:3, fond `--couleur-creme-claire`, bordure pointillée `--couleur-bois-brule`, label du projet + "avant"/"après" en surimpression) au lieu de charger un fichier inexistant. Dès qu'une vraie image est renseignée, le composant bascule sur `<img>` sans retouche de page.
- Chaque fiche `/realisations/[slug]` est générée par pagination 11ty et indexable individuellement (exigence SEO du BRAND.md §4).

## Détail des pages

- **`/` Accueil** : hero (sceau + accroche + photo placeholder) → frise process → aperçu de 3-4 réalisations → 3 colonnes "pour qui" (agences/investisseurs/particuliers) → bloc garanties (sceau) → CTA contact.
- **`/renovation-location`** : présentation de l'offre + onglets JS (Agences / Investisseurs / Particuliers, `aria-selected` pour l'accessibilité), chaque onglet avec son argumentaire propre.
- **`/realisations`** : grille de `carte-realisation`, filtrable côté client par `typeDeBien` et `ampleurChantier`. Aucun résultat → message explicite, pas de grille vide silencieuse.
- **`/realisations/[slug]`** : slider avant/après, infos chantier (surface, durée, corps de métier), résumé, retour vers la galerie.
- **`/process`** : version détaillée de la frise, délai moyen et description par étape.
- **`/espace-pro`** : argumentaire agences/gestionnaires (volume, réactivité, facturation). Lien de plaquette PDF affiché en état "à venir" (grisé, pas de 404) tant que le PDF n'existe pas.
- **`/a-propos`** : histoire, valeurs, zone d'intervention (50 km autour de Vierzon).
- **`/faq`** : accordéon en `<details>`/`<summary>` natif (pas de JS requis), contenu provisoire réaliste.
- **`/devis`** : `formulaire-devis` avec sélecteur de profil en premier, champs conditionnels affichés/masqués en JS.
- **`/devis-merci`** : page de confirmation après soumission réussie du formulaire (ajoutée pendant le design, absente du BRAND.md original).
- **`/mentions-legales`** : texte avec placeholders explicites (`[SIRET à compléter]`, etc.) pour les informations légales réelles non fournies.

## Formulaire de devis & script PHP

- Formulaire natif (`<form method="POST" action="/traiter-devis.php">`) — fonctionne sans JS, point de conversion principal du site.
- **`form-devis.js`** (progressive enhancement) : affiche/masque les champs conditionnels par profil, valide en direct (email, téléphone, requis) pour un retour immédiat — jamais la seule barrière de validation.
- **`traiter-devis.php`** :
  - Revalide tout côté serveur (requis, format email).
  - **Honeypot anti-spam** : champ caché invisible ; s'il est rempli, la requête est ignorée silencieusement (réponse 200, pas d'envoi) — pas de captcha tiers.
  - Échappe les valeurs avant de les injecter dans l'email (protection contre l'injection d'en-têtes via `\r\n`).
  - Envoie via `mail()` PHP vers une adresse placeholder `contact@solybat.fr`, à remplacer par la vraie adresse une fois connue.
  - Succès → redirection vers `/devis-merci/`. Erreur serveur (champs manquants après contournement JS) → redirection vers `/devis/?erreur=1`, la page réaffichant le message d'erreur et conservant les valeurs déjà saisies.

## Gestion des erreurs et cas limites

- **404** : page `404.html` dédiée (générée nativement par 11ty), header/footer/design system conservés, lien retour accueil.
- **Galerie sans résultat** : message explicite (voir détail des pages).
- **JS désactivé/échoué** : formulaire de devis reste fonctionnel (POST natif) ; FAQ en `<details>` natif ; les onglets `/renovation-location` doivent rester lisibles en fallback (contenu empilé si JS absent).
- **Slider sans photo réelle** : ne s'initialise pas si `photos.avant`/`photos.apres` sont `null` — affichage du placeholder statique, pas d'erreur JS silencieuse.
- **Erreurs de validation serveur du formulaire** : message visible en haut du formulaire, valeurs saisies conservées.
- **Polices Google Fonts indisponibles** : `font-display: swap` pour éviter un texte invisible pendant le chargement.

## Stratégie de test / QA

Pas de framework de test automatisé (non pertinent pour un site vitrine statique). Checklist manuelle à dérouler avant mise en ligne :

- Responsive (mobile / tablette / desktop) sur les 10 pages.
- Accessibilité : navigation clavier complète (menu mobile, onglets, accordéon, formulaire), contraste WCAG AA (aucune couleur de la palette n'est blanc/noir pur).
- Filtres galerie : toutes les combinaisons `typeDeBien` × `ampleurChantier`, y compris "aucun résultat".
- Slider avant/après : interaction souris et tactile.
- Formulaire : soumission valide par profil, champs manquants, honeypot rempli (simulation bot).
- Dégradation sans JS : formulaire, FAQ, onglets restent utilisables.
- Page 404 et liens internes cassés.
- Validation HTML (W3C) sur `_site/`.
- Lighthouse (perf/accessibilité/SEO) sur le build final avant upload FTP.

## Hors périmètre de ce spec

- Rédaction du contenu texte définitif (remplacera le contenu provisoire).
- Collecte et intégration des vraies photos avant/après.
- Choix et intégration de la plaquette PDF `/espace-pro`.
- Informations légales réelles (SIRET, assurances) pour `/mentions-legales`.
- Déclinaisons du logo (favicon dédié au-delà du sceau SVG, signature mail, carte de visite).
