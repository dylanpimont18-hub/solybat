import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import synthese from '../lib/synthese-rentabilite.cjs';

const {
  lireNombre, moyenne, formaterPourcentage, formaterEuros,
  calculerSynthese, meilleuresOperations,
} = synthese;

const reelles = JSON.parse(readFileSync('src/_data/retoursClients.json', 'utf8'));

/* ---------------- lecture des nombres ---------------- */

test('lit les formats presents dans les donnees reelles', () => {
  assert.equal(lireNombre('16,08 %'), 16.08);
  assert.equal(lireNombre('73 €/mois'), 73);
  assert.equal(lireNombre('1,38'), 1.38);
  assert.equal(lireNombre('12 000 €'), 12000);
  assert.equal(lireNombre('18 ans à 3,45 %'), 18);
});

test('accepte un nombre deja numerique', () => {
  assert.equal(lireNombre(42.5), 42.5);
});

test('retourne null plutot que NaN sur une entree illisible', () => {
  // Un NaN se propagerait silencieusement dans toutes les moyennes.
  for (const entree of ['', 'sans chiffre', null, undefined, {}, NaN, Infinity]) {
    assert.equal(lireNombre(entree), null, `attendu null pour ${JSON.stringify(entree)}`);
  }
});

test('moyenne d une liste vide vaut null', () => {
  assert.equal(moyenne([]), null);
  assert.equal(moyenne([2, 4]), 3);
});

/* ---------------- formatage ---------------- */

test('formate les pourcentages a la francaise', () => {
  assert.equal(formaterPourcentage(12.1234), '12,1 %');
  assert.equal(formaterPourcentage(12.16), '12,2 %');
  assert.equal(formaterPourcentage(16.08, 2), '16,08 %');
  assert.equal(formaterPourcentage(null), null);
});

test('les valeurs du fichier de donnees sont restituees a l identique', () => {
  // Le fichier porte deja des valeurs a 2 decimales : le formatage ne doit
  // pas les alterer. (toFixed depend de la representation binaire : 16.075
  // donne « 16,07 » — sans consequence ici, rien n'est re-arrondi.)
  for (const operation of reelles) {
    const valeur = lireNombre(operation.rentabiliteBrute);
    assert.equal(formaterPourcentage(valeur, 2), operation.rentabiliteBrute);
  }
});

test('formate les euros avec separateur de milliers', () => {
  const sortie = formaterEuros(410200);
  assert.match(sortie, /^410.200 €$/, `separateur inattendu : ${JSON.stringify(sortie)}`);
  assert.equal(formaterEuros(null), null);
});

/* ---------------- synthese ---------------- */

test('une liste vide ne fait pas planter la synthese', () => {
  const s = calculerSynthese([]);
  assert.equal(s.nombreOperations, 0);
  assert.equal(s.cashFlowPositif, 0);
  assert.equal(s.rentabiliteMoyenne, null);
  assert.equal(s.libelles.rentabiliteMoyenne, null);
});

test('une entree non tableau est traitee comme vide', () => {
  assert.equal(calculerSynthese(null).nombreOperations, 0);
  assert.equal(calculerSynthese(undefined).nombreOperations, 0);
});

test('les operations illisibles sont ecartees sans fausser les moyennes', () => {
  const s = calculerSynthese([
    { rentabiliteBrute: '10 %', cashFlow: '100 €/mois', dscr: '1,2', travaux: '1 000 €', coutTotal: '2 000 €' },
    { rentabiliteBrute: 'inconnu', cashFlow: '', dscr: null, travaux: 'n/a', coutTotal: undefined },
    { rentabiliteBrute: '20 %', cashFlow: '200 €/mois', dscr: '1,4', travaux: '3 000 €', coutTotal: '4 000 €' },
  ]);
  assert.equal(s.nombreOperations, 3, 'le total compte toutes les operations');
  assert.equal(s.rentabiliteMoyenne, 15, 'la moyenne ne porte que sur les valeurs lisibles');
  assert.equal(s.travauxCumules, 4000);
  assert.equal(s.cashFlowPositif, 2);
});

test('les bornes min/max sont correctes', () => {
  const s = calculerSynthese(reelles);
  assert.ok(s.rentabiliteMin < s.rentabiliteMax);
  assert.ok(s.cashFlowMin <= s.cashFlowMoyen && s.cashFlowMoyen <= s.cashFlowMax);
});

test('la synthese des donnees reelles correspond au fichier', () => {
  const s = calculerSynthese(reelles);
  assert.equal(s.nombreOperations, reelles.length);
  assert.equal(s.cashFlowPositif, reelles.length, 'toutes les operations sont en cash-flow positif');
  assert.equal(s.dscrSuperieurA1, reelles.length, 'toutes ont un DSCR > 1');
  assert.equal(s.libelles.cashFlowPositif, `${reelles.length}/${reelles.length}`);
  assert.match(s.libelles.rentabiliteMoyenne, /^\d+,\d %$/);
  assert.match(s.libelles.cashFlowMoyen, /^\d+ €$/);
});

test('les libelles restent lisibles par le module de compteurs', async () => {
  // Les chiffres du bloc sont animes : si le libelle n'est pas analysable,
  // l'animation ecraserait le texte affiche.
  const { analyserValeur, formaterValeur } = await import('../src/js/compteurs.js');
  const s = calculerSynthese(reelles);
  for (const libelle of Object.values(s.libelles)) {
    if (!libelle || libelle.includes(' à ')) continue; // la fourchette n'est pas animee
    const format = analyserValeur(libelle);
    assert.ok(format, `libelle non analysable : ${libelle}`);
    assert.equal(formaterValeur(format.valeur, format), libelle, `aller-retour casse pour ${libelle}`);
  }
});

/* ---------------- meilleures operations ---------------- */

test('retourne les operations les plus rentables, dans l ordre', () => {
  const top = meilleuresOperations(reelles, 3);
  assert.equal(top.length, 3);
  const valeurs = top.map((o) => lireNombre(o.rentabiliteBrute));
  assert.deepEqual(valeurs, [...valeurs].sort((a, b) => b - a), 'tri decroissant attendu');
  const toutes = reelles.map((o) => lireNombre(o.rentabiliteBrute));
  assert.equal(valeurs[0], Math.max(...toutes));
});

test('demander plus d operations qu il n en existe ne plante pas', () => {
  assert.equal(meilleuresOperations(reelles, 99).length, reelles.length);
  assert.deepEqual(meilleuresOperations([], 3), []);
  assert.deepEqual(meilleuresOperations(null, 3), []);
});

test('le tri est stable a rentabilite egale', () => {
  const donnees = [
    { nom: 'a', rentabiliteBrute: '10 %' },
    { nom: 'b', rentabiliteBrute: '10 %' },
    { nom: 'c', rentabiliteBrute: '12 %' },
  ];
  assert.deepEqual(meilleuresOperations(donnees, 3).map((o) => o.nom), ['c', 'a', 'b']);
});
