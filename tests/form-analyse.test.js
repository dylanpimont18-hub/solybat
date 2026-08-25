import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validerAnalyse } from '../src/js/form-analyse.js';

const complet = {
  nom: 'Claire Martin',
  email: 'claire@example.com',
  ville: 'Vierzon',
  bien: 'T2, 48 m²',
  prix_achat: '45 000 €',
};

test('accepte une demande complete', () => {
  const resultat = validerAnalyse(complet);
  assert.equal(resultat.valide, true);
  assert.deepEqual(resultat.erreurs, {});
});

test('les champs facultatifs peuvent rester vides', () => {
  const resultat = validerAnalyse({ ...complet, telephone: '', travaux: '', loyer: '', message: '' });
  assert.equal(resultat.valide, true);
});

test('rejette un email mal forme', () => {
  const resultat = validerAnalyse({ ...complet, email: 'pas-un-email' });
  assert.equal(resultat.valide, false);
  assert.ok(resultat.erreurs.email);
});

test('exige les trois champs decrivant le bien', () => {
  for (const champ of ['ville', 'bien', 'prix_achat']) {
    const resultat = validerAnalyse({ ...complet, [champ]: '' });
    assert.equal(resultat.valide, false, `${champ} vide devrait invalider`);
    assert.ok(resultat.erreurs[champ], `une erreur devrait porter sur ${champ}`);
  }
});

/* Un champ ne contenant que des espaces passait la verification "champ non
   vide" la plus naive : il est traite comme absent. */
test('un champ rempli d espaces est traite comme vide', () => {
  const resultat = validerAnalyse({ ...complet, ville: '   ' });
  assert.equal(resultat.valide, false);
  assert.ok(resultat.erreurs.ville);
});

test('un champ absent est traite comme vide', () => {
  const { ville, ...sansVille } = complet;
  const resultat = validerAnalyse(sansVille);
  assert.equal(resultat.valide, false);
  assert.ok(resultat.erreurs.ville);
});

/* Le profil et le message sont exiges du formulaire de devis, pas de celui-ci :
   les reclamer ici rendrait l analyse impossible a envoyer. */
test('n exige ni profil ni message, contrairement au devis', () => {
  const resultat = validerAnalyse(complet);
  assert.equal(resultat.valide, true);
  assert.equal(resultat.erreurs.profil, undefined);
  assert.equal(resultat.erreurs.message, undefined);
});

test('releve toutes les erreurs d un coup, pas seulement la premiere', () => {
  const resultat = validerAnalyse({});
  assert.equal(resultat.valide, false);
  assert.equal(Object.keys(resultat.erreurs).length, 5);
});
