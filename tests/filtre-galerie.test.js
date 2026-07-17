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
