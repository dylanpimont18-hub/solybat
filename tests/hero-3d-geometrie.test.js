import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  construireGeometrieMaison,
  compterEtapes,
  construireGrilleSol,
  extrairePointsDeConvergence,
  normaliser,
  DIMENSIONS,
} from '../src/js/hero-3d/geometrie-maison.js';

const pieces = construireGeometrieMaison();

test('chaque piece a autant de normales que de positions', () => {
  for (const piece of pieces) {
    assert.equal(
      piece.positions.length,
      piece.normales.length,
      `${piece.nom} : positions et normales desynchronisees`,
    );
    assert.equal(piece.positions.length % 9, 0, `${piece.nom} : triangles incomplets`);
  }
});

test('toutes les normales sont unitaires', () => {
  for (const piece of pieces) {
    for (let i = 0; i < piece.normales.length; i += 3) {
      const longueur = Math.hypot(piece.normales[i], piece.normales[i + 1], piece.normales[i + 2]);
      assert.ok(
        Math.abs(longueur - 1) < 1e-5,
        `${piece.nom} : normale de longueur ${longueur}`,
      );
    }
  }
});

test('la scene reste sous le budget de 120 triangles', () => {
  const total = pieces.reduce((somme, piece) => somme + piece.nombreTriangles, 0);
  assert.ok(total > 0, 'la scene est vide');
  assert.ok(total <= 120, `budget depasse : ${total} triangles`);
});

test('aucune piece n est vide', () => {
  for (const piece of pieces) {
    assert.ok(piece.nombreTriangles > 0, `${piece.nom} ne produit aucun triangle`);
    assert.ok(piece.aretes.length > 0, `${piece.nom} ne produit aucune arete`);
  }
});

test('les ordres de construction sont contigus a partir de zero', () => {
  const ordres = [...new Set(pieces.map((piece) => piece.ordre))].sort((a, b) => a - b);
  assert.deepEqual(ordres, ordres.map((_, index) => index));
});

test('compterEtapes correspond au nombre d ordres distincts', () => {
  assert.equal(compterEtapes(pieces), new Set(pieces.map((p) => p.ordre)).size);
});

test('la dalle est construite en premier et le toit apres les murs', () => {
  const ordreDe = (nom) => pieces.find((piece) => piece.nom === nom).ordre;
  assert.equal(ordreDe('dalle'), 0);
  assert.ok(ordreDe('murs') < ordreDe('toit'), 'le toit ne peut pas precede les murs');
  assert.ok(ordreDe('toit') < ordreDe('vitres'), 'les finitions viennent en dernier');
});

test('la geometrie tient dans le volume annonce', () => {
  const marge = 0.6;
  for (const piece of pieces) {
    for (let i = 0; i < piece.positions.length; i += 3) {
      assert.ok(Math.abs(piece.positions[i]) <= DIMENSIONS.DEMI_LARGEUR + marge);
      assert.ok(piece.positions[i + 1] <= DIMENSIONS.HAUTEUR_FAITAGE + marge);
      assert.ok(Math.abs(piece.positions[i + 2]) <= DIMENSIONS.DEMI_PROFONDEUR + marge);
    }
  }
});

test('les murs sont perces : la surface est inferieure a quatre murs pleins', () => {
  const murs = pieces.find((piece) => piece.nom === 'murs');
  // Quatre quads pleins feraient 8 triangles ; les percements en ajoutent.
  assert.ok(murs.nombreTriangles > 8, 'les murs ne semblent pas decoupes');
});

test('l essaim ne depasse jamais le plafond demande', () => {
  assert.ok(extrairePointsDeConvergence(pieces, 40).length <= 40);
  assert.ok(extrairePointsDeConvergence(pieces, 5).length <= 5);
});

test('l essaim ne contient pas de doublons', () => {
  const points = extrairePointsDeConvergence(pieces, 10000);
  const cles = new Set(points.map((p) => p.map((v) => v.toFixed(3)).join('/')));
  assert.equal(cles.size, points.length);
});

test('la grille de sol est faite de segments complets et plans', () => {
  const grille = construireGrilleSol(2, 1);
  assert.equal(grille.length % 6, 0, 'segments incomplets');
  const hauteurs = new Set();
  for (let i = 1; i < grille.length; i += 3) hauteurs.add(grille[i]);
  assert.equal(hauteurs.size, 1, 'la grille doit etre plane');
});

test('normaliser gere le vecteur nul sans produire NaN', () => {
  assert.deepEqual(normaliser([0, 0, 0]), [0, 0, 0]);
  assert.deepEqual(normaliser([0, 5, 0]), [0, 1, 0]);
});
