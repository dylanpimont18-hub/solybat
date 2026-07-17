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
