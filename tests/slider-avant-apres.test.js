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
