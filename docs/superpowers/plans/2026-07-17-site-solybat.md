# Site Soly'bat — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Soly'bat marketing site (9 pages + confirmation page) as a statically-generated HTML/CSS/JS site with an 11ty build, ready to upload as-is to Hostinger/OVH shared hosting.

**Architecture:** 11ty (Nunjucks templates) generates static HTML from shared layout/components into `_site/`. Plain CSS (custom properties for design tokens, one file per component) and native ES modules (no bundler) provide styling and interactivity. A single PHP script handles the quote-request form server-side; everything else is pure static output.

**Tech Stack:** Node.js + `@11ty/eleventy` ^2.0.1, Nunjucks templating, vanilla CSS, vanilla JS (ES modules), PHP (no framework), Node's built-in test runner (`node --test`) for pure JS logic, plain `assert()`-based PHP test script for PHP logic.

## Global Constraints

- Colors (exact hex, from `BRAND.md` §2): Terracotta `#B5502E`, Bois brûlé `#6B4A32`, Crème sable `#EDE4D3`, Crème claire `#F6F1E7`, Anthracite `#2B2723`, Vert olivier `#7A8560`. Never pure white or pure black backgrounds/text.
- Fonts: Display = `Fraunces`, body = `Inter`, imported via `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');` with `font-display: swap`.
- No stock photography anywhere — placeholders only until real photos exist (see Task 7).
- No preprocessor (no Sass), no JS bundler, no client-side framework, no third-party form/captcha service.
- All copy is in French, sober/factual tone per `BRAND.md` §2 ("Ton / voix").
- Output directory is `_site/` — this is what gets uploaded via FTP. Anything the browser or PHP needs at runtime must end up there via passthrough copy.
- Every interactive JS feature degrades gracefully without JS (form posts natively, FAQ uses native `<details>`, tab panels are stacked-visible by default).
- Language attribute `lang="fr"` on every page.

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `.eleventy.js`
- Create: `.gitignore`
- Create: `src/images/logo-solybat.png` (copy of existing root `logo-solybat.png`)

**Interfaces:**
- Produces: `dir.input = "src"`, `dir.output = "_site"`, `dir.includes = "_includes"`, `dir.data = "_data"` (11ty config every later task's file paths assume).
- Produces: npm scripts `build`, `serve`, `test` that every later task relies on to verify its work.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "site-solybat",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "eleventy",
    "serve": "eleventy --serve",
    "test": "node --test tests/"
  },
  "devDependencies": {
    "@11ty/eleventy": "^2.0.1"
  }
}
```

- [ ] **Step 2: Write `.eleventy.js`**

```js
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "traiter-devis.php": "traiter-devis.php" });
  eleventyConfig.addPassthroughCopy({ "devis-validation.php": "devis-validation.php" });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
}
```

Note: `package.json` sets `"type": "module"`, so `.eleventy.js` must use `export default` (ESM), not `module.exports`.

- [ ] **Step 3: Write `.gitignore`**

```
node_modules/
_site/
```

- [ ] **Step 4: Create `src/images/` and copy the logo**

```bash
mkdir -p src/images
cp logo-solybat.png src/images/logo-solybat.png
```

- [ ] **Step 5: Install dependencies and verify an empty build runs**

Run: `npm install && npx eleventy`
Expected: no errors; it prints something like `Wrote 0 files in X seconds` (no templates exist yet, that's expected). A `_site/` directory is created.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .eleventy.js .gitignore src/images/logo-solybat.png
git commit -m "chore: scaffold 11ty project"
```

---

### Task 2: Design tokens and base CSS

**Files:**
- Create: `src/css/tokens.css`
- Create: `src/css/base.css`
- Create: `src/css/styles.css`

**Interfaces:**
- Produces: CSS custom properties (`--couleur-*`, `--police-*`, `--espace-*`, `--rayon-badge`, `--largeur-max-contenu`) every later component file relies on.
- Produces: `src/css/styles.css` as the single stylesheet entry point every page's `<link>` points to (wired in Task 6).

- [ ] **Step 1: Write `src/css/tokens.css`**

```css
:root {
  --couleur-terracotta: #B5502E;
  --couleur-bois-brule: #6B4A32;
  --couleur-creme-sable: #EDE4D3;
  --couleur-creme-claire: #F6F1E7;
  --couleur-anthracite: #2B2723;
  --couleur-vert-olivier: #7A8560;

  --police-display: 'Fraunces', serif;
  --police-texte: 'Inter', sans-serif;

  --espace-xs: 0.5rem;
  --espace-sm: 1rem;
  --espace-md: 2rem;
  --espace-lg: 4rem;
  --espace-xl: 6rem;

  --rayon-badge: 50%;
  --largeur-max-contenu: 1200px;
}
```

- [ ] **Step 2: Write `src/css/base.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--couleur-creme-sable);
  color: var(--couleur-anthracite);
  font-family: var(--police-texte);
  line-height: 1.5;
}

h1, h2, h3 {
  font-family: var(--police-display);
  font-weight: 600;
  line-height: 1.2;
  margin: 0 0 var(--espace-sm);
}

p {
  margin: 0 0 var(--espace-sm);
}

a {
  color: var(--couleur-terracotta);
}

img {
  max-width: 100%;
  display: block;
}

.conteneur {
  max-width: var(--largeur-max-contenu);
  margin: 0 auto;
  padding: 0 var(--espace-md);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.bouton {
  display: inline-block;
  padding: var(--espace-xs) var(--espace-md);
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid transparent;
}

.bouton--principal {
  background: var(--couleur-terracotta);
  color: var(--couleur-creme-claire);
}

.bouton--secondaire {
  background: transparent;
  color: var(--couleur-anthracite);
  border-color: var(--couleur-anthracite);
}

section {
  padding: var(--espace-xl) 0;
}
```

- [ ] **Step 3: Write `src/css/styles.css` as the entry point**

```css
@import url('tokens.css');
@import url('base.css');
@import url('header.css');
@import url('footer.css');
@import url('hero.css');
@import url('frise.css');
@import url('carte.css');
@import url('galerie.css');
@import url('formulaire.css');
```

Note: the imported files (`header.css`, `footer.css`, etc.) don't exist yet — they're created in later tasks. `@import` on a missing file is not a build error for 11ty's passthrough copy (it just copies `styles.css` as-is), but the browser will 404 on those imports until the later tasks land. This is expected mid-plan and resolved by Task 6 (base layout) not being wired until the components exist.

- [ ] **Step 4: Verify passthrough copy works**

Run: `npx eleventy && ls _site/css/`
Expected: `tokens.css`, `base.css`, `styles.css` are listed.

- [ ] **Step 5: Commit**

```bash
git add src/css/tokens.css src/css/base.css src/css/styles.css
git commit -m "feat: add design tokens and base CSS"
```

---

### Task 3: Sceau (level-bubble seal) component

**Files:**
- Create: `src/_includes/composants/sceau.njk`
- Create: `src/css/sceau.css`
- Modify: `src/css/styles.css` (add `@import url('sceau.css');`)

**Interfaces:**
- Produces: Nunjucks macro `sceau(taille, avecTexte)` importable via `{% from "composants/sceau.njk" import sceau %}`, used by Task 4 (header) and Task 8 (frise-process) and Task 9 (homepage garanties block).

- [ ] **Step 1: Write `src/_includes/composants/sceau.njk`**

```njk
{% macro sceau(taille=48, avecTexte=false) %}
<svg class="sceau" width="{{ taille }}" height="{{ taille }}" viewBox="0 0 100 100" role="img" aria-label="Sceau Soly'bat">
  <circle cx="50" cy="50" r="46" fill="none" stroke="var(--couleur-terracotta)" stroke-width="2"/>
  {% if avecTexte %}
  <text x="50" y="14" text-anchor="middle" font-size="5" letter-spacing="1" fill="var(--couleur-bois-brule)">RÉNOVATION &amp; MISE EN LOCATION</text>
  {% endif %}
  <circle cx="50" cy="68" r="9" fill="none" stroke="var(--couleur-anthracite)" stroke-width="1.5"/>
  <circle cx="50" cy="68" r="2.5" fill="var(--couleur-vert-olivier)"/>
</svg>
{% endmacro %}
```

- [ ] **Step 2: Write `src/css/sceau.css`**

```css
.sceau {
  flex-shrink: 0;
}
```

- [ ] **Step 3: Wire into `styles.css`**

Edit `src/css/styles.css`, add after the `tokens.css`/`base.css` imports:

```css
@import url('sceau.css');
```

- [ ] **Step 4: Verify the macro renders**

Create a throwaway file `src/_test-sceau.njk` with:

```njk
---
permalink: "/_test-sceau/"
---
{% from "composants/sceau.njk" import sceau %}
{{ sceau(64, true) }}
```

Run: `npx eleventy && grep -o "sceau" _site/_test-sceau/index.html`
Expected: `sceau` printed (the SVG class is present in the output).

Then delete the throwaway file: `rm src/_test-sceau.njk`

- [ ] **Step 5: Commit**

```bash
git add src/_includes/composants/sceau.njk src/css/sceau.css src/css/styles.css
git commit -m "feat: add sceau (level-bubble seal) component"
```

---

### Task 4: Header component with mobile nav

**Files:**
- Create: `src/_includes/composants/header.njk`
- Create: `src/css/header.css`
- Create: `src/js/main.js`
- Create: `src/js/nav.js`
- Create: `tests/nav.test.js`
- Modify: `src/css/styles.css` (add `@import url('header.css');`)

**Interfaces:**
- Consumes: `sceau` macro from Task 3 (`composants/sceau.njk`).
- Produces: `src/js/main.js` as the single JS entry point every page's `<script type="module">` tag points to (wired in Task 6). Later tasks (5, 10, 11, 12, 17) add their own `init*` import + call to this file.
- Produces: `export function initNav()` from `nav.js`.

- [ ] **Step 1: Write `src/_includes/composants/header.njk`**

```njk
{% from "composants/sceau.njk" import sceau %}
<header class="header">
  <div class="header__conteneur conteneur">
    <a href="/" class="header__logo">
      {{ sceau(40) }}
      <span class="header__nom">Soly'bat</span>
    </a>
    <button class="header__menu-toggle" data-menu-toggle aria-expanded="false" aria-controls="header-nav">
      <span class="sr-only">Menu</span>
      <span class="header__menu-icone" aria-hidden="true"></span>
    </button>
    <nav class="header__nav" id="header-nav" data-nav-principale>
      <a href="/renovation-location/">Notre service</a>
      <a href="/realisations/">Réalisations</a>
      <a href="/process/">Process</a>
      <a href="/espace-pro/">Espace pro</a>
      <a href="/a-propos/">À propos</a>
      <a href="/faq/">FAQ</a>
      <a href="/devis/" class="header__cta">Demander un devis</a>
    </nav>
  </div>
</header>
```

- [ ] **Step 2: Write `src/css/header.css`**

```css
.header {
  background: var(--couleur-creme-claire);
  border-bottom: 1px solid var(--couleur-bois-brule);
}

.header__conteneur {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--espace-sm);
  padding-bottom: var(--espace-sm);
}

.header__logo {
  display: flex;
  align-items: center;
  gap: var(--espace-xs);
  text-decoration: none;
  color: var(--couleur-anthracite);
}

.header__nom {
  font-family: var(--police-display);
  font-weight: 600;
  font-size: 1.25rem;
}

.header__menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
}

.header__menu-icone {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--couleur-anthracite);
  position: relative;
}

.header__menu-icone::before,
.header__menu-icone::after {
  content: '';
  position: absolute;
  left: 0;
  width: 24px;
  height: 2px;
  background: var(--couleur-anthracite);
}

.header__menu-icone::before { top: -7px; }
.header__menu-icone::after { top: 7px; }

.header__nav {
  display: flex;
  align-items: center;
  gap: var(--espace-md);
}

.header__nav a {
  text-decoration: none;
  color: var(--couleur-anthracite);
}

.header__cta {
  background: var(--couleur-terracotta);
  color: var(--couleur-creme-claire) !important;
  padding: var(--espace-xs) var(--espace-sm);
  border-radius: 4px;
}

@media (max-width: 768px) {
  .header__menu-toggle {
    display: block;
  }

  .header__nav {
    display: none;
    flex-direction: column;
    align-items: flex-start;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--couleur-creme-claire);
    padding: var(--espace-md);
    border-bottom: 1px solid var(--couleur-bois-brule);
  }

  .header__nav--ouvert {
    display: flex;
  }

  .header__conteneur {
    position: relative;
  }
}
```

- [ ] **Step 3: Write the failing test for `nav.js` behavior — `tests/nav.test.js`**

Since `initNav` manipulates the DOM, and Node's test runner has no DOM by default, this test verifies the pure decision logic extracted from the toggle handler. Write `src/js/nav.js` to expose that logic as a pure function `calculerProchainEtat(etatOuvert)`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculerProchainEtat } from '../src/js/nav.js';

test('un menu ferme doit s\'ouvrir', () => {
  assert.equal(calculerProchainEtat(false), true);
});

test('un menu ouvert doit se fermer', () => {
  assert.equal(calculerProchainEtat(true), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `nav.js` does not exist yet, `Cannot find module '../src/js/nav.js'`.

- [ ] **Step 3: Write `src/js/nav.js`**

```js
export function calculerProchainEtat(etatOuvert) {
  return !etatOuvert;
}

export function initNav() {
  const bouton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav-principale]');
  if (!bouton || !nav) return;

  bouton.addEventListener('click', () => {
    const ouvert = bouton.getAttribute('aria-expanded') === 'true';
    const prochainEtat = calculerProchainEtat(ouvert);
    bouton.setAttribute('aria-expanded', String(prochainEtat));
    nav.classList.toggle('header__nav--ouvert', prochainEtat);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — both `nav.test.js` assertions succeed.

- [ ] **Step 5: Write `src/js/main.js`**

```js
import { initNav } from './nav.js';

initNav();
```

- [ ] **Step 6: Wire `header.css` into `styles.css`**

Edit `src/css/styles.css`, add after `sceau.css`:

```css
@import url('header.css');
```

- [ ] **Step 7: Commit**

```bash
git add src/_includes/composants/header.njk src/css/header.css src/css/styles.css src/js/main.js src/js/nav.js tests/nav.test.js
git commit -m "feat: add header component with mobile nav toggle"
```

---

### Task 5: Footer component

**Files:**
- Create: `src/_includes/composants/footer.njk`
- Create: `src/css/footer.css`
- Modify: `src/css/styles.css` (add `@import url('footer.css');`)

**Interfaces:**
- Produces: `composants/footer.njk` include, used by Task 6 (base layout).

- [ ] **Step 1: Write `src/_includes/composants/footer.njk`**

```njk
<footer class="footer">
  <div class="conteneur footer__grille">
    <div>
      <p class="footer__nom">Soly'bat</p>
      <p>Rénovation &amp; mise en location — rayon d'environ 50 km autour de Vierzon (Cher).</p>
    </div>
    <nav class="footer__liens">
      <a href="/renovation-location/">Notre service</a>
      <a href="/realisations/">Réalisations</a>
      <a href="/process/">Process</a>
      <a href="/espace-pro/">Espace pro</a>
      <a href="/a-propos/">À propos</a>
      <a href="/faq/">FAQ</a>
      <a href="/devis/">Devis</a>
      <a href="/mentions-legales/">Mentions légales</a>
    </nav>
  </div>
</footer>
```

- [ ] **Step 2: Write `src/css/footer.css`**

```css
.footer {
  background: var(--couleur-bois-brule);
  color: var(--couleur-creme-claire);
  padding: var(--espace-lg) 0;
}

.footer__grille {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--espace-md);
}

.footer__nom {
  font-family: var(--police-display);
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: var(--espace-xs);
}

.footer__liens {
  display: flex;
  flex-direction: column;
  gap: var(--espace-xs);
}

.footer__liens a {
  color: var(--couleur-creme-claire);
}
```

- [ ] **Step 3: Wire into `styles.css`**

Edit `src/css/styles.css`, add after `header.css`:

```css
@import url('footer.css');
```

- [ ] **Step 4: Verify build still succeeds**

Run: `npx eleventy`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/_includes/composants/footer.njk src/css/footer.css src/css/styles.css
git commit -m "feat: add footer component"
```

---

### Task 6: Base layout and 404 page

**Files:**
- Create: `src/_includes/layouts/base.njk`
- Create: `src/404.njk`

**Interfaces:**
- Consumes: `composants/header.njk` (Task 4), `composants/footer.njk` (Task 5), `/css/styles.css` (Task 2), `/js/main.js` (Task 4).
- Produces: layout `layouts/base.njk`, referenced by every page task (9 through 20) via front-matter `layout: layouts/base.njk`, expecting front-matter variables `titre` and `description`.

- [ ] **Step 1: Write `src/_includes/layouts/base.njk`**

```njk
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ titre }} — Soly'bat</title>
  <meta name="description" content="{{ description }}">
  <link rel="icon" href="/images/logo-solybat.png" type="image/png">
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  {% include "composants/header.njk" %}
  <main>
    {{ content | safe }}
  </main>
  {% include "composants/footer.njk" %}
  <script type="module" src="/js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write `src/404.njk`**

```njk
---
layout: layouts/base.njk
titre: "Page introuvable"
description: "Cette page n'existe pas ou plus."
permalink: "/404.html"
---
<section class="conteneur page-404">
  <h1>Page introuvable</h1>
  <p>La page que vous cherchez n'existe pas ou plus.</p>
  <a href="/" class="bouton bouton--principal">Retour à l'accueil</a>
</section>
```

- [ ] **Step 3: Verify the 404 page builds**

Run: `npx eleventy && grep -o "Page introuvable" _site/404.html`
Expected: `Page introuvable` printed.

- [ ] **Step 4: Commit**

```bash
git add src/_includes/layouts/base.njk src/404.njk
git commit -m "feat: add base layout and 404 page"
```

---

### Task 7: Réalisations data and carte-réalisation component

**Files:**
- Create: `src/_data/realisations.json`
- Create: `src/_includes/composants/carte-realisation.njk`
- Create: `src/css/carte.css`
- Modify: `src/css/styles.css` (add `@import url('carte.css');`)

**Interfaces:**
- Produces: global 11ty data `realisations` (array), consumed by Task 9 (homepage), Task 11 (`/realisations` index + `filtre-galerie.js`), Task 12 (`/realisations/[slug]`).
- Produces: data shape per entry — `{ slug: string, titre: string, typeDeBien: "appartement"|"maison"|"immeuble", ampleurChantier: "renovation-complete"|"renovation-partielle"|"remise-en-etat", surface: string, duree: string, corpsDeMetier: string[], resume: string, photos: { avant: string|null, apres: string|null } }`.
- Produces: Nunjucks macro `carteRealisation(projet)` from `composants/carte-realisation.njk`, importable via `{% from "composants/carte-realisation.njk" import carteRealisation %}`. Renders a `[data-slug]`, `[data-type-de-bien]`, `[data-ampleur-chantier]` card — attributes Task 11's `filtre-galerie.js` reads directly.

- [ ] **Step 1: Write `src/_data/realisations.json`**

```json
[
  {
    "slug": "appartement-t3-vierzon-centre",
    "titre": "Appartement T3 — Vierzon Centre",
    "typeDeBien": "appartement",
    "ampleurChantier": "renovation-complete",
    "surface": "62 m²",
    "duree": "6 semaines",
    "corpsDeMetier": ["plomberie", "électricité", "peinture", "sol"],
    "resume": "Appartement vétuste transformé en T3 prêt à louer, livré avec cuisine équipée.",
    "photos": { "avant": null, "apres": null }
  },
  {
    "slug": "maison-individuelle-bourges",
    "titre": "Maison individuelle — Bourges",
    "typeDeBien": "maison",
    "ampleurChantier": "renovation-partielle",
    "surface": "95 m²",
    "duree": "4 semaines",
    "corpsDeMetier": ["peinture", "sol", "électricité"],
    "resume": "Rafraîchissement complet des pièces de vie avant remise en location.",
    "photos": { "avant": null, "apres": null }
  },
  {
    "slug": "immeuble-rapport-vierzon",
    "titre": "Immeuble de rapport — Vierzon",
    "typeDeBien": "immeuble",
    "ampleurChantier": "renovation-complete",
    "surface": "4 lots — 210 m²",
    "duree": "12 semaines",
    "corpsDeMetier": ["plomberie", "électricité", "chauffage", "peinture", "sol"],
    "resume": "Rénovation complète de 4 lots d'un immeuble de rapport, livrés prêts à louer.",
    "photos": { "avant": null, "apres": null }
  },
  {
    "slug": "studio-remise-en-location",
    "titre": "Studio — remise en location",
    "typeDeBien": "appartement",
    "ampleurChantier": "remise-en-etat",
    "surface": "28 m²",
    "duree": "2 semaines",
    "corpsDeMetier": ["peinture", "nettoyage", "petites réparations"],
    "resume": "Remise en état rapide entre deux locataires : peinture, sols, petites réparations.",
    "photos": { "avant": null, "apres": null }
  }
]
```

Note: `ampleurChantier` uses three levels (`renovation-complete`, `renovation-partielle`, `remise-en-etat`) — `BRAND.md` §4 names "ampleur du chantier" as a filter axis without specifying exact values, so this plan defines the enum.

- [ ] **Step 2: Write `src/_includes/composants/carte-realisation.njk`**

```njk
{% macro carteRealisation(projet) %}
<article class="carte-realisation" data-slug="{{ projet.slug }}" data-type-de-bien="{{ projet.typeDeBien }}" data-ampleur-chantier="{{ projet.ampleurChantier }}">
  <a href="/realisations/{{ projet.slug }}/" class="carte-realisation__lien">
    {% if projet.photos.apres %}
    <img src="/images/realisations/{{ projet.photos.apres }}" alt="{{ projet.titre }}">
    {% else %}
    <div class="placeholder-photo">
      <span>{{ projet.titre }}</span>
      <span>photo à venir</span>
    </div>
    {% endif %}
    <h3 class="carte-realisation__titre">{{ projet.titre }}</h3>
    <p class="carte-realisation__meta">{{ projet.surface }} — {{ projet.duree }}</p>
  </a>
</article>
{% endmacro %}
```

- [ ] **Step 3: Write `src/css/carte.css`**

```css
.carte-realisation {
  border: 1px solid var(--couleur-bois-brule);
  border-radius: 4px;
  overflow: hidden;
  background: var(--couleur-creme-claire);
}

.carte-realisation__lien {
  display: block;
  text-decoration: none;
  color: inherit;
}

.carte-realisation__titre {
  margin: var(--espace-sm) var(--espace-sm) 0;
  font-size: 1.1rem;
}

.carte-realisation__meta {
  margin: var(--espace-xs) var(--espace-sm) var(--espace-sm);
  color: var(--couleur-bois-brule);
  font-size: 0.9rem;
}

.placeholder-photo {
  aspect-ratio: 4 / 3;
  background: var(--couleur-creme-claire);
  border-bottom: 2px dashed var(--couleur-bois-brule);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--espace-xs);
  color: var(--couleur-bois-brule);
  text-align: center;
  padding: var(--espace-sm);
}
```

- [ ] **Step 4: Wire into `styles.css`**

Edit `src/css/styles.css`, add after `footer.css`:

```css
@import url('carte.css');
```

- [ ] **Step 5: Verify the data loads and the macro renders**

Create a throwaway file `src/_test-carte.njk`:

```njk
---
permalink: "/_test-carte/"
---
{% from "composants/carte-realisation.njk" import carteRealisation %}
{% for projet in realisations %}
{{ carteRealisation(projet) }}
{% endfor %}
```

Run: `npx eleventy && grep -o "data-slug=\"appartement-t3-vierzon-centre\"" _site/_test-carte/index.html`
Expected: the attribute string is printed (data loaded and macro rendered correctly).

Then delete the throwaway file: `rm src/_test-carte.njk`

- [ ] **Step 6: Commit**

```bash
git add src/_data/realisations.json src/_includes/composants/carte-realisation.njk src/css/carte.css src/css/styles.css
git commit -m "feat: add realisations data and carte-realisation component"
```

---

### Task 8: Frise-process component

**Files:**
- Create: `src/_includes/composants/frise-process.njk`
- Create: `src/css/frise.css`
- Modify: `src/css/styles.css` (add `@import url('frise.css');`)

**Interfaces:**
- Consumes: `sceau` macro (Task 3).
- Produces: Nunjucks macro `friseProcess(detaillee)` from `composants/frise-process.njk`, importable via `{% from "composants/frise-process.njk" import friseProcess %}`. Used by Task 9 (homepage, `detaillee=false`) and Task 13 (`/process`, `detaillee=true`).

- [ ] **Step 1: Write `src/_includes/composants/frise-process.njk`**

```njk
{% from "composants/sceau.njk" import sceau %}
{% macro friseProcess(detaillee=false) %}
<ol class="frise-process">
  <li class="frise-process__etape">
    {{ sceau(32) }}
    <h3>01 Diagnostic</h3>
    <p>Visite du bien, évaluation des travaux nécessaires et des contraintes techniques.</p>
    {% if detaillee %}<p class="frise-process__delai">Sous 5 jours ouvrés après votre demande.</p>{% endif %}
  </li>
  <li class="frise-process__etape">
    {{ sceau(32) }}
    <h3>02 Devis</h3>
    <p>Devis détaillé par poste de travaux, délai d'exécution estimé.</p>
    {% if detaillee %}<p class="frise-process__delai">Sous 10 jours ouvrés après le diagnostic.</p>{% endif %}
  </li>
  <li class="frise-process__etape">
    {{ sceau(32) }}
    <h3>03 Chantier</h3>
    <p>Coordination de l'ensemble des corps de métier, suivi régulier communiqué au client.</p>
    {% if detaillee %}<p class="frise-process__delai">Durée variable selon l'ampleur, en moyenne 4 à 8 semaines.</p>{% endif %}
  </li>
  <li class="frise-process__etape">
    {{ sceau(32) }}
    <h3>04 Remise des clés</h3>
    <p>Réception des travaux, bien prêt à louer ou à vivre.</p>
    {% if detaillee %}<p class="frise-process__delai">État des lieux et remise des clés en main propre.</p>{% endif %}
  </li>
</ol>
{% endmacro %}
```

- [ ] **Step 2: Write `src/css/frise.css`**

```css
.frise-process {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--espace-md);
}

.frise-process__etape {
  text-align: center;
}

.frise-process__etape h3 {
  font-size: 1rem;
  margin: var(--espace-xs) 0;
}

.frise-process__delai {
  color: var(--couleur-bois-brule);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .frise-process {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Wire into `styles.css`**

Edit `src/css/styles.css`, add after `carte.css`:

```css
@import url('frise.css');
```

- [ ] **Step 4: Verify build succeeds**

Run: `npx eleventy`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/_includes/composants/frise-process.njk src/css/frise.css src/css/styles.css
git commit -m "feat: add frise-process component"
```

---

### Task 9: Homepage

**Files:**
- Create: `src/index.njk`
- Create: `src/css/hero.css`
- Modify: `src/css/styles.css` (add `@import url('hero.css');`)

**Interfaces:**
- Consumes: `layouts/base.njk` (Task 6), `sceau` macro (Task 3), `friseProcess` macro (Task 8), `carteRealisation` macro + `realisations` data (Task 7).

- [ ] **Step 1: Write `src/css/hero.css`**

```css
.hero {
  padding: var(--espace-xl) 0;
  text-align: center;
}

.hero h1 {
  font-size: 2.5rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.hero__sous-titre {
  max-width: 600px;
  margin: var(--espace-sm) auto var(--espace-md);
}

.pour-qui {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--espace-md);
}

.pour-qui__colonne {
  background: var(--couleur-creme-claire);
  padding: var(--espace-md);
  border-radius: 4px;
}

.garanties {
  text-align: center;
  background: var(--couleur-creme-claire);
}

.realisations-apercu {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--espace-md);
}

@media (max-width: 768px) {
  .pour-qui,
  .realisations-apercu {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Write `src/index.njk`**

```njk
---
layout: layouts/base.njk
titre: "Accueil"
description: "Soly'bat prend en charge l'intégralité des travaux de rénovation de votre bien, du diagnostic à la remise des clés."
---
{% from "composants/sceau.njk" import sceau %}
{% from "composants/frise-process.njk" import friseProcess %}
{% from "composants/carte-realisation.njk" import carteRealisation %}

<section class="hero conteneur">
  {{ sceau(72, true) }}
  <h1>Un bien à rénover. Un bien loué. Un seul interlocuteur.</h1>
  <p class="hero__sous-titre">Soly'bat prend en charge l'intégralité des travaux de rénovation de votre bien, du diagnostic à la remise des clés, pour un logement prêt à louer ou à vivre.</p>
  <a href="/devis/" class="bouton bouton--principal">Demander un devis</a>
</section>

<section class="conteneur">
  <h2>Notre process</h2>
  {{ friseProcess() }}
</section>

<section class="conteneur">
  <h2>Nos dernières réalisations</h2>
  <div class="realisations-apercu">
    {% for projet in realisations | reverse %}
      {% if loop.index <= 4 %}{{ carteRealisation(projet) }}{% endif %}
    {% endfor %}
  </div>
  <p><a href="/realisations/">Voir toutes les réalisations</a></p>
</section>

<section class="conteneur">
  <h2>Pour qui</h2>
  <div class="pour-qui">
    <div class="pour-qui__colonne">
      <h3>Agences &amp; gestionnaires</h3>
      <p>Un prestataire fiable et réactif pour vos biens à remettre en location, avec un interlocuteur unique du diagnostic à la livraison.</p>
    </div>
    <div class="pour-qui__colonne">
      <h3>Investisseurs locatifs</h3>
      <p>Un bien rentable, rénové rapidement, sans gérer dix corps de métier différents.</p>
    </div>
    <div class="pour-qui__colonne">
      <h3>Particuliers</h3>
      <p>La rénovation de votre résidence ou de votre bien locatif, expliquée simplement, sans jargon.</p>
    </div>
  </div>
</section>

<section class="garanties conteneur">
  {{ sceau(56) }}
  <h2>Chantier garanti</h2>
  <p>Assurance décennale, responsabilité civile professionnelle, suivi de chantier à chaque étape.</p>
</section>

<section class="conteneur" style="text-align: center;">
  <h2>Un projet de rénovation ?</h2>
  <a href="/devis/" class="bouton bouton--principal">Demander un devis</a>
</section>
```

- [ ] **Step 3: Wire `hero.css` into `styles.css`**

Edit `src/css/styles.css`, add after `frise.css`:

```css
@import url('hero.css');
```

- [ ] **Step 4: Verify the homepage builds with the expected content**

Run: `npx eleventy && grep -o "Un bien à rénover. Un bien loué. Un seul interlocuteur." _site/index.html`
Expected: the hero title string is printed.

Run: `grep -c "carte-realisation" _site/index.html`
Expected: a count of at least `4` (one per réalisation card in the preview).

- [ ] **Step 5: Commit**

```bash
git add src/index.njk src/css/hero.css src/css/styles.css
git commit -m "feat: build homepage"
```

---

### Task 10: `/renovation-location` page with tabs

**Files:**
- Create: `src/renovation-location.njk`
- Create: `src/css/onglets.css`
- Create: `src/js/onglets.js`
- Create: `tests/onglets.test.js`
- Modify: `src/js/main.js` (import and call `initOnglets`)
- Modify: `src/css/styles.css` (add `@import url('onglets.css');`)

**Interfaces:**
- Produces: `export function calculerOngletActif(boutons, cible)` (pure — returns the index of the button whose `data-onglet-bouton` equals `cible`, or `0` if none match) and `export function initOnglets()` from `onglets.js`.

- [ ] **Step 1: Write the failing test — `tests/onglets.test.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculerOngletActif } from '../src/js/onglets.js';

test('trouve l\'index du bouton correspondant à la cible', () => {
  const boutons = [{ dataset: { ongletBouton: 'agence' } }, { dataset: { ongletBouton: 'investisseur' } }];
  assert.equal(calculerOngletActif(boutons, 'investisseur'), 1);
});

test('retombe sur 0 si aucune cible ne correspond', () => {
  const boutons = [{ dataset: { ongletBouton: 'agence' } }, { dataset: { ongletBouton: 'investisseur' } }];
  assert.equal(calculerOngletActif(boutons, 'inexistant'), 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/js/onglets.js'`.

- [ ] **Step 3: Write `src/js/onglets.js`**

```js
export function calculerOngletActif(boutons, cible) {
  const index = boutons.findIndex((bouton) => bouton.dataset.ongletBouton === cible);
  return index === -1 ? 0 : index;
}

export function initOnglets() {
  const conteneurs = document.querySelectorAll('[data-onglets]');
  conteneurs.forEach((conteneur) => {
    const boutons = Array.from(conteneur.querySelectorAll('[data-onglet-bouton]'));
    const panneaux = Array.from(conteneur.querySelectorAll('[data-onglet-panneau]'));
    if (boutons.length === 0) return;

    function activer(cible) {
      const index = calculerOngletActif(boutons, cible);
      boutons.forEach((bouton, i) => bouton.setAttribute('aria-selected', String(i === index)));
      panneaux.forEach((panneau) => {
        panneau.hidden = panneau.dataset.ongletPanneau !== boutons[index].dataset.ongletBouton;
      });
    }

    boutons.forEach((bouton) => {
      bouton.addEventListener('click', () => activer(bouton.dataset.ongletBouton));
    });

    activer(boutons[0].dataset.ongletBouton);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — both `onglets.test.js` assertions succeed (plus the earlier `nav.test.js` assertions still pass).

- [ ] **Step 5: Wire `initOnglets` into `main.js`**

Edit `src/js/main.js` to:

```js
import { initNav } from './nav.js';
import { initOnglets } from './onglets.js';

initNav();
initOnglets();
```

- [ ] **Step 6: Write `src/css/onglets.css`**

```css
.onglets__boutons {
  display: flex;
  gap: var(--espace-sm);
  border-bottom: 1px solid var(--couleur-bois-brule);
  margin-bottom: var(--espace-md);
}

.onglets__bouton {
  background: none;
  border: none;
  padding: var(--espace-xs) var(--espace-sm);
  cursor: pointer;
  font-weight: 600;
  color: var(--couleur-anthracite);
  border-bottom: 3px solid transparent;
}

.onglets__bouton[aria-selected="true"] {
  border-bottom-color: var(--couleur-terracotta);
  color: var(--couleur-terracotta);
}
```

- [ ] **Step 7: Wire `onglets.css` into `styles.css`**

Edit `src/css/styles.css`, add after `hero.css`:

```css
@import url('onglets.css');
```

- [ ] **Step 8: Write `src/renovation-location.njk`**

```njk
---
layout: layouts/base.njk
titre: "Notre service"
description: "Soly'bat prend en charge l'intégralité des travaux nécessaires pour rendre votre bien prêt à louer ou à vivre."
---
<section class="conteneur">
  <h1>Notre service</h1>
  <p>Soly'bat prend en charge l'intégralité des travaux nécessaires pour rendre votre bien prêt à louer ou à vivre : plomberie, électricité, peinture, sols, cuisine, salle de bain. Un seul interlocuteur, un chantier coordonné, un délai maîtrisé.</p>

  <div data-onglets>
    <div class="onglets__boutons" role="tablist">
      <button type="button" class="onglets__bouton" data-onglet-bouton="agence" role="tab" aria-selected="false">Agences</button>
      <button type="button" class="onglets__bouton" data-onglet-bouton="investisseur" role="tab" aria-selected="false">Investisseurs</button>
      <button type="button" class="onglets__bouton" data-onglet-bouton="particulier" role="tab" aria-selected="false">Particuliers</button>
    </div>

    <div data-onglet-panneau="agence" role="tabpanel">
      <h2>Agences &amp; gestionnaires</h2>
      <p>Vous gérez plusieurs biens à remettre en location rapidement. Nous intervenons avec la même réactivité sur chaque chantier, avec un reporting régulier et une facturation adaptée aux volumes.</p>
    </div>
    <div data-onglet-panneau="investisseur" role="tabpanel">
      <h2>Investisseurs locatifs</h2>
      <p>Vous voulez un bien rentable sans passer votre temps à coordonner dix artisans. Nous prenons en charge l'intégralité du chantier, du diagnostic à la remise des clés.</p>
    </div>
    <div data-onglet-panneau="particulier" role="tabpanel">
      <h2>Particuliers</h2>
      <p>Vous rénovez votre résidence ou un bien à louer. Nous vous expliquons chaque étape sans jargon technique, avec un devis clair par poste de travaux.</p>
    </div>
  </div>
</section>
```

Note on graceful degradation: the three `[data-onglet-panneau]` blocks have no `hidden` attribute in the raw markup, so without JS all three stay visible and stacked (readable). `initOnglets()` only hides the non-active ones once JS runs.

- [ ] **Step 9: Verify the page builds and tabs render**

Run: `npx eleventy && grep -o "data-onglet-panneau=\"investisseur\"" _site/renovation-location/index.html`
Expected: the attribute string is printed.

- [ ] **Step 10: Commit**

```bash
git add src/renovation-location.njk src/css/onglets.css src/css/styles.css src/js/onglets.js src/js/main.js tests/onglets.test.js
git commit -m "feat: add renovation-location page with tabs"
```

---

### Task 11: `/realisations` gallery page with filters

**Files:**
- Create: `src/realisations/index.njk`
- Create: `src/css/galerie.css`
- Create: `src/js/filtre-galerie.js`
- Create: `tests/filtre-galerie.test.js`
- Modify: `src/js/main.js` (import and call `initFiltreGalerie`)
- Modify: `src/css/styles.css` (already imports `galerie.css` from Task 2 — verify it's present; if not, add it)

**Interfaces:**
- Consumes: `carteRealisation` macro + `realisations` data (Task 7).
- Produces: `export function filtrerRealisations(realisations, filtres)` (pure) and `export function initFiltreGalerie()` from `filtre-galerie.js`.

- [ ] **Step 1: Write the failing test — `tests/filtre-galerie.test.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filtrerRealisations } from '../src/js/filtre-galerie.js';

const jeuDeDonnees = [
  { slug: 'a', typeDeBien: 'appartement', ampleurChantier: 'renovation-complete' },
  { slug: 'b', typeDeBien: 'maison', ampleurChantier: 'renovation-partielle' },
  { slug: 'c', typeDeBien: 'appartement', ampleurChantier: 'remise-en-etat' },
];

test('filtre par type de bien uniquement', () => {
  const resultat = filtrerRealisations(jeuDeDonnees, { typeDeBien: 'appartement', ampleurChantier: 'tous' });
  assert.deepEqual(resultat.map((r) => r.slug), ['a', 'c']);
});

test('filtre par ampleur uniquement', () => {
  const resultat = filtrerRealisations(jeuDeDonnees, { typeDeBien: 'tous', ampleurChantier: 'renovation-partielle' });
  assert.deepEqual(resultat.map((r) => r.slug), ['b']);
});

test('filtre combiné qui ne correspond à rien', () => {
  const resultat = filtrerRealisations(jeuDeDonnees, { typeDeBien: 'maison', ampleurChantier: 'remise-en-etat' });
  assert.deepEqual(resultat, []);
});

test('aucun filtre renvoie tout', () => {
  const resultat = filtrerRealisations(jeuDeDonnees, { typeDeBien: 'tous', ampleurChantier: 'tous' });
  assert.equal(resultat.length, 3);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/js/filtre-galerie.js'`.

- [ ] **Step 3: Write `src/js/filtre-galerie.js`**

```js
export function filtrerRealisations(realisations, filtres) {
  return realisations.filter((realisation) => {
    const matchType = filtres.typeDeBien === 'tous' || realisation.typeDeBien === filtres.typeDeBien;
    const matchAmpleur = filtres.ampleurChantier === 'tous' || realisation.ampleurChantier === filtres.ampleurChantier;
    return matchType && matchAmpleur;
  });
}

export function initFiltreGalerie() {
  const galerie = document.querySelector('[data-galerie]');
  if (!galerie) return;

  const cartes = Array.from(galerie.querySelectorAll('[data-slug]'));
  const realisations = cartes.map((carte) => ({
    slug: carte.dataset.slug,
    typeDeBien: carte.dataset.typeDeBien,
    ampleurChantier: carte.dataset.ampleurChantier,
  }));

  const selectType = document.querySelector('[data-filtre-type]');
  const selectAmpleur = document.querySelector('[data-filtre-ampleur]');
  const messageVide = document.querySelector('[data-galerie-vide]');
  if (!selectType || !selectAmpleur || !messageVide) return;

  function appliquerFiltres() {
    const filtres = { typeDeBien: selectType.value, ampleurChantier: selectAmpleur.value };
    const slugsVisibles = filtrerRealisations(realisations, filtres).map((r) => r.slug);
    cartes.forEach((carte) => {
      carte.hidden = !slugsVisibles.includes(carte.dataset.slug);
    });
    messageVide.hidden = slugsVisibles.length > 0;
  }

  selectType.addEventListener('change', appliquerFiltres);
  selectAmpleur.addEventListener('change', appliquerFiltres);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all `filtre-galerie.test.js` assertions succeed.

- [ ] **Step 5: Wire `initFiltreGalerie` into `main.js`**

Edit `src/js/main.js` to:

```js
import { initNav } from './nav.js';
import { initOnglets } from './onglets.js';
import { initFiltreGalerie } from './filtre-galerie.js';

initNav();
initOnglets();
initFiltreGalerie();
```

- [ ] **Step 6: Write `src/css/galerie.css`**

```css
.galerie__filtres {
  display: flex;
  gap: var(--espace-md);
  margin-bottom: var(--espace-md);
}

.galerie__filtres select {
  padding: var(--espace-xs);
  border: 1px solid var(--couleur-bois-brule);
  border-radius: 4px;
  background: var(--couleur-creme-claire);
  color: var(--couleur-anthracite);
}

.galerie__grille {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--espace-md);
}

.galerie__vide {
  text-align: center;
  color: var(--couleur-bois-brule);
}

@media (max-width: 768px) {
  .galerie__grille {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 7: Verify `galerie.css` is imported in `styles.css`**

Open `src/css/styles.css`. If `@import url('galerie.css');` is not already present (it was listed in Task 2's initial version), add it after `onglets.css`.

- [ ] **Step 8: Write `src/realisations/index.njk`**

```njk
---
layout: layouts/base.njk
titre: "Réalisations"
description: "Découvrez les chantiers de rénovation réalisés par Soly'bat."
---
{% from "composants/carte-realisation.njk" import carteRealisation %}
<section class="conteneur">
  <h1>Nos réalisations</h1>

  <div class="galerie__filtres">
    <label>
      Type de bien
      <select data-filtre-type>
        <option value="tous">Tous</option>
        <option value="appartement">Appartement</option>
        <option value="maison">Maison</option>
        <option value="immeuble">Immeuble</option>
      </select>
    </label>
    <label>
      Ampleur du chantier
      <select data-filtre-ampleur>
        <option value="tous">Toutes</option>
        <option value="renovation-complete">Rénovation complète</option>
        <option value="renovation-partielle">Rénovation partielle</option>
        <option value="remise-en-etat">Remise en état</option>
      </select>
    </label>
  </div>

  <p class="galerie__vide" data-galerie-vide hidden>Aucune réalisation ne correspond à ces filtres.</p>

  <div class="galerie__grille" data-galerie>
    {% for projet in realisations %}
      {{ carteRealisation(projet) }}
    {% endfor %}
  </div>
</section>
```

- [ ] **Step 9: Verify the page builds with filter markup and all 4 sample cards**

Run: `npx eleventy && grep -c "data-slug" _site/realisations/index.html`
Expected: `4`.

Run: `grep -o "data-filtre-type" _site/realisations/index.html`
Expected: `data-filtre-type` printed.

- [ ] **Step 10: Commit**

```bash
git add src/realisations/index.njk src/css/galerie.css src/css/styles.css src/js/filtre-galerie.js src/js/main.js tests/filtre-galerie.test.js
git commit -m "feat: add realisations gallery page with client-side filters"
```

---

### Task 12: `/realisations/[slug]` project page with before/after slider

**Files:**
- Create: `src/realisations/projet.njk`
- Create: `src/css/slider.css`
- Create: `src/js/slider-avant-apres.js`
- Create: `tests/slider-avant-apres.test.js`
- Modify: `src/js/main.js` (import and call `initSliderAvantApres`)
- Modify: `src/css/styles.css` (add `@import url('slider.css');`)

**Interfaces:**
- Consumes: `realisations` data (Task 7), paginated by 11ty.
- Produces: `export function calculerPositionPourcentage(clientX, rectLeft, rectWidth)` (pure) and `export function initSliderAvantApres()` from `slider-avant-apres.js`.

- [ ] **Step 1: Write the failing test — `tests/slider-avant-apres.test.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculerPositionPourcentage } from '../src/js/slider-avant-apres.js';

test('position au centre donne 50%', () => {
  assert.equal(calculerPositionPourcentage(150, 100, 100), 50);
});

test('position avant le bord gauche est bornée à 0', () => {
  assert.equal(calculerPositionPourcentage(50, 100, 100), 0);
});

test('position après le bord droit est bornée à 100', () => {
  assert.equal(calculerPositionPourcentage(300, 100, 100), 100);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/js/slider-avant-apres.js'`.

- [ ] **Step 3: Write `src/js/slider-avant-apres.js`**

```js
export function calculerPositionPourcentage(clientX, rectLeft, rectWidth) {
  const position = ((clientX - rectLeft) / rectWidth) * 100;
  return Math.min(100, Math.max(0, position));
}

export function initSliderAvantApres() {
  const sliders = document.querySelectorAll('[data-slider-avant-apres]');
  sliders.forEach((slider) => {
    const curseur = slider.querySelector('[data-slider-curseur]');
    const calqueApres = slider.querySelector('[data-slider-apres]');
    if (!curseur || !calqueApres) return;

    function deplacer(clientX) {
      const rect = slider.getBoundingClientRect();
      const pourcentage = calculerPositionPourcentage(clientX, rect.left, rect.width);
      calqueApres.style.clipPath = `inset(0 0 0 ${pourcentage}%)`;
      curseur.style.left = `${pourcentage}%`;
    }

    curseur.addEventListener('pointerdown', (evenementDebut) => {
      curseur.setPointerCapture(evenementDebut.pointerId);

      function onMove(evenement) {
        deplacer(evenement.clientX);
      }
      function onUp() {
        curseur.removeEventListener('pointermove', onMove);
        curseur.removeEventListener('pointerup', onUp);
      }

      curseur.addEventListener('pointermove', onMove);
      curseur.addEventListener('pointerup', onUp);
    });
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all `slider-avant-apres.test.js` assertions succeed.

- [ ] **Step 5: Wire `initSliderAvantApres` into `main.js`**

Edit `src/js/main.js` to:

```js
import { initNav } from './nav.js';
import { initOnglets } from './onglets.js';
import { initFiltreGalerie } from './filtre-galerie.js';
import { initSliderAvantApres } from './slider-avant-apres.js';

initNav();
initOnglets();
initFiltreGalerie();
initSliderAvantApres();
```

- [ ] **Step 6: Write `src/css/slider.css`**

```css
.slider-avant-apres {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 4px;
  user-select: none;
}

.slider-avant-apres__calque {
  position: absolute;
  inset: 0;
}

.slider-avant-apres__curseur {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 4px;
  background: var(--couleur-terracotta);
  cursor: ew-resize;
  transform: translateX(-2px);
}

.projet__meta {
  display: flex;
  gap: var(--espace-md);
  flex-wrap: wrap;
  margin: var(--espace-md) 0;
}

.projet__meta dt {
  font-weight: 600;
  color: var(--couleur-bois-brule);
}
```

- [ ] **Step 7: Wire `slider.css` into `styles.css`**

Edit `src/css/styles.css`, add after `galerie.css`:

```css
@import url('slider.css');
```

- [ ] **Step 8: Write `src/realisations/projet.njk`**

```njk
---
layout: layouts/base.njk
pagination:
  data: realisations
  size: 1
  alias: projet
permalink: "/realisations/{{ projet.slug }}/"
eleventyComputed:
  titre: "{{ projet.titre }}"
  description: "{{ projet.resume }}"
---
<section class="conteneur">
  <p><a href="/realisations/">← Retour aux réalisations</a></p>
  <h1>{{ projet.titre }}</h1>

  {% if projet.photos.avant and projet.photos.apres %}
  <div class="slider-avant-apres" data-slider-avant-apres>
    <img class="slider-avant-apres__calque" src="/images/realisations/{{ projet.photos.avant }}" alt="{{ projet.titre }} — avant">
    <img class="slider-avant-apres__calque" data-slider-apres src="/images/realisations/{{ projet.photos.apres }}" alt="{{ projet.titre }} — après" style="clip-path: inset(0 0 0 50%);">
    <div class="slider-avant-apres__curseur" data-slider-curseur></div>
  </div>
  {% else %}
  <div class="placeholder-photo">
    <span>{{ projet.titre }}</span>
    <span>photos avant/après à venir</span>
  </div>
  {% endif %}

  <dl class="projet__meta">
    <div><dt>Surface</dt><dd>{{ projet.surface }}</dd></div>
    <div><dt>Durée</dt><dd>{{ projet.duree }}</dd></div>
    <div><dt>Corps de métier</dt><dd>{{ projet.corpsDeMetier | join(", ") }}</dd></div>
  </dl>

  <p>{{ projet.resume }}</p>
</section>
```

Note: `eleventyComputed` is used because `titre`/`description` need the paginated `projet` variable, which isn't available as plain front-matter YAML.

- [ ] **Step 9: Verify all 4 project pages build, and the placeholder shows since `photos` are `null`**

Run: `npx eleventy && ls _site/realisations/`
Expected: 4 directories, one per slug in `realisations.json` (`appartement-t3-vierzon-centre`, `maison-individuelle-bourges`, `immeuble-rapport-vierzon`, `studio-remise-en-location`), plus `index.html`.

Run: `grep -o "photos avant/après à venir" _site/realisations/appartement-t3-vierzon-centre/index.html`
Expected: the placeholder text is printed (since `photos.avant`/`photos.apres` are `null` in the sample data).

- [ ] **Step 10: Commit**

```bash
git add src/realisations/projet.njk src/css/slider.css src/css/styles.css src/js/slider-avant-apres.js src/js/main.js tests/slider-avant-apres.test.js
git commit -m "feat: add project detail page with before/after slider"
```

---

### Task 13: `/process` page

**Files:**
- Create: `src/process.njk`

**Interfaces:**
- Consumes: `friseProcess` macro (Task 8), called with `detaillee=true`.

- [ ] **Step 1: Write `src/process.njk`**

```njk
---
layout: layouts/base.njk
titre: "Process"
description: "Le déroulé détaillé d'un chantier Soly'bat, du diagnostic à la remise des clés."
---
{% from "composants/frise-process.njk" import friseProcess %}
<section class="conteneur">
  <h1>Notre process</h1>
  <p>Chaque chantier suit les mêmes 4 étapes, avec un suivi communiqué régulièrement.</p>
  {{ friseProcess(true) }}
</section>
```

- [ ] **Step 2: Verify the page builds with delay text**

Run: `npx eleventy && grep -o "Sous 5 jours ouvrés" _site/process/index.html`
Expected: the string is printed (confirms `detaillee=true` renders the delay paragraphs).

- [ ] **Step 3: Commit**

```bash
git add src/process.njk
git commit -m "feat: add process page"
```

---

### Task 14: `/espace-pro` page

**Files:**
- Create: `src/espace-pro.njk`
- Create: `src/css/espace-pro.css`
- Modify: `src/css/styles.css` (add `@import url('espace-pro.css');`)

- [ ] **Step 1: Write `src/css/espace-pro.css`**

```css
.plaquette-a-venir {
  display: inline-block;
  padding: var(--espace-xs) var(--espace-sm);
  background: var(--couleur-creme-claire);
  color: var(--couleur-bois-brule);
  border: 1px dashed var(--couleur-bois-brule);
  border-radius: 4px;
  cursor: not-allowed;
}
```

- [ ] **Step 2: Write `src/espace-pro.njk`**

```njk
---
layout: layouts/base.njk
titre: "Espace pro"
description: "Soly'bat, un prestataire réactif pour les agences et gestionnaires de biens."
---
<section class="conteneur">
  <h1>Un prestataire réactif pour vos biens à remettre en location</h1>
  <p>Agences immobilières et gestionnaires de biens : Soly'bat intervient sur vos chantiers de remise en location avec une réactivité adaptée à vos volumes. Un interlocuteur unique par chantier, un reporting régulier, une facturation simplifiée pour les prestataires récurrents.</p>

  <h2>Plaquette de présentation</h2>
  <span class="plaquette-a-venir" aria-disabled="true">Plaquette PDF — à venir</span>

  <h2>Un chantier à nous confier ?</h2>
  <a href="/devis/" class="bouton bouton--principal">Demander un devis</a>
</section>
```

- [ ] **Step 3: Wire into `styles.css`**

Edit `src/css/styles.css`, add after `slider.css`:

```css
@import url('espace-pro.css');
```

- [ ] **Step 4: Verify the page builds and the PDF link is inert, not a broken link**

Run: `npx eleventy && grep -o "Plaquette PDF — à venir" _site/espace-pro/index.html`
Expected: the string is printed.

Run: `grep -c "<a href=\"/espace-pro" _site/espace-pro/index.html`
Expected: `0` — confirms there's no `<a>` pointing at a non-existent PDF (it's a `<span>`, not a link).

- [ ] **Step 5: Commit**

```bash
git add src/espace-pro.njk src/css/espace-pro.css src/css/styles.css
git commit -m "feat: add espace-pro page"
```

---

### Task 15: `/a-propos` page

**Files:**
- Create: `src/a-propos.njk`

- [ ] **Step 1: Write `src/a-propos.njk`**

```njk
---
layout: layouts/base.njk
titre: "À propos"
description: "L'histoire, les valeurs et la zone d'intervention de Soly'bat."
---
<section class="conteneur">
  <h1>À propos de Soly'bat</h1>
  <p>Soly'bat intervient sur un rayon d'environ 50 km autour de Vierzon (Cher, Centre-Val de Loire). Notre positionnement : transformer un bien à rénover en bien prêt à louer ou à vivre, avec un seul interlocuteur, un seul chantier, un délai maîtrisé.</p>

  <h2>Nos valeurs</h2>
  <p>Sobriété et précision plutôt que promesses commerciales : nous communiquons des délais et des coûts clairs, à chaque étape du chantier. Nous nous adressons aussi bien aux professionnels de l'immobilier qu'aux particuliers, sans jargon technique non expliqué.</p>

  <h2>Zone d'intervention</h2>
  <p>Vierzon et un rayon d'environ 50 km : Bourges, Vierzon, Issoudun, Romorantin-Lanthenay et les communes environnantes.</p>
</section>
```

- [ ] **Step 2: Verify the page builds**

Run: `npx eleventy && grep -o "rayon d'environ 50 km" _site/a-propos/index.html`
Expected: the string is printed.

- [ ] **Step 3: Commit**

```bash
git add src/a-propos.njk
git commit -m "feat: add a-propos page"
```

---

### Task 16: `/faq` page

**Files:**
- Create: `src/faq.njk`
- Create: `src/css/faq.css`
- Modify: `src/css/styles.css` (add `@import url('faq.css');`)

- [ ] **Step 1: Write `src/css/faq.css`**

```css
.faq details {
  border-bottom: 1px solid var(--couleur-bois-brule);
  padding: var(--espace-sm) 0;
}

.faq summary {
  cursor: pointer;
  font-weight: 600;
  font-family: var(--police-display);
}

.faq details p {
  margin-top: var(--espace-xs);
}
```

- [ ] **Step 2: Write `src/faq.njk`**

```njk
---
layout: layouts/base.njk
titre: "FAQ"
description: "Délais, garanties, assurances et paiement — les questions fréquentes sur nos chantiers."
---
<section class="conteneur faq">
  <h1>Questions fréquentes</h1>

  <details>
    <summary>Quels sont les délais moyens d'un chantier ?</summary>
    <p>Comptez en moyenne 4 à 8 semaines selon l'ampleur des travaux, du diagnostic à la remise des clés.</p>
  </details>

  <details>
    <summary>Êtes-vous assurés ?</summary>
    <p>Oui, Soly'bat dispose d'une assurance décennale et d'une responsabilité civile professionnelle couvrant l'ensemble des travaux réalisés.</p>
  </details>

  <details>
    <summary>Comment se déroule le paiement ?</summary>
    <p>Un acompte est demandé au démarrage du chantier, le solde à la remise des clés, selon les modalités précisées dans le devis.</p>
  </details>

  <details>
    <summary>Intervenez-vous en dehors de Vierzon ?</summary>
    <p>Nous intervenons dans un rayon d'environ 50 km autour de Vierzon (Cher).</p>
  </details>

  <details>
    <summary>Puis-je suivre l'avancement du chantier ?</summary>
    <p>Oui, un point d'avancement régulier vous est communiqué à chaque étape du chantier.</p>
  </details>
</section>
```

- [ ] **Step 3: Wire into `styles.css`**

Edit `src/css/styles.css`, add after `espace-pro.css`:

```css
@import url('faq.css');
```

- [ ] **Step 4: Verify the page builds without JS dependency**

Run: `npx eleventy && grep -c "<details>" _site/faq/index.html`
Expected: `5`.

- [ ] **Step 5: Commit**

```bash
git add src/faq.njk src/css/faq.css src/css/styles.css
git commit -m "feat: add faq page with native details/summary accordion"
```

---

### Task 17: `/devis` page with quote-request form

**Files:**
- Create: `src/_includes/composants/formulaire-devis.njk`
- Create: `src/devis.njk`
- Create: `src/css/formulaire.css`
- Create: `src/js/form-devis.js`
- Create: `tests/form-devis.test.js`
- Modify: `src/js/main.js` (import and call `initFormDevis`)
- Modify: `src/css/styles.css` (already imports `formulaire.css` from Task 2 — verify present, add if missing)

**Interfaces:**
- Produces: `export function validerFormulaire(donnees)` (pure — returns `{ valide: boolean, erreurs: Record<string, string> }`) and `export function initFormDevis()` from `form-devis.js`.
- Produces: form fields posted to `/traiter-devis.php` (Task 18): `profil`, `nom`, `email`, `telephone`, `message`, plus profile-specific fields (`volume_estime`, `delai_souhaite`, `adresse_bien`) and honeypot field `site_web`.
- Consumes: query parameters `erreur`, `profil`, `nom`, `email`, `telephone`, `message` on `/devis/?...` — set by `traiter-devis.php` (Task 18) when server-side validation fails, read by `initFormDevis()` (Step 9) to prefill the form and show the error banner.

- [ ] **Step 1: Write the failing test — `tests/form-devis.test.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validerFormulaire } from '../src/js/form-devis.js';

test('accepte des donnees completes et valides', () => {
  const resultat = validerFormulaire({
    profil: 'particulier',
    nom: 'Jean Dupont',
    email: 'jean@example.com',
    message: 'Bonjour, je souhaite un devis.',
  });
  assert.equal(resultat.valide, true);
  assert.deepEqual(resultat.erreurs, {});
});

test('rejette un email mal forme', () => {
  const resultat = validerFormulaire({
    profil: 'particulier',
    nom: 'Jean Dupont',
    email: 'pas-un-email',
    message: 'Bonjour',
  });
  assert.equal(resultat.valide, false);
  assert.ok(resultat.erreurs.email);
});

test('rejette des champs requis manquants', () => {
  const resultat = validerFormulaire({ profil: '', nom: '', email: '', message: '' });
  assert.equal(resultat.valide, false);
  assert.equal(Object.keys(resultat.erreurs).length, 4);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/js/form-devis.js'`.

- [ ] **Step 3: Write `src/js/form-devis.js`**

```js
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validerFormulaire(donnees) {
  const erreurs = {};

  if (!donnees.profil) {
    erreurs.profil = 'Sélectionnez un profil.';
  }
  if (!donnees.nom || donnees.nom.trim() === '') {
    erreurs.nom = 'Le nom est requis.';
  }
  if (!donnees.email || !REGEX_EMAIL.test(donnees.email)) {
    erreurs.email = 'Adresse email invalide.';
  }
  if (!donnees.message || donnees.message.trim() === '') {
    erreurs.message = 'Le message est requis.';
  }

  return { valide: Object.keys(erreurs).length === 0, erreurs };
}

export function initFormDevis() {
  const formulaire = document.querySelector('[data-formulaire-devis]');
  if (!formulaire) return;

  const boutonsProfil = Array.from(formulaire.querySelectorAll('[data-profil-bouton]'));
  const blocsProfil = Array.from(formulaire.querySelectorAll('[data-profil-bloc]'));
  const champProfil = formulaire.querySelector('[data-profil-input]');

  function selectionnerProfil(profil) {
    champProfil.value = profil;
    blocsProfil.forEach((bloc) => {
      bloc.hidden = bloc.dataset.profilBloc !== profil;
    });
    boutonsProfil.forEach((bouton) => {
      bouton.setAttribute('aria-pressed', String(bouton.dataset.profilBouton === profil));
    });
  }

  boutonsProfil.forEach((bouton) => {
    bouton.addEventListener('click', () => selectionnerProfil(bouton.dataset.profilBouton));
  });

  formulaire.addEventListener('submit', (evenement) => {
    const donnees = Object.fromEntries(new FormData(formulaire));
    const resultat = validerFormulaire(donnees);
    const zoneErreurs = formulaire.querySelector('[data-formulaire-erreurs]');
    if (!resultat.valide) {
      evenement.preventDefault();
      zoneErreurs.hidden = false;
      zoneErreurs.textContent = Object.values(resultat.erreurs).join(' ');
    }
  });
}
```

Note: this step only covers the pure `validerFormulaire` function and the initial submit-time wiring. Step 8b (below, after the component markup exists) adds the query-string prefill behavior used when the server (`traiter-devis.php`, Task 18) redirects back after a server-side validation failure.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all `form-devis.test.js` assertions succeed.

- [ ] **Step 5: Wire `initFormDevis` into `main.js`**

Edit `src/js/main.js` to its final form:

```js
import { initNav } from './nav.js';
import { initOnglets } from './onglets.js';
import { initFiltreGalerie } from './filtre-galerie.js';
import { initSliderAvantApres } from './slider-avant-apres.js';
import { initFormDevis } from './form-devis.js';

initNav();
initOnglets();
initFiltreGalerie();
initSliderAvantApres();
initFormDevis();
```

- [ ] **Step 6: Write `src/css/formulaire.css`**

```css
.formulaire-devis {
  display: flex;
  flex-direction: column;
  gap: var(--espace-sm);
  max-width: 600px;
}

.formulaire-devis label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: 600;
}

.formulaire-devis input,
.formulaire-devis textarea {
  padding: var(--espace-xs);
  border: 1px solid var(--couleur-bois-brule);
  border-radius: 4px;
  font: inherit;
}

.formulaire-devis__profil {
  display: flex;
  gap: var(--espace-xs);
  border: none;
  padding: 0;
}

.formulaire-devis__profil-bouton {
  padding: var(--espace-xs) var(--espace-sm);
  border: 2px solid var(--couleur-bois-brule);
  border-radius: 4px;
  background: var(--couleur-creme-claire);
  cursor: pointer;
}

.formulaire-devis__profil-bouton[aria-pressed="true"] {
  background: var(--couleur-terracotta);
  color: var(--couleur-creme-claire);
  border-color: var(--couleur-terracotta);
}

.formulaire-devis__erreurs {
  color: var(--couleur-terracotta);
  font-weight: 600;
}
```

- [ ] **Step 7: Verify `formulaire.css` is imported in `styles.css`**

Open `src/css/styles.css`. If `@import url('formulaire.css');` is not already present, add it after `faq.css`.

- [ ] **Step 8: Write `src/_includes/composants/formulaire-devis.njk`**

```njk
<form class="formulaire-devis" data-formulaire-devis method="POST" action="/traiter-devis.php" novalidate>
  <p class="formulaire-devis__erreurs" data-formulaire-erreurs hidden></p>

  <fieldset class="formulaire-devis__profil">
    <legend>Vous êtes :</legend>
    <button type="button" class="formulaire-devis__profil-bouton" data-profil-bouton="agence" aria-pressed="false">Une agence</button>
    <button type="button" class="formulaire-devis__profil-bouton" data-profil-bouton="investisseur" aria-pressed="false">Un investisseur</button>
    <button type="button" class="formulaire-devis__profil-bouton" data-profil-bouton="particulier" aria-pressed="true">Un particulier</button>
  </fieldset>
  <input type="hidden" name="profil" data-profil-input value="particulier">

  <label for="devis-nom">Nom</label>
  <input type="text" id="devis-nom" name="nom" required>

  <label for="devis-email">Email</label>
  <input type="email" id="devis-email" name="email" required>

  <label for="devis-telephone">Téléphone (facultatif)</label>
  <input type="tel" id="devis-telephone" name="telephone">

  <label for="devis-message">Votre projet</label>
  <textarea id="devis-message" name="message" required></textarea>

  <div data-profil-bloc="agence" hidden>
    <label for="devis-volume">Nombre de biens à traiter par an (estimation)</label>
    <input type="text" id="devis-volume" name="volume_estime">
  </div>

  <div data-profil-bloc="investisseur" hidden>
    <label for="devis-delai">Délai souhaité de mise en location</label>
    <input type="text" id="devis-delai" name="delai_souhaite">
  </div>

  <div data-profil-bloc="particulier">
    <label for="devis-adresse">Adresse du bien</label>
    <input type="text" id="devis-adresse" name="adresse_bien">
  </div>

  <div style="display:none" aria-hidden="true">
    <label for="devis-site-web">Laisser ce champ vide</label>
    <input type="text" id="devis-site-web" name="site_web" tabindex="-1" autocomplete="off">
  </div>

  <button type="submit" class="bouton bouton--principal">Envoyer ma demande</button>
</form>
```

- [ ] **Step 9: Add query-string prefill to `initFormDevis()` in `src/js/form-devis.js`**

The spec requires that a server-side validation failure (Task 18) redirect back to `/devis/` with the previously-entered values retained, not blanked. Since `/devis/` is a static page, `traiter-devis.php` will pass those values back as URL query parameters (Task 18, Step 5), and this step makes the page read and apply them client-side on load.

Edit `src/js/form-devis.js`, replacing the body of `initFormDevis()` with:

```js
export function initFormDevis() {
  const formulaire = document.querySelector('[data-formulaire-devis]');
  if (!formulaire) return;

  const boutonsProfil = Array.from(formulaire.querySelectorAll('[data-profil-bouton]'));
  const blocsProfil = Array.from(formulaire.querySelectorAll('[data-profil-bloc]'));
  const champProfil = formulaire.querySelector('[data-profil-input]');
  const zoneErreurs = formulaire.querySelector('[data-formulaire-erreurs]');

  function selectionnerProfil(profil) {
    champProfil.value = profil;
    blocsProfil.forEach((bloc) => {
      bloc.hidden = bloc.dataset.profilBloc !== profil;
    });
    boutonsProfil.forEach((bouton) => {
      bouton.setAttribute('aria-pressed', String(bouton.dataset.profilBouton === profil));
    });
  }

  boutonsProfil.forEach((bouton) => {
    bouton.addEventListener('click', () => selectionnerProfil(bouton.dataset.profilBouton));
  });

  formulaire.addEventListener('submit', (evenement) => {
    const donnees = Object.fromEntries(new FormData(formulaire));
    const resultat = validerFormulaire(donnees);
    if (!resultat.valide) {
      evenement.preventDefault();
      zoneErreurs.hidden = false;
      zoneErreurs.textContent = Object.values(resultat.erreurs).join(' ');
    }
  });

  const parametres = new URLSearchParams(window.location.search);
  if (parametres.get('erreur') === '1') {
    const profil = parametres.get('profil');
    if (profil) selectionnerProfil(profil);
    ['nom', 'email', 'telephone', 'message'].forEach((champ) => {
      const valeur = parametres.get(champ);
      const element = formulaire.querySelector(`#devis-${champ}`);
      if (valeur && element) element.value = valeur;
    });
    zoneErreurs.hidden = false;
    zoneErreurs.textContent = 'Certains champs sont invalides ou manquants. Merci de vérifier votre saisie.';
  }
}
```

- [ ] **Step 10: Write `src/devis.njk`**

```njk
---
layout: layouts/base.njk
titre: "Demander un devis"
description: "Formulaire de demande de devis, différencié selon votre profil."
---
<section class="conteneur">
  <h1>Demander un devis</h1>
  <p>Décrivez votre projet, nous revenons vers vous sous 48h ouvrées.</p>
  {% include "composants/formulaire-devis.njk" %}
</section>
```

- [ ] **Step 11: Verify the page builds with the form and honeypot present**

Run: `npx eleventy && grep -o "action=\"/traiter-devis.php\"" _site/devis/index.html`
Expected: the string is printed.

Run: `grep -o "name=\"site_web\"" _site/devis/index.html`
Expected: the string is printed (honeypot field present).

- [ ] **Step 12: Commit**

```bash
git add src/_includes/composants/formulaire-devis.njk src/devis.njk src/css/formulaire.css src/css/styles.css src/js/form-devis.js src/js/main.js tests/form-devis.test.js
git commit -m "feat: add devis page with quote-request form"
```

---

### Task 18: PHP form handler (`traiter-devis.php`)

**Files:**
- Create: `devis-validation.php` (project root)
- Create: `traiter-devis.php` (project root)
- Create: `tests/test-devis-validation.php`

**Interfaces:**
- Consumes: POST fields from Task 17's form (`profil`, `nom`, `email`, `message`, `site_web`).
- Produces: `function estHoneypotRempli(array $post): bool`, `function nettoyerValeur(string $valeur): string`, `function validerDonnees(array $post): array` (returns `['valide' => bool, 'erreurs' => array]`) in `devis-validation.php`, consumed by `traiter-devis.php`.

- [ ] **Step 1: Write the failing test — `tests/test-devis-validation.php`**

```php
<?php
require __DIR__ . '/../devis-validation.php';

function verifier(bool $condition, string $message): void
{
    if (!$condition) {
        fwrite(STDERR, "ECHEC: $message\n");
        exit(1);
    }
    echo "OK: $message\n";
}

$donneesValides = [
    'profil' => 'particulier',
    'nom' => 'Jean Dupont',
    'email' => 'jean@example.com',
    'message' => 'Bonjour, je souhaite un devis.',
];
$resultat = validerDonnees($donneesValides);
verifier($resultat['valide'] === true, 'donnees valides acceptees');

$donneesIncompletes = ['profil' => '', 'nom' => '', 'email' => 'pas-un-email', 'message' => ''];
$resultat2 = validerDonnees($donneesIncompletes);
verifier($resultat2['valide'] === false, 'donnees incompletes rejetees');
verifier(count($resultat2['erreurs']) === 4, 'quatre erreurs relevees');

verifier(estHoneypotRempli(['site_web' => 'http://spam.example']) === true, 'honeypot rempli detecte');
verifier(estHoneypotRempli(['site_web' => '']) === false, 'honeypot vide non detecte');
verifier(estHoneypotRempli([]) === false, 'honeypot absent non detecte');

verifier(nettoyerValeur("Jean\r\nBcc: pirate@example.com") === "Jean Bcc: pirate@example.com", 'injection en-tete neutralisee');

echo "Tous les tests sont passes.\n";
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php tests/test-devis-validation.php`
Expected: FAIL — `Failed opening required '.../devis-validation.php'` (file does not exist yet).

- [ ] **Step 3: Write `devis-validation.php`**

```php
<?php

function estHoneypotRempli(array $post): bool
{
    return isset($post['site_web']) && trim((string) $post['site_web']) !== '';
}

function nettoyerValeur(string $valeur): string
{
    return trim(str_replace(["\r", "\n"], ' ', $valeur));
}

function validerDonnees(array $post): array
{
    $erreurs = [];

    $profil = trim((string) ($post['profil'] ?? ''));
    if (!in_array($profil, ['agence', 'investisseur', 'particulier'], true)) {
        $erreurs['profil'] = 'Sélectionnez un profil valide.';
    }

    $nom = trim((string) ($post['nom'] ?? ''));
    if ($nom === '') {
        $erreurs['nom'] = 'Le nom est requis.';
    }

    $email = trim((string) ($post['email'] ?? ''));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $erreurs['email'] = 'Adresse email invalide.';
    }

    $message = trim((string) ($post['message'] ?? ''));
    if ($message === '') {
        $erreurs['message'] = 'Le message est requis.';
    }

    return [
        'valide' => count($erreurs) === 0,
        'erreurs' => $erreurs,
    ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php tests/test-devis-validation.php`
Expected: PASS — prints `OK: ...` for every assertion, ends with `Tous les tests sont passes.` and exit code `0`.

- [ ] **Step 5: Write `traiter-devis.php`**

```php
<?php
require __DIR__ . '/devis-validation.php';

// Placeholder — remplacer par la vraie adresse de contact Soly'bat une fois connue.
$adresseContact = 'contact@solybat.fr';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /devis/');
    exit;
}

if (estHoneypotRempli($_POST)) {
    // Requête probablement émise par un bot : réponse de succès sans envoi d'email.
    header('Location: /devis-merci/');
    exit;
}

$resultat = validerDonnees($_POST);
if (!$resultat['valide']) {
    // La page /devis/ est statique : les valeurs saisies sont repassées en
    // paramètres d'URL pour que form-devis.js (Task 17, Step 9) les réaffiche
    // côté client, au lieu d'une redirection sèche qui les perdrait.
    $parametres = http_build_query([
        'erreur' => '1',
        'profil' => $_POST['profil'] ?? '',
        'nom' => $_POST['nom'] ?? '',
        'email' => $_POST['email'] ?? '',
        'telephone' => $_POST['telephone'] ?? '',
        'message' => $_POST['message'] ?? '',
    ]);
    header('Location: /devis/?' . $parametres);
    exit;
}

$profil = nettoyerValeur($_POST['profil']);
$nom = nettoyerValeur($_POST['nom']);
$email = nettoyerValeur($_POST['email']);
$telephone = nettoyerValeur($_POST['telephone'] ?? '');
$message = nettoyerValeur($_POST['message']);

$sujet = 'Nouvelle demande de devis — ' . $profil;
$corps = "Profil : $profil\nNom : $nom\nEmail : $email\nTéléphone : $telephone\n\nMessage :\n$message\n";
$entetes = 'From: no-reply@solybat.fr' . "\r\n" . 'Reply-To: ' . $email;

mail($adresseContact, $sujet, $corps, $entetes);

header('Location: /devis-merci/');
exit;
```

- [ ] **Step 6: Verify `traiter-devis.php` has no syntax errors**

Run: `php -l traiter-devis.php && php -l devis-validation.php`
Expected: `No syntax errors detected` for both files.

- [ ] **Step 7: Commit**

```bash
git add devis-validation.php traiter-devis.php tests/test-devis-validation.php
git commit -m "feat: add PHP form handler with server-side validation and honeypot"
```

---

### Task 19: `/devis-merci` confirmation page

**Files:**
- Create: `src/devis-merci.njk`

- [ ] **Step 1: Write `src/devis-merci.njk`**

```njk
---
layout: layouts/base.njk
titre: "Demande envoyée"
description: "Votre demande de devis a bien été envoyée."
---
<section class="conteneur" style="text-align: center;">
  <h1>Votre demande a bien été envoyée</h1>
  <p>Merci, nous revenons vers vous sous 48h ouvrées.</p>
  <a href="/" class="bouton bouton--principal">Retour à l'accueil</a>
</section>
```

- [ ] **Step 2: Verify the page builds and the PHP redirect target resolves**

Run: `npx eleventy && grep -o "Votre demande a bien été envoyée" _site/devis-merci/index.html`
Expected: the string is printed. Confirms `/devis-merci/` (the redirect target used in `traiter-devis.php`, Task 18 Step 5) is a real page.

- [ ] **Step 3: Commit**

```bash
git add src/devis-merci.njk
git commit -m "feat: add devis-merci confirmation page"
```

---

### Task 20: `/mentions-legales` page

**Files:**
- Create: `src/mentions-legales.njk`

- [ ] **Step 1: Write `src/mentions-legales.njk`**

```njk
---
layout: layouts/base.njk
titre: "Mentions légales"
description: "Mentions légales, SIRET, assurances et politique de confidentialité de Soly'bat."
---
<section class="conteneur">
  <h1>Mentions légales</h1>

  <h2>Éditeur du site</h2>
  <p>Soly'bat<br>
  SIRET : [SIRET à compléter]<br>
  Adresse : [adresse du siège à compléter]<br>
  Contact : [adresse email à compléter]</p>

  <h2>Assurances</h2>
  <p>Assurance décennale : [numéro de contrat à compléter]<br>
  Responsabilité civile professionnelle : [numéro de contrat à compléter]</p>

  <h2>Hébergement</h2>
  <p>[nom et adresse de l'hébergeur à compléter]</p>

  <h2>Conditions générales de vente</h2>
  <p>[CGV à compléter]</p>

  <h2>Politique de confidentialité</h2>
  <p>[politique de confidentialité à compléter]</p>
</section>
```

- [ ] **Step 2: Verify the page builds**

Run: `npx eleventy && grep -o "SIRET à compléter" _site/mentions-legales/index.html`
Expected: the string is printed (documents the intentional placeholder for real legal info, per the design spec's "hors périmètre" list).

- [ ] **Step 3: Commit**

```bash
git add src/mentions-legales.njk
git commit -m "feat: add mentions-legales page"
```

---

### Task 21: Final QA pass

**Files:** none created — verification only, following the spec's "Stratégie de test / QA" section.

- [ ] **Step 1: Full build and full automated test suite**

Run: `npm test && npx eleventy`
Expected: all Node tests pass (`nav`, `onglets`, `filtre-galerie`, `slider-avant-apres`, `form-devis`), 11ty build completes with no errors, and `_site/` contains all 11 pages (`index.html`, `renovation-location/`, `realisations/` + 4 project subfolders, `process/`, `espace-pro/`, `a-propos/`, `faq/`, `devis/`, `devis-merci/`, `mentions-legales/`, `404.html`).

- [ ] **Step 2: PHP test and syntax check**

Run: `php tests/test-devis-validation.php && php -l traiter-devis.php`
Expected: all PHP assertions pass, no syntax errors.

- [ ] **Step 3: Serve locally and run the manual checklist from the spec**

Run: `npx eleventy --serve` (defaults to `http://localhost:8080`)

Walk through, on both a desktop-width and a mobile-width (DevTools responsive mode) viewport:
- Every page listed in Step 1 loads without a broken layout.
- Keyboard navigation reaches: mobile menu toggle, `/renovation-location` tab buttons, `/faq` `<details>` elements, all `/devis` form fields and profile buttons.
- Text/background contrast is legible (no pure black/white was used, per Global Constraints — spot-check `--couleur-anthracite` text on `--couleur-creme-sable` background).
- `/realisations`: toggle both filter dropdowns through every combination, confirm the grid updates and the "aucune réalisation" message appears for a combination with zero matches (e.g. type `immeuble` + ampleur `remise-en-etat`, which has no entry in `realisations.json`).
- `/realisations/[slug]`: confirm the placeholder block renders (all sample photos are `null`).
- `/devis`: submit with an empty `nom` field, confirm the client-side error message appears and the page does not navigate away.
- `/devis`: with browser DevTools JS disabled, confirm the form still submits (native POST to `/traiter-devis.php` — full PHP execution requires a PHP-enabled server, e.g. `php -S localhost:8000` from the `_site/` output, not `eleventy --serve`).
- `/devis`: serving from `php -S localhost:8000 -t _site`, submit with client-side JS disabled and an invalid email, confirm `traiter-devis.php` redirects to `/devis/?erreur=1&...` and that re-enabling JS / reloading shows the previously-entered values prefilled with the error banner visible (Task 17 Step 9 / Task 18 Step 5).
- Visit a nonexistent path (e.g. `/xyz/`) and confirm `_site/404.html`'s content (this isn't auto-served by `eleventy --serve`; verify by opening the file directly or configuring the dev server's 404 page).

- [ ] **Step 4: HTML validation**

For each generated page in `_site/`, run through the W3C validator (either the online validator at validator.w3.org pasting each file's content, or a local nu-html-checker if available). Note and fix any errors (not warnings) found.

- [ ] **Step 5: Record results and commit any fixes**

If Steps 3-4 surface issues, fix them in the relevant task's files and commit each fix separately with a `fix:` prefixed message describing the specific issue found.

If no issues are found, no commit is needed for this task — it's a verification pass.

---

## Post-plan reminders (from the spec's "Hors périmètre")

Not covered by this plan, tracked here so they aren't lost:
- Final copy review/rewrite of all provisional text.
- Real before/after photos to replace `photos.avant`/`photos.apres: null` in `realisations.json` (once added, `carte-realisation.njk` and `projet.njk` automatically switch from placeholder to `<img>`/slider — no template changes needed).
- Real `/espace-pro` PDF brochure (once ready, replace the `<span class="plaquette-a-venir">` in `src/espace-pro.njk` with a real `<a href="...">` download link).
- Real legal information for `src/mentions-legales.njk` (SIRET, insurance numbers, host name/address, CGV, privacy policy).
- Real contact email address in `traiter-devis.php` (`$adresseContact`), replacing the `contact@solybat.fr` placeholder.
- Dedicated favicon (currently `logo-solybat.png` is reused as-is in `base.njk`).
