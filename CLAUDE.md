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

Les 10 pages (les 9 du BRAND.md + `/devis-merci`) sont construites avec contenu provisoire crédible et données de démo. Reste avant mise en ligne :

- [ ] **Task 18 (backend PHP) différée** — PHP n'est pas installé sur la machine de dev. `traiter-devis.php`/`devis-validation.php` restent à écrire et tester (localement une fois PHP installé, ou directement sur l'hébergement Hostinger/OVH). Tant que ce n'est pas fait, la soumission réelle du formulaire `/devis` échoue (404 sur l'action du formulaire).
- [ ] Adresse email réelle dans `traiter-devis.php` (`$adresseContact`, actuellement un placeholder `contact@solybat.fr`).
- [ ] Contenu texte définitif à rédiger (le contenu actuel est provisoire mais réaliste, basé sur le positionnement du BRAND.md).
- [ ] Photos avant/après à collecter — dès qu'ajoutées dans `src/_data/realisations.json` (`photos.avant`/`photos.apres`), les composants basculent automatiquement du placeholder vers l'image/slider, sans retouche de template.
- [ ] Informations légales réelles dans `src/mentions-legales.njk` (SIRET, assurances, hébergeur, CGV, confidentialité — actuellement des placeholders `[... à compléter]`).
- [ ] Plaquette PDF `/espace-pro` (actuellement un `<span>` inerte "à venir").
- [ ] Déclinaisons du logo (favicon dédié — actuellement `logo-solybat.png` réutilisé tel quel, carte de visite, signature mail).

## CODEBASE_MAP.md

Généré et à jour à la racine du projet — le consulter avant d'ouvrir un fichier source pour savoir où écrire.
