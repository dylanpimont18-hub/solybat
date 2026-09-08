import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';

/* Le sitemap est produit au build, donc ces tests lisent _site/sitemap.xml et
   ne valent que si `npm run build` a tourne. Le bug qu'ils verrouillent :
   `collections.all` ne contient que la PREMIERE page d'un template pagine, si
   bien qu'un sitemap naif ne listait qu'une des 6 fiches projet. Les 5 autres
   existaient dans _site/ mais restaient invisibles pour Google. */

const require = createRequire(import.meta.url);
const realisations = require('../src/_data/realisations.json');
const site = require('../src/_data/site.json');

const CHEMIN = new URL('../_site/sitemap.xml', import.meta.url);
const sitemap = existsSync(CHEMIN) ? readFileSync(CHEMIN, 'utf8') : null;

/* Sans build prealable il n'y a rien a verifier : on echoue explicitement
   plutot que de laisser passer des tests vides qui rassureraient a tort. */
test('le sitemap a bien ete genere par le build', () => {
  assert.ok(sitemap, 'lancer `npm run build` avant les tests');
});

test('la declaration XML ouvre le fichier, sans rien avant', () => {
  assert.ok(
    sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'),
    'un espace ou une ligne vide en tete fait rejeter le fichier par les parseurs stricts',
  );
});

test('les 6 fiches projet paginees sont listees', () => {
  for (const projet of realisations) {
    const url = `${site.url}/realisations/${projet.slug}/`;
    assert.ok(
      sitemap.includes(`<loc>${url}</loc>`),
      `fiche absente du sitemap : ${url}`,
    );
  }
});

test('les pages principales sont listees', () => {
  const attendues = [
    '/',
    '/renovation-location/',
    '/realisations/',
    '/process/',
    '/espace-pro/',
    '/a-propos/',
    '/faq/',
    '/devis/',
    '/retour-client/',
    '/mentions-legales/',
  ];
  for (const chemin of attendues) {
    assert.ok(
      sitemap.includes(`<loc>${site.url}${chemin}</loc>`),
      `page absente du sitemap : ${chemin}`,
    );
  }
});

/* Ces deux pages portent noindex : les soumettre a Google contredirait la
   balise et ferait remonter des avertissements dans la Search Console. */
test('les pages noindex sont exclues', () => {
  for (const chemin of ['/devis-merci/', '/404.html']) {
    assert.ok(
      !sitemap.includes(`<loc>${site.url}${chemin}</loc>`),
      `page noindex presente a tort : ${chemin}`,
    );
  }
});

test('aucune URL n est dupliquee', () => {
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  assert.equal(new Set(urls).size, urls.length, 'doublon dans le sitemap');
  assert.ok(urls.length >= 18, `seulement ${urls.length} URLs`);
});

test('le sitemap est declare dans robots.txt', () => {
  const robots = readFileSync(new URL('../_site/robots.txt', import.meta.url), 'utf8');
  assert.ok(robots.includes(`Sitemap: ${site.url}/sitemap.xml`));
});
