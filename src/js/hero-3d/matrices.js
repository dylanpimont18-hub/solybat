/**
 * Matrices 4x4 en colonne-majeure (convention WebGL).
 *
 * Toutes les fonctions sont pures : elles retournent un nouveau Float32Array
 * et ne modifient jamais leurs arguments.
 *
 * Convention de composition : `multiplierMatrices(a, b)` retourne le produit
 * matriciel a·b, donc appliqué à un vecteur colonne v, c'est `b` qui agit en
 * premier. On lit donc les compositions de droite à gauche.
 */

export function matriceIdentite() {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

export function multiplierMatrices(a, b) {
  const resultat = new Float32Array(16);
  for (let colonne = 0; colonne < 4; colonne += 1) {
    for (let ligne = 0; ligne < 4; ligne += 1) {
      let somme = 0;
      for (let k = 0; k < 4; k += 1) {
        somme += a[k * 4 + ligne] * b[colonne * 4 + k];
      }
      resultat[colonne * 4 + ligne] = somme;
    }
  }
  return resultat;
}

export function matricePerspective(champDeVisionY, rapport, proche, lointain) {
  const f = 1 / Math.tan(champDeVisionY / 2);
  const profondeur = 1 / (proche - lointain);
  const m = new Float32Array(16);
  m[0] = f / rapport;
  m[5] = f;
  m[10] = (lointain + proche) * profondeur;
  m[11] = -1;
  m[14] = 2 * lointain * proche * profondeur;
  return m;
}

export function matriceRotationX(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const m = matriceIdentite();
  m[5] = c;
  m[6] = s;
  m[9] = -s;
  m[10] = c;
  return m;
}

export function matriceRotationY(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const m = matriceIdentite();
  m[0] = c;
  m[2] = -s;
  m[8] = s;
  m[10] = c;
  return m;
}

export function matriceTranslation(x, y, z) {
  const m = matriceIdentite();
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
}

/**
 * Caméra en orbite autour d'un point situé sur l'axe Y.
 * L'ordre de composition place la cible à l'origine, la fait tourner, puis
 * recule la caméra de `rayon`.
 */
export function matriceVueOrbite(rayon, azimut, elevation, hauteurCible) {
  return multiplierMatrices(
    multiplierMatrices(matriceTranslation(0, 0, -rayon), matriceRotationX(elevation)),
    multiplierMatrices(matriceRotationY(azimut), matriceTranslation(0, -hauteurCible, 0)),
  );
}
