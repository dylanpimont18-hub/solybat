/**
 * Séquencement temporel de la scène 3D du hero.
 *
 * Module pur : `calculerEtatScene` transforme un temps en secondes en un état
 * complet de la scène. Toute la chorégraphie tient ici, ce qui la rend
 * testable sans navigateur et permet de la régler sans toucher au rendu.
 */

/** Bornes de chaque phase, en secondes depuis le début de la boucle. */
export const SEQUENCE = [
  { nom: 'essaim', fin: 1.8 },
  { nom: 'filDeFer', fin: 2.8 },
  { nom: 'construction', fin: 8.8 },
  { nom: 'finie', fin: 10.6 },
  { nom: 'fondu', fin: 11.6 },
];

export const DUREE_BOUCLE = SEQUENCE[SEQUENCE.length - 1].fin;

export function borner01(valeur) {
  if (valeur < 0) return 0;
  if (valeur > 1) return 1;
  return valeur;
}

/** Accélération puis décélération (easeInOutCubic). */
export function adoucir(t) {
  const x = borner01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Décélération seule (easeOutCubic) — utilisée pour les arrivées. */
export function adoucirSortie(t) {
  const x = borner01(t);
  return 1 - Math.pow(1 - x, 3);
}

/**
 * Phase courante et progression 0..1 à l'intérieur de celle-ci.
 * Le temps est ramené dans la boucle, un temps négatif est accepté.
 */
export function calculerPhase(tempsSecondes) {
  const t = ((tempsSecondes % DUREE_BOUCLE) + DUREE_BOUCLE) % DUREE_BOUCLE;
  let debut = 0;
  for (const etape of SEQUENCE) {
    if (t < etape.fin) {
      return {
        nom: etape.nom,
        progression: (t - debut) / (etape.fin - debut),
        tempsBoucle: t,
      };
    }
    debut = etape.fin;
  }
  const derniere = SEQUENCE[SEQUENCE.length - 1];
  return { nom: derniere.nom, progression: 1, tempsBoucle: t };
}

/**
 * Avancement d'apparition d'une étape de construction.
 * Les fenêtres se chevauchent légèrement (facteur 1.25) pour que la
 * construction s'enchaîne au lieu de progresser par à-coups.
 */
export function calculerEmergence(progressionConstruction, ordre, nombreEtapes) {
  if (nombreEtapes <= 0) return 1;
  const largeurFenetre = 1 / nombreEtapes;
  const debut = ordre * largeurFenetre;
  const brut = (progressionConstruction - debut) / (largeurFenetre * 1.25);
  return adoucirSortie(brut);
}

/**
 * État complet de la scène à un instant donné.
 *
 * `opaciteScene` est un multiplicateur global : il porte le fondu de fin de
 * boucle et l'apparition initiale, ce qui évite tout saut visible au rebouclage.
 */
export function calculerEtatScene(tempsSecondes, nombreEtapes) {
  const etapes = nombreEtapes === undefined ? 7 : nombreEtapes;
  const phase = calculerPhase(tempsSecondes);
  const { nom, progression } = phase;

  const etat = {
    phase: nom,
    progression,
    convergence: 0,
    opaciteParticules: 0,
    opaciteAretes: 0,
    opaciteGrille: 0,
    opaciteScene: 1,
    lumiereFenetres: 0,
    emergences: new Array(etapes).fill(0),
  };

  if (nom === 'essaim') {
    etat.convergence = adoucir(progression);
    etat.opaciteParticules = 1;
    etat.opaciteAretes = adoucirSortie(borner01((progression - 0.55) / 0.45));
    etat.opaciteGrille = adoucirSortie(borner01(progression / 0.5));
    // Apparition franche en début de boucle, pour masquer la réinitialisation.
    etat.opaciteScene = adoucirSortie(borner01(progression / 0.22));
  } else if (nom === 'filDeFer') {
    etat.convergence = 1;
    etat.opaciteParticules = 1 - adoucir(progression);
    etat.opaciteAretes = 1;
    etat.opaciteGrille = 1;
  } else if (nom === 'construction') {
    etat.convergence = 1;
    etat.opaciteAretes = 1;
    etat.opaciteGrille = 1;
    for (let ordre = 0; ordre < etapes; ordre += 1) {
      etat.emergences[ordre] = calculerEmergence(progression, ordre, etapes);
    }
  } else if (nom === 'finie') {
    etat.convergence = 1;
    etat.opaciteGrille = 1 - adoucir(borner01((progression - 0.4) / 0.6)) * 0.65;
    etat.opaciteAretes = 1 - adoucir(borner01((progression - 0.2) / 0.5)) * 0.55;
    etat.emergences.fill(1);
    etat.lumiereFenetres = adoucirSortie(borner01(progression / 0.45));
  } else {
    etat.convergence = 1;
    etat.opaciteAretes = 0.45;
    etat.opaciteGrille = 0.35;
    etat.emergences.fill(1);
    etat.lumiereFenetres = 1;
    etat.opaciteScene = 1 - adoucir(progression);
  }

  return etat;
}

/** État figé « maison terminée », servi quand l'utilisateur refuse les animations. */
export function etatImmobile(nombreEtapes) {
  const etapes = nombreEtapes === undefined ? 7 : nombreEtapes;
  return {
    phase: 'finie',
    progression: 1,
    convergence: 1,
    opaciteParticules: 0,
    opaciteAretes: 0.4,
    opaciteGrille: 0.35,
    opaciteScene: 1,
    lumiereFenetres: 1,
    emergences: new Array(etapes).fill(1),
  };
}
