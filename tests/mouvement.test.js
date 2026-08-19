import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculerDecalage, calculerRangsParGroupe } from '../src/js/reveals.js';
import { calculerInclinaison } from '../src/js/tilt-cartes.js';
import { calculerEtatHeader } from '../src/js/header-condense.js';
import {
  calculerValeurAffichee,
  analyserValeur,
  formaterValeur,
} from '../src/js/compteurs.js';

/* ---------------- reveals ---------------- */

test('le premier element d un groupe n est pas retarde', () => {
  assert.equal(calculerDecalage(0), 0);
});

test('le decalage croit avec le rang puis plafonne', () => {
  assert.equal(calculerDecalage(1, 70, 350), 70);
  assert.equal(calculerDecalage(3, 70, 350), 210);
  assert.equal(calculerDecalage(5, 70, 350), 350);
  assert.equal(calculerDecalage(40, 70, 350), 350, 'une longue grille ne doit pas attendre des secondes');
});

test('un rang aberrant ne produit pas de retard negatif', () => {
  assert.equal(calculerDecalage(-2), 0);
  assert.equal(calculerDecalage(NaN), 0);
});

test('les rangs repartent de zero pour chaque parent', () => {
  const parentA = { nom: 'a' };
  const parentB = { nom: 'b' };
  const elements = [
    { parentElement: parentA },
    { parentElement: parentA },
    { parentElement: parentB },
    { parentElement: parentA },
    { parentElement: parentB },
  ];
  assert.deepEqual(calculerRangsParGroupe(elements), [0, 1, 0, 2, 1]);
});

/* ---------------- tilt ---------------- */

const cadre = { left: 100, top: 200, width: 400, height: 300 };

test('au centre de la carte, aucune inclinaison', () => {
  const r = calculerInclinaison(300, 350, cadre);
  assert.ok(Math.abs(r.rotationX) < 1e-9);
  assert.ok(Math.abs(r.rotationY) < 1e-9);
  assert.equal(r.pourcentageX, 50);
  assert.equal(r.pourcentageY, 50);
});

test('le pointeur en haut fait basculer la carte vers l arriere', () => {
  const haut = calculerInclinaison(300, 200, cadre);
  assert.ok(haut.rotationX > 0, 'le haut doit produire une rotation X positive');
  const bas = calculerInclinaison(300, 500, cadre);
  assert.ok(bas.rotationX < 0);
});

test('le pointeur a droite fait tourner la carte vers la droite', () => {
  assert.ok(calculerInclinaison(500, 350, cadre).rotationY > 0);
  assert.ok(calculerInclinaison(100, 350, cadre).rotationY < 0);
});

test('l inclinaison est bornee par l amplitude, meme hors du cadre', () => {
  const amplitude = 5.5;
  for (const [x, y] of [[-9000, -9000], [9000, 9000], [-500, 800]]) {
    const r = calculerInclinaison(x, y, cadre, amplitude);
    assert.ok(Math.abs(r.rotationX) <= amplitude + 1e-9);
    assert.ok(Math.abs(r.rotationY) <= amplitude + 1e-9);
    assert.ok(r.pourcentageX >= 0 && r.pourcentageX <= 100);
    assert.ok(r.pourcentageY >= 0 && r.pourcentageY <= 100);
  }
});

test('un cadre vide ne provoque pas de division par zero', () => {
  const r = calculerInclinaison(10, 10, { left: 0, top: 0, width: 0, height: 0 });
  assert.deepEqual(r, { rotationX: 0, rotationY: 0, pourcentageX: 50, pourcentageY: 50 });
  assert.deepEqual(calculerInclinaison(10, 10, null).rotationX, 0);
});

/* ---------------- header ---------------- */

test('le header est deploye en haut de page', () => {
  assert.equal(calculerEtatHeader(0, false), false);
});

test('le header se condense au dela du seuil', () => {
  assert.equal(calculerEtatHeader(65, false, 64, 24), true);
  assert.equal(calculerEtatHeader(63, false, 64, 24), false);
});

test('l hysteresis empeche le clignotement autour du seuil', () => {
  // Une fois condense, il faut redescendre nettement pour se redeployer.
  assert.equal(calculerEtatHeader(50, true, 64, 24), true, 'ne doit pas se redeployer trop tot');
  assert.equal(calculerEtatHeader(39, true, 64, 24), false);
});

test('une oscillation autour du seuil ne change pas d etat', () => {
  let etat = calculerEtatHeader(70, false, 64, 24);
  assert.equal(etat, true);
  for (const position of [62, 66, 61, 65, 63]) {
    etat = calculerEtatHeader(position, etat, 64, 24);
    assert.equal(etat, true, `oscillation a ${position} : l etat ne doit pas changer`);
  }
});

test('un defilement aberrant conserve l etat precedent', () => {
  assert.equal(calculerEtatHeader(NaN, true), true);
  assert.equal(calculerEtatHeader(undefined, false), false);
});

/* ---------------- compteurs ---------------- */

test('le compteur part de la valeur de depart et atteint la cible', () => {
  assert.equal(calculerValeurAffichee(0, 100, 0), 0);
  assert.equal(calculerValeurAffichee(0, 100, 1), 100);
});

test('le compteur progresse de facon monotone', () => {
  let precedent = -1;
  for (let t = 0; t <= 1; t += 0.05) {
    const v = calculerValeurAffichee(0, 100, t);
    assert.ok(v >= precedent);
    precedent = v;
  }
});

test('analyserValeur releve un entier simple', () => {
  const format = analyserValeur('54');
  assert.equal(format.valeur, 54);
  assert.equal(format.decimales, 0);
  assert.equal(format.prefixe, '');
  assert.equal(format.suffixe, '');
});

test('analyserValeur releve les decimales a la francaise et le suffixe', () => {
  const format = analyserValeur('8,4 %');
  assert.equal(format.valeur, 8.4);
  assert.equal(format.decimales, 1);
  assert.equal(format.separateur, ',');
  assert.equal(format.suffixe, ' %');
});

test('analyserValeur gere les milliers espaces et une unite', () => {
  const format = analyserValeur('42 500 €');
  assert.equal(format.valeur, 42500);
  assert.equal(format.espaceMillier, true);
  assert.equal(format.suffixe, ' €');
});

test('analyserValeur retourne null quand il n y a pas de nombre', () => {
  assert.equal(analyserValeur('sans chiffre'), null);
  assert.equal(analyserValeur(''), null);
});

test('formaterValeur restitue le libelle d origine a l arrivee', () => {
  for (const texte of ['54', '8,4 %', '42 500 €', '12 semaines', '-3,5 °C']) {
    const format = analyserValeur(texte);
    assert.equal(formaterValeur(format.valeur, format), texte, `aller-retour casse pour "${texte}"`);
  }
});

test('formaterValeur respecte le nombre de decimales pendant l animation', () => {
  const format = analyserValeur('8,4 %');
  const intermediaire = formaterValeur(calculerValeurAffichee(0, 8.4, 0.5), format);
  assert.match(intermediaire, /^\d,\d %$/);
});
