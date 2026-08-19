import { test } from 'node:test';
import assert from 'node:assert/strict';
import assemblerCss from '../lib/assembler-css.cjs';

const { resoudreImports, minifierCss, assembler } = assemblerCss;

/* ---------------- resolution des imports ---------------- */

test('un import est remplace par le contenu du fichier vise', () => {
  const sortie = resoudreImports("@import url('a.css');", (nom) => (nom === 'a.css' ? 'body{color:red}' : null));
  assert.match(sortie, /body\{color:red\}/);
  assert.doesNotMatch(sortie, /@import/);
});

test('les imports sont resolus recursivement', () => {
  const fichiers = { 'a.css': "@import url('b.css');\n.a{}", 'b.css': '.b{}' };
  const sortie = resoudreImports("@import url('a.css');", (nom) => fichiers[nom] ?? null);
  assert.match(sortie, /\.a\{\}/);
  assert.match(sortie, /\.b\{\}/);
});

test('un import deja resolu n est pas duplique', () => {
  const fichiers = { 'a.css': '.a{}' };
  const sortie = resoudreImports("@import url('a.css');@import url('a.css');", (nom) => fichiers[nom] ?? null);
  assert.equal(sortie.match(/\.a\{\}/g).length, 1);
});

test('une boucle entre deux feuilles ne fait pas tourner l assemblage a l infini', () => {
  const fichiers = { 'a.css': "@import url('b.css');.a{}", 'b.css': "@import url('a.css');.b{}" };
  const sortie = resoudreImports("@import url('a.css');", (nom) => fichiers[nom] ?? null);
  assert.match(sortie, /\.a\{\}/);
  assert.match(sortie, /\.b\{\}/);
});

test('un import introuvable est conserve tel quel plutot que perdu', () => {
  const sortie = resoudreImports("@import url('absent.css');", () => null);
  assert.match(sortie, /@import url\('absent\.css'\);/);
});

test('les guillemets simples, doubles et absents sont acceptes', () => {
  for (const source of ['@import url(a.css);', "@import url('a.css');", '@import url("a.css");']) {
    const sortie = resoudreImports(source, () => '.a{}');
    assert.match(sortie, /\.a\{\}/, `echec pour ${source}`);
  }
});

/* ---------------- minification ---------------- */

test('les commentaires sont retires', () => {
  assert.equal(minifierCss('/* note */.a{color:red}'), '.a{color:red}');
});

test('les espaces et retours a la ligne sont reduits', () => {
  assert.equal(minifierCss('.a  ,\n.b {\n  color : red ;\n}'), '.a,.b{color : red}');
});

test('le dernier point-virgule d un bloc est supprime', () => {
  assert.equal(minifierCss('.a{color:red;}'), '.a{color:red}');
});

test('les espaces autour des deux-points de selecteur sont preserves', () => {
  // « a :hover » (descendant) et « a:hover » ne designent pas la meme chose.
  assert.match(minifierCss('a :hover{color:red}'), /a :hover/);
  assert.match(minifierCss('a:hover{color:red}'), /a:hover/);
});

test('les espaces necessaires dans calc() sont preserves', () => {
  const sortie = minifierCss('.a{height:calc(100svh - 9rem)}');
  assert.match(sortie, /calc\(100svh - 9rem\)/);
});

test('le contenu des chaines est recopie a l identique', () => {
  const source = ".a{background:url(\"data:image/svg+xml,%3Csvg   /* pas un commentaire */ %3E\")}";
  const sortie = minifierCss(source);
  assert.match(sortie, /%3Csvg {3}\/\* pas un commentaire \*\/ %3E/);
});

test('une chaine contenant une accolade ne casse pas la minification', () => {
  const sortie = minifierCss(".a{content:'} {'}");
  assert.match(sortie, /content:'\} \{'/);
});

test('les media queries restent valides', () => {
  const sortie = minifierCss('@media (max-width: 760px) {\n  .a { color: red; }\n}');
  assert.match(sortie, /@media \(max-width: 760px\)\{\.a\{color: red\}\}/);
});

test('la minification est idempotente', () => {
  const source = '/* x */.a , .b{color:red;}\n@media (min-width:900px){.c{gap:1rem}}';
  const une = minifierCss(source);
  assert.equal(minifierCss(une), une);
});

/* ---------------- assemblage complet ---------------- */

test('assembler resout puis minifie en une passe', () => {
  const fichiers = { 'a.css': '/* commentaire */\n.a {\n  color: red;\n}' };
  const sortie = assembler("@import url('a.css');", (nom) => fichiers[nom] ?? null);
  assert.equal(sortie, '.a{color: red}');
});

test('assembler ne perd aucune regle du corpus reel', () => {
  const fichiers = {
    'tokens.css': ':root{--x:1px}',
    'base.css': 'body{margin:0}',
    'mouvement.css': '@media (prefers-reduced-motion: reduce){.a{transition:none}}',
  };
  const racine = "@import url('tokens.css');@import url('base.css');@import url('mouvement.css');";
  const sortie = assembler(racine, (nom) => fichiers[nom] ?? null);
  assert.match(sortie, /--x:1px/);
  assert.match(sortie, /body\{margin:0\}/);
  assert.match(sortie, /prefers-reduced-motion/);
  assert.doesNotMatch(sortie, /@import/);
});
