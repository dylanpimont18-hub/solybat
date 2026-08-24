import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

/* La plaquette PDF est un livrable hors build : son HTML source porte les chiffres
   des operations en dur, et le PDF doit etre regenere a la main (commande dans
   identite-visuelle/README.md). Ces tests sont le garde-fou : si retoursClients.json
   change, ils echouent et rappellent que la plaquette est perimee. */

const require = createRequire(import.meta.url);
const { calculerSynthese } = require('../lib/synthese-rentabilite.cjs');
const retoursClients = require('../src/_data/retoursClients.json');

/* Les deux cotes utilisent des espaces insecables, mais pas les memes : le
   formateur de lib/ pose une fine insecable (U+202F) dans "410 200 €", le HTML
   pose des insecables pour retenir ses unites en fin de ligne — tantot le
   caractere U+00A0, tantot l'entite &nbsp;. On ramene tout a l'espace ordinaire,
   des deux cotes, sinon le garde-fou echoue sur de la typographie et non sur un
   chiffre perime. */
const normaliser = (texte) => texte.replace(/&nbsp;/g, ' ').replace(/[   ]/g, ' ');

const source = readFileSync(
  new URL('../identite-visuelle/plaquette-solybat.html', import.meta.url),
  'utf8'
);

const plaquette = normaliser(source);

/* Les commentaires du fichier parlent de la regle editoriale, donc citent les
   tournures interdites — et ils sont de deux sortes : commentaires HTML et
   commentaires CSS dans le <style>. Ni les uns ni les autres ne s'impriment.
   On retire donc la feuille de style entiere puis les commentaires HTML, sinon
   le test se declenche sur la documentation de la regle et non sur sa violation. */
const visible = normaliser(
  source.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '')
);

const synthese = calculerSynthese(retoursClients);

const rappel =
  'Mettre a jour identite-visuelle/plaquette-solybat.html puis regenerer le PDF (voir identite-visuelle/README.md).';

const contient = (valeur, contexte) =>
  assert.ok(plaquette.includes(normaliser(valeur)), `"${valeur}" absent ${contexte}. ${rappel}`);

test('chaque operation de retoursClients.json figure sur la plaquette', () => {
  for (const operation of retoursClients) {
    for (const valeur of [
      operation.typeDeBien,
      operation.coutTotal,
      operation.loyer,
      operation.cashFlow,
      operation.rentabiliteBrute,
    ]) {
      contient(valeur, `du volet des operations (${operation.typeDeBien})`);
    }
  }
});

test('les chiffres agreges de la plaquette sont a jour', () => {
  contient(synthese.libelles.rentabiliteMoyenne, 'des chiffres agreges');
  contient(synthese.libelles.travauxCumules, 'des chiffres agreges');
  contient(synthese.libelles.fourchetteRentabilite, 'des chiffres agreges');
});

test('le "100 %" annonce est vrai pour toutes les operations', () => {
  assert.equal(
    synthese.cashFlowPositif,
    retoursClients.length,
    `La plaquette annonce 100 % de cash-flow positif. ${rappel}`
  );
  assert.equal(
    synthese.dscrSuperieurA1,
    retoursClients.length,
    `La plaquette annonce un DSCR superieur a 1 sur toutes les operations. ${rappel}`
  );
});

/* Regle editoriale demandee par le client : ne jamais annoncer COMBIEN il y a
   d'operations — ni titre, ni ratio "8/8", ni renvoi "les huit operations". */
test('la plaquette n annonce jamais le nombre d operations', () => {
  const n = retoursClients.length;
  const enLettres = ['une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'][n - 1];

  assert.doesNotMatch(visible, new RegExp(`${n}\\s*op[ée]rations`, 'i'));
  assert.doesNotMatch(visible, new RegExp(`${n}\\s*/\\s*${n}`));
  if (enLettres) assert.doesNotMatch(visible, new RegExp(`${enLettres}\\s*op[ée]rations`, 'i'));
});

test('la plaquette n annonce plus de duree de chantier chiffree', () => {
  assert.doesNotMatch(visible, /\d+\s*(a|à|—|-)\s*\d+\s*sem/i);
});
