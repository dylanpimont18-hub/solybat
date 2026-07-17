import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculerProchainEtat } from '../src/js/nav.js';

test('un menu ferme doit s\'ouvrir', () => {
  assert.equal(calculerProchainEtat(false), true);
});

test('un menu ouvert doit se fermer', () => {
  assert.equal(calculerProchainEtat(true), false);
});
