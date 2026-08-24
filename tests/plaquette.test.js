import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

/* La plaquette PDF est un livrable hors build : son HTML source porte les chiffres
   des operations en dur, et le PDF doit etre regenere a la main (commande dans
   identite-visuelle/README.md). Ces tests sont le garde-fou : si retoursClients.json
   change, ils echouent et rappellent que la plaquette est perimee. */

const require = createRequire(import.meta.url);
const { calculerSynthese, meilleuresOperations } = require('../lib/synthese-rentabilite.cjs');
const retoursClients = require('../src/_data/retoursClients.json');

/* Les deux cotes utilisent des espaces insecables, mais pas les memes : le
   formateur de lib/ pose une fine insecable (U+202F) dans "410 200 €", le HTML
   pose des insecables pour retenir ses unites en fin de ligne — tantot le
   caractere U+00A0, tantot l'entite &nbsp;. On ramene tout a l'espace ordinaire,
   des deux cotes, sinon le garde-fou echoue sur de la typographie et non sur un
   chiffre perime. */
const normaliser = (texte) => texte.replace(/&nbsp;/g, ' ').replace(/[   ]/g, ' ');

const plaquette = normaliser(
  readFileSync(new URL('../identite-visuelle/plaquette-solybat.html', import.meta.url), 'utf8')
);

const synthese = calculerSynthese(retoursClients);
const meilleures = meilleuresOperations(retoursClients, 3);

const rappel =
  'Mettre a jour identite-visuelle/plaquette-solybat.html puis regenerer le PDF (voir identite-visuelle/README.md).';

const contient = (valeur, contexte) =>
  assert.ok(plaquette.includes(normaliser(valeur)), `"${valeur}" absent ${contexte}. ${rappel}`);

test('la plaquette annonce le bon nombre d operations', () => {
  contient(`${synthese.nombreOperations} opérations`, 'du titre de la page 3');
});

test('les chiffres agreges de la plaquette sont a jour', () => {
  contient(synthese.libelles.cashFlowPositif, 'du bandeau de chiffres');
  contient(synthese.libelles.rentabiliteMoyenne, 'du bandeau de chiffres');
  contient(synthese.libelles.travauxCumules, 'du bandeau de chiffres');
  contient(synthese.libelles.fourchetteRentabilite, 'du bandeau de chiffres');
});

test('le DSCR mis en avant reste vrai pour toutes les operations', () => {
  assert.equal(
    synthese.dscrSuperieurA1,
    synthese.nombreOperations,
    `La plaquette affirme un DSCR superieur a 1 sur toutes les operations. ${rappel}`
  );
});

test('le tableau des trois meilleures operations correspond aux donnees', () => {
  for (const operation of meilleures) {
    for (const valeur of [
      operation.typeDeBien,
      operation.coutTotal,
      operation.loyer,
      operation.cashFlow,
      operation.rentabiliteBrute,
    ]) {
      contient(valeur, 'du tableau des operations');
    }
  }
});

test('la plaquette n annonce plus de duree de chantier chiffree', () => {
  assert.doesNotMatch(plaquette, /\d+\s*(a|à|—|-)\s*\d+\s*sem/i);
});
