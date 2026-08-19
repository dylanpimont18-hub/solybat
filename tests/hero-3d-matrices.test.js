import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  matriceIdentite,
  multiplierMatrices,
  matricePerspective,
  matriceRotationX,
  matriceRotationY,
  matriceTranslation,
  matriceVueOrbite,
} from '../src/js/hero-3d/matrices.js';

/** Applique une matrice colonne-majeure à un point (w = 1). */
function appliquer(m, point) {
  const [x, y, z] = point;
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
  ];
}

function presqueEgal(a, b, tolerance = 1e-5) {
  assert.ok(
    a.every((valeur, i) => Math.abs(valeur - b[i]) < tolerance),
    `attendu ${b.join(', ')} — obtenu ${a.join(', ')}`,
  );
}

test('multiplier par l identite ne change rien', () => {
  const m = matricePerspective(Math.PI / 4, 1.5, 0.1, 100);
  const produit = multiplierMatrices(m, matriceIdentite());
  presqueEgal(Array.from(produit), Array.from(m));
});

test('rotation Y de 90 degres envoie X sur -Z', () => {
  const m = matriceRotationY(Math.PI / 2);
  presqueEgal(appliquer(m, [1, 0, 0]), [0, 0, -1]);
});

test('rotation X de 90 degres envoie Y sur Z', () => {
  const m = matriceRotationX(Math.PI / 2);
  presqueEgal(appliquer(m, [0, 1, 0]), [0, 0, 1]);
});

test('la translation deplace bien le point', () => {
  presqueEgal(appliquer(matriceTranslation(2, -3, 4), [1, 1, 1]), [3, -2, 5]);
});

test('la composition applique la matrice de droite en premier', () => {
  // Tourner puis translater n est pas equivalent a translater puis tourner.
  const rotation = matriceRotationY(Math.PI / 2);
  const translation = matriceTranslation(1, 0, 0);
  const tournerPuisTranslater = multiplierMatrices(translation, rotation);
  presqueEgal(appliquer(tournerPuisTranslater, [1, 0, 0]), [1, 0, -1]);
});

test('la vue orbite ramene la cible sur l axe de la camera', () => {
  const rayon = 5;
  const hauteurCible = 0.7;
  const vue = matriceVueOrbite(rayon, 0.9, 0.3, hauteurCible);
  const cible = appliquer(vue, [0, hauteurCible, 0]);
  presqueEgal(cible, [0, 0, -rayon]);
});

test('la vue orbite maintient la cible a distance constante quel que soit l azimut', () => {
  const rayon = 5.4;
  for (const azimut of [0, 1, 2.5, 4, 6]) {
    const vue = matriceVueOrbite(rayon, azimut, 0.36, 0.71);
    const cible = appliquer(vue, [0, 0.71, 0]);
    assert.ok(Math.abs(Math.hypot(...cible) - rayon) < 1e-5);
  }
});

test('la perspective place le plan proche sur -1 en profondeur normalisee', () => {
  const proche = 0.1;
  const m = matricePerspective(Math.PI / 4, 1, proche, 100);
  // Un point sur le plan proche : z = -proche dans le repere camera.
  const z = m[10] * -proche + m[14];
  const w = m[11] * -proche;
  assert.ok(Math.abs(z / w - -1) < 1e-5);
});
