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
