import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculerPhase,
  calculerEmergence,
  calculerEtatScene,
  etatImmobile,
  adoucir,
  adoucirSortie,
  borner01,
  DUREE_BOUCLE,
  SEQUENCE,
} from '../src/js/hero-3d/phases.js';

test('borner01 ramene bien dans l intervalle', () => {
  assert.equal(borner01(-3), 0);
  assert.equal(borner01(0.5), 0.5);
  assert.equal(borner01(42), 1);
});

test('les fonctions d adoucissement respectent leurs bornes', () => {
  for (const fn of [adoucir, adoucirSortie]) {
    assert.equal(fn(0), 0);
    assert.equal(fn(1), 1);
    for (let t = 0; t <= 1; t += 0.05) {
      const v = fn(t);
      assert.ok(v >= 0 && v <= 1, `sortie hors bornes : ${v}`);
    }
  }
});

test('l adoucissement est monotone croissant', () => {
  for (const fn of [adoucir, adoucirSortie]) {
    let precedent = -1;
    for (let t = 0; t <= 1; t += 0.02) {
      const v = fn(t);
      assert.ok(v >= precedent - 1e-9, 'la courbe redescend');
      precedent = v;
    }
  }
});

test('la sequence couvre chaque instant de la boucle', () => {
  for (let t = 0; t < DUREE_BOUCLE; t += 0.05) {
    const phase = calculerPhase(t);
    assert.ok(SEQUENCE.some((etape) => etape.nom === phase.nom));
    assert.ok(phase.progression >= 0 && phase.progression <= 1);
  }
});

test('la boucle se referme : t et t + duree donnent le meme etat', () => {
  const a = calculerEtatScene(3.4, 7);
  const b = calculerEtatScene(3.4 + DUREE_BOUCLE, 7);
  assert.equal(a.phase, b.phase);
  assert.ok(Math.abs(a.progression - b.progression) < 1e-9);
});

test('un temps negatif reste dans la boucle', () => {
  const phase = calculerPhase(-1);
  assert.ok(phase.tempsBoucle >= 0 && phase.tempsBoucle < DUREE_BOUCLE);
});

test('la scene est invisible au tout debut et a la toute fin', () => {
  assert.ok(calculerEtatScene(0, 7).opaciteScene < 0.02, 'devrait demarrer transparent');
  assert.ok(calculerEtatScene(DUREE_BOUCLE - 0.001, 7).opaciteScene < 0.02, 'devrait finir transparent');
});

test('les etapes se construisent dans l ordre', () => {
  const milieuConstruction = 2.8 + (8.8 - 2.8) * 0.45;
  const etat = calculerEtatScene(milieuConstruction, 7);
  for (let i = 1; i < etat.emergences.length; i += 1) {
    assert.ok(
      etat.emergences[i] <= etat.emergences[i - 1] + 1e-9,
      `l etape ${i} emerge avant l etape ${i - 1}`,
    );
  }
});

test('rien n est construit avant la phase de construction', () => {
  for (const t of [0.5, 1.5, 2.0, 2.7]) {
    const etat = calculerEtatScene(t, 7);
    assert.ok(etat.emergences.every((e) => e === 0), `t=${t} : construction prematuree`);
  }
});

test('tout est construit une fois la phase de construction terminee', () => {
  for (const t of [8.9, 9.5, 10.5, 11.0]) {
    const etat = calculerEtatScene(t, 7);
    assert.ok(etat.emergences.every((e) => e === 1), `t=${t} : construction incomplete`);
  }
});

test('la derniere etape atteint bien 1 avant la fin de la construction', () => {
  const etat = calculerEtatScene(8.79, 7);
  assert.ok(etat.emergences[6] > 0.99, `derniere etape a ${etat.emergences[6]}`);
});

test('les fenetres ne s allument qu une fois la maison terminee', () => {
  assert.equal(calculerEtatScene(5, 7).lumiereFenetres, 0);
  assert.ok(calculerEtatScene(10.2, 7).lumiereFenetres > 0.9);
});

test('les particules ont disparu quand la construction commence', () => {
  assert.ok(calculerEtatScene(2.79, 7).opaciteParticules < 0.05);
  assert.equal(calculerEtatScene(5, 7).opaciteParticules, 0);
});

test('la convergence est terminee avant le fil de fer', () => {
  assert.ok(calculerEtatScene(1.79, 7).convergence > 0.99);
  assert.equal(calculerEtatScene(4, 7).convergence, 1);
});

test('toutes les opacites restent dans les bornes sur toute la boucle', () => {
  const champs = ['convergence', 'opaciteParticules', 'opaciteAretes', 'opaciteGrille', 'opaciteScene', 'lumiereFenetres'];
  for (let t = 0; t < DUREE_BOUCLE; t += 0.05) {
    const etat = calculerEtatScene(t, 7);
    for (const champ of champs) {
      assert.ok(etat[champ] >= 0 && etat[champ] <= 1, `${champ} = ${etat[champ]} a t=${t}`);
    }
    for (const emergence of etat.emergences) {
      assert.ok(emergence >= 0 && emergence <= 1);
    }
  }
});

test('calculerEmergence sature a 1 et ne descend pas sous 0', () => {
  assert.equal(calculerEmergence(0, 3, 7), 0);
  assert.equal(calculerEmergence(1, 0, 7), 1);
  assert.equal(calculerEmergence(0.5, 0, 0), 1, 'aucune etape : tout est deja construit');
});

test('l etat immobile presente une maison terminee et eclairee', () => {
  const etat = etatImmobile(7);
  assert.ok(etat.emergences.every((e) => e === 1));
  assert.equal(etat.lumiereFenetres, 1);
  assert.equal(etat.opaciteParticules, 0);
  assert.equal(etat.opaciteScene, 1);
});

test('le nombre d etapes demande est respecte', () => {
  assert.equal(calculerEtatScene(5, 4).emergences.length, 4);
  assert.equal(etatImmobile(9).emergences.length, 9);
});
