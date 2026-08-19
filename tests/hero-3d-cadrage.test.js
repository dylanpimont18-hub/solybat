import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculerRayonCamera, calculerDecalageCamera } from '../src/js/hero-3d/scene-hero.js';

test('le cadrage paysage ne recule pas la camera', () => {
  const reference = calculerRayonCamera(1.78);
  assert.equal(calculerRayonCamera(1), reference);
  assert.equal(calculerRayonCamera(2.4), reference);
});

test('plus le format est etroit, plus la camera recule', () => {
  const large = calculerRayonCamera(1.78);
  const carre = calculerRayonCamera(1);
  const portrait = calculerRayonCamera(0.6);
  const tresEtroit = calculerRayonCamera(0.45);
  assert.ok(portrait > carre, 'le portrait doit reculer la camera');
  assert.ok(tresEtroit > portrait, 'un format plus etroit doit reculer davantage');
  assert.equal(carre, large);
});

test('le recul de la camera reste borne', () => {
  const reference = calculerRayonCamera(1.78);
  for (const rapport of [0.4, 0.2, 0.05, 0.001]) {
    assert.ok(calculerRayonCamera(rapport) <= reference * 2.4 + 1e-9);
  }
});

test('un rapport aberrant retombe sur la valeur de reference', () => {
  const reference = calculerRayonCamera(1.78);
  for (const rapport of [0, -3, NaN, Infinity, undefined]) {
    assert.equal(calculerRayonCamera(rapport), reference);
  }
});

test('en paysage la maquette part sur la droite, jamais vers le bas', () => {
  for (const rapport of [1.2, 1.6, 2.2]) {
    const [x, y] = calculerDecalageCamera(rapport);
    assert.ok(x > 0, `rapport ${rapport} : la maquette doit se decaler a droite`);
    assert.ok(y >= 0, `rapport ${rapport} : elle ne doit pas descendre`);
  }
});

test('en portrait la maquette remonte et reste centree horizontalement', () => {
  for (const rapport of [0.5, 0.6, 0.9]) {
    const [x, y] = calculerDecalageCamera(rapport);
    assert.equal(x, 0, `rapport ${rapport} : pas de decalage lateral en portrait`);
    assert.ok(y > 0.5, `rapport ${rapport} : la maquette doit degager le texte`);
  }
});

test('plus le format est etroit, plus la maquette remonte', () => {
  const [, hautMoyen] = calculerDecalageCamera(0.9);
  const [, hautEtroit] = calculerDecalageCamera(0.5);
  assert.ok(hautEtroit >= hautMoyen);
});

test('un rapport aberrant ne decale rien', () => {
  for (const rapport of [0, -1, NaN, undefined]) {
    assert.deepEqual(calculerDecalageCamera(rapport), [0, 0]);
  }
});
