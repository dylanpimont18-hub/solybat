/**
 * Génération de la maquette de maison affichée dans le hero de l'accueil.
 *
 * Module pur : aucune dépendance au DOM ni à WebGL, tout est calculable et
 * testable en Node. La scène est volontairement basse densité (~60 triangles)
 * pour rester à 60 fps sur un smartphone d'entrée de gamme.
 *
 * Repère : X = largeur, Y = hauteur (0 = dalle), Z = profondeur.
 * Les normales sont imposées plutôt que déduites du sens de parcours, pour
 * qu'un réglage ultérieur de la géométrie ne casse pas silencieusement l'éclairage.
 */

const DEMI_LARGEUR = 1.25;
const DEMI_PROFONDEUR = 0.95;
const HAUTEUR_MUR = 1.15;
const HAUTEUR_FAITAGE = 1.95;
const DEBORD_TOIT = 0.16;
const EPAISSEUR_DALLE = 0.12;

/** Couleurs de marque converties en composantes 0..1. */
export const COULEURS = {
  cremeClaire: [0.965, 0.945, 0.906],
  cremeSable: [0.929, 0.894, 0.827],
  boisBrule: [0.420, 0.290, 0.196],
  terracotta: [0.710, 0.314, 0.180],
  anthracite: [0.169, 0.153, 0.137],
  olivier: [0.478, 0.522, 0.376],
};

function produitVectoriel(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function normaliser(v) {
  const longueur = Math.hypot(v[0], v[1], v[2]);
  if (longueur === 0) return [0, 0, 0];
  return [v[0] / longueur, v[1] / longueur, v[2] / longueur];
}

function combiner(origine, axeU, u, axeV, v) {
  return [
    origine[0] + axeU[0] * u + axeV[0] * v,
    origine[1] + axeU[1] * u + axeV[1] * v,
    origine[2] + axeU[2] * u + axeV[2] * v,
  ];
}

/** Accumulateur de géométrie : triangles pleins d'un côté, arêtes de l'autre. */
function creerAccumulateur() {
  return { positions: [], normales: [], aretes: [] };
}

function ajouterArete(acc, a, b) {
  acc.aretes.push(a[0], a[1], a[2], b[0], b[1], b[2]);
}

/**
 * Ajoute un quadrilatère (p0 vers p3) sous forme de deux triangles, plus ses
 * quatre arêtes. La normale est imposée, pas déduite du sens de parcours.
 */
function ajouterQuad(acc, p0, p1, p2, p3, normale) {
  const n = normaliser(normale);
  for (const p of [p0, p1, p2, p0, p2, p3]) {
    acc.positions.push(p[0], p[1], p[2]);
    acc.normales.push(n[0], n[1], n[2]);
  }
  ajouterArete(acc, p0, p1);
  ajouterArete(acc, p1, p2);
  ajouterArete(acc, p2, p3);
  ajouterArete(acc, p3, p0);
}

function ajouterTriangle(acc, p0, p1, p2, normale) {
  const n = normaliser(normale);
  for (const p of [p0, p1, p2]) {
    acc.positions.push(p[0], p[1], p[2]);
    acc.normales.push(n[0], n[1], n[2]);
  }
  ajouterArete(acc, p0, p1);
  ajouterArete(acc, p1, p2);
  ajouterArete(acc, p2, p0);
}

/**
 * Mur plan percé d'une ouverture rectangulaire : quatre quads (allège,
 * linteau, deux tableaux) au lieu d'un seul, pour laisser passer le vide.
 * Une ouverture nulle donne un mur plein.
 */
function ajouterMur(acc, mur) {
  const { origine, axeU, axeV, largeur, hauteur, ouverture } = mur;
  const normale = produitVectoriel(axeU, axeV);
  const point = (u, v) => combiner(origine, axeU, u, axeV, v);

  if (!ouverture) {
    ajouterQuad(acc, point(0, 0), point(largeur, 0), point(largeur, hauteur), point(0, hauteur), normale);
    return;
  }

  const { u0, u1, v0, v1 } = ouverture;
  if (v0 > 0) {
    ajouterQuad(acc, point(0, 0), point(largeur, 0), point(largeur, v0), point(0, v0), normale);
  }
  if (v1 < hauteur) {
    ajouterQuad(acc, point(0, v1), point(largeur, v1), point(largeur, hauteur), point(0, hauteur), normale);
  }
  ajouterQuad(acc, point(0, v0), point(u0, v0), point(u0, v1), point(0, v1), normale);
  ajouterQuad(acc, point(u1, v0), point(largeur, v0), point(largeur, v1), point(u1, v1), normale);
}

/** Coins de l'ouverture, légèrement ramenés vers l'extérieur pour éviter le z-fighting. */
function coinsOuverture(mur, retrait) {
  const { origine, axeU, axeV, ouverture } = mur;
  const normale = normaliser(produitVectoriel(axeU, axeV));
  const point = (u, v) => {
    const p = combiner(origine, axeU, u, axeV, v);
    return [
      p[0] - normale[0] * retrait,
      p[1] - normale[1] * retrait,
      p[2] - normale[2] * retrait,
    ];
  };
  const { u0, u1, v0, v1 } = ouverture;
  return {
    normale,
    coins: [point(u0, v0), point(u1, v0), point(u1, v1), point(u0, v1)],
  };
}

/** Les quatre murs porteurs et leurs percements. */
const MURS = [
  {
    nom: 'mur-arriere',
    origine: [DEMI_LARGEUR, 0, -DEMI_PROFONDEUR],
    axeU: [-1, 0, 0],
    axeV: [0, 1, 0],
    largeur: DEMI_LARGEUR * 2,
    hauteur: HAUTEUR_MUR,
    ouverture: { u0: 0.82, u1: 1.68, v0: 0.46, v1: 0.98 },
    percement: 'fenetre',
  },
  {
    nom: 'mur-gauche',
    origine: [-DEMI_LARGEUR, 0, -DEMI_PROFONDEUR],
    axeU: [0, 0, 1],
    axeV: [0, 1, 0],
    largeur: DEMI_PROFONDEUR * 2,
    hauteur: HAUTEUR_MUR,
    ouverture: { u0: 0.5, u1: 1.3, v0: 0.46, v1: 0.98 },
    percement: 'fenetre',
  },
  {
    nom: 'mur-droit',
    origine: [DEMI_LARGEUR, 0, DEMI_PROFONDEUR],
    axeU: [0, 0, -1],
    axeV: [0, 1, 0],
    largeur: DEMI_PROFONDEUR * 2,
    hauteur: HAUTEUR_MUR,
    ouverture: { u0: 0.5, u1: 1.3, v0: 0.46, v1: 0.98 },
    percement: 'fenetre',
  },
  {
    nom: 'mur-avant',
    origine: [-DEMI_LARGEUR, 0, DEMI_PROFONDEUR],
    axeU: [1, 0, 0],
    axeV: [0, 1, 0],
    largeur: DEMI_LARGEUR * 2,
    hauteur: HAUTEUR_MUR,
    ouverture: { u0: 1.02, u1: 1.74, v0: 0, v1: 0.94 },
    percement: 'porte',
  },
];

function construireDalle() {
  const acc = creerAccumulateur();
  const x = DEMI_LARGEUR + 0.14;
  const z = DEMI_PROFONDEUR + 0.14;
  const bas = -EPAISSEUR_DALLE;
  ajouterQuad(acc, [-x, 0, z], [x, 0, z], [x, 0, -z], [-x, 0, -z], [0, 1, 0]);
  ajouterQuad(acc, [-x, bas, z], [x, bas, z], [x, 0, z], [-x, 0, z], [0, 0, 1]);
  ajouterQuad(acc, [x, bas, -z], [-x, bas, -z], [-x, 0, -z], [x, 0, -z], [0, 0, -1]);
  ajouterQuad(acc, [x, bas, z], [x, bas, -z], [x, 0, -z], [x, 0, z], [1, 0, 0]);
  ajouterQuad(acc, [-x, bas, -z], [-x, bas, z], [-x, 0, z], [-x, 0, -z], [-1, 0, 0]);
  return acc;
}

function construireCloison() {
  const acc = creerAccumulateur();
  const x = -0.18;
  ajouterQuad(
    acc,
    [x, 0, -DEMI_PROFONDEUR],
    [x, 0, 0.24],
    [x, HAUTEUR_MUR, 0.24],
    [x, HAUTEUR_MUR, -DEMI_PROFONDEUR],
    [1, 0, 0],
  );
  return acc;
}

function construirePignons() {
  const acc = creerAccumulateur();
  const cotes = [[-DEMI_LARGEUR, [-1, 0, 0]], [DEMI_LARGEUR, [1, 0, 0]]];
  for (const cote of cotes) {
    const x = cote[0];
    ajouterTriangle(
      acc,
      [x, HAUTEUR_MUR, -DEMI_PROFONDEUR],
      [x, HAUTEUR_MUR, DEMI_PROFONDEUR],
      [x, HAUTEUR_FAITAGE, 0],
      cote[1],
    );
  }
  return acc;
}

function construireToit() {
  const acc = creerAccumulateur();
  const x = DEMI_LARGEUR + DEBORD_TOIT;
  const zGouttiere = DEMI_PROFONDEUR + DEBORD_TOIT;
  const yGouttiere = HAUTEUR_MUR - 0.07;
  const pente = normaliser([0, zGouttiere, HAUTEUR_FAITAGE - yGouttiere]);

  ajouterQuad(
    acc,
    [-x, yGouttiere, zGouttiere],
    [x, yGouttiere, zGouttiere],
    [x, HAUTEUR_FAITAGE, 0],
    [-x, HAUTEUR_FAITAGE, 0],
    pente,
  );
  ajouterQuad(
    acc,
    [x, yGouttiere, -zGouttiere],
    [-x, yGouttiere, -zGouttiere],
    [-x, HAUTEUR_FAITAGE, 0],
    [x, HAUTEUR_FAITAGE, 0],
    [pente[0], pente[1], -pente[2]],
  );
  return acc;
}

function construireCheminee() {
  const acc = creerAccumulateur();
  const cx = 0.62;
  const cz = -0.34;
  const demi = 0.11;
  const bas = 1.42;
  const haut = HAUTEUR_FAITAGE + 0.34;
  const p = (dx, y, dz) => [cx + dx * demi, y, cz + dz * demi];

  ajouterQuad(acc, p(-1, bas, 1), p(1, bas, 1), p(1, haut, 1), p(-1, haut, 1), [0, 0, 1]);
  ajouterQuad(acc, p(1, bas, -1), p(-1, bas, -1), p(-1, haut, -1), p(1, haut, -1), [0, 0, -1]);
  ajouterQuad(acc, p(1, bas, 1), p(1, bas, -1), p(1, haut, -1), p(1, haut, 1), [1, 0, 0]);
  ajouterQuad(acc, p(-1, bas, -1), p(-1, bas, 1), p(-1, haut, 1), p(-1, haut, -1), [-1, 0, 0]);
  ajouterQuad(acc, p(-1, haut, 1), p(1, haut, 1), p(1, haut, -1), p(-1, haut, -1), [0, 1, 0]);
  return acc;
}

function construireMenuiseries(percementVoulu) {
  const acc = creerAccumulateur();
  for (const mur of MURS) {
    if (mur.percement !== percementVoulu) continue;
    const ouverture = coinsOuverture(mur, 0.03);
    const c = ouverture.coins;
    ajouterQuad(acc, c[0], c[1], c[2], c[3], ouverture.normale);
  }
  return acc;
}

function construireMurs() {
  const acc = creerAccumulateur();
  for (const mur of MURS) ajouterMur(acc, mur);
  return acc;
}

function finaliser(nom, ordre, couleur, hauteurEmergence, acc) {
  return {
    nom,
    ordre,
    couleur,
    hauteurEmergence,
    positions: new Float32Array(acc.positions),
    normales: new Float32Array(acc.normales),
    aretes: new Float32Array(acc.aretes),
    nombreTriangles: acc.positions.length / 9,
  };
}

/**
 * Pièces de la maquette, dans l'ordre de construction.
 * Plusieurs pièces peuvent partager le même `ordre` pour émerger ensemble
 * (ici les vitres et la porte, posées dans la même étape de finitions).
 */
export function construireGeometrieMaison() {
  return [
    finaliser('dalle', 0, COULEURS.boisBrule, 0.45, construireDalle()),
    finaliser('murs', 1, COULEURS.cremeClaire, 1.05, construireMurs()),
    finaliser('cloison', 2, COULEURS.cremeSable, 0.85, construireCloison()),
    finaliser('pignons', 3, COULEURS.cremeClaire, 0.70, construirePignons()),
    finaliser('toit', 4, COULEURS.terracotta, 0.80, construireToit()),
    finaliser('cheminee', 5, COULEURS.boisBrule, 0.50, construireCheminee()),
    finaliser('vitres', 6, COULEURS.anthracite, 0.35, construireMenuiseries('fenetre')),
    finaliser('porte', 6, COULEURS.terracotta, 0.35, construireMenuiseries('porte')),
  ];
}

/** Nombre d'étapes distinctes de construction (indices `ordre` uniques). */
export function compterEtapes(pieces) {
  return new Set(pieces.map((piece) => piece.ordre)).size;
}

/** Grille de sol « plan d'architecte », en segments de ligne. */
export function construireGrilleSol(demiEtendue, pas) {
  const etendue = demiEtendue === undefined ? 4.2 : demiEtendue;
  const intervalle = pas === undefined ? 0.6 : pas;
  const y = -EPAISSEUR_DALLE - 0.01;
  const segments = [];
  for (let v = -etendue; v <= etendue + 1e-6; v += intervalle) {
    segments.push(-etendue, y, v, etendue, y, v);
    segments.push(v, y, -etendue, v, y, etendue);
  }
  return new Float32Array(segments);
}

/**
 * Points cibles de l'essaim de particules : les sommets uniques des arêtes,
 * sous-échantillonnés pour rester sous `maximum` points.
 */
export function extrairePointsDeConvergence(pieces, maximum) {
  const plafond = maximum === undefined ? 220 : maximum;
  const vus = new Set();
  const points = [];
  for (const piece of pieces) {
    for (let i = 0; i < piece.aretes.length; i += 3) {
      const x = piece.aretes[i];
      const y = piece.aretes[i + 1];
      const z = piece.aretes[i + 2];
      const cle = x.toFixed(3) + '/' + y.toFixed(3) + '/' + z.toFixed(3);
      if (vus.has(cle)) continue;
      vus.add(cle);
      points.push([x, y, z]);
    }
  }
  if (points.length <= plafond) return points;
  const pasEchantillon = points.length / plafond;
  const echantillon = [];
  for (let i = 0; i < plafond; i += 1) {
    echantillon.push(points[Math.floor(i * pasEchantillon)]);
  }
  return echantillon;
}

export const DIMENSIONS = {
  DEMI_LARGEUR,
  DEMI_PROFONDEUR,
  HAUTEUR_MUR,
  HAUTEUR_FAITAGE,
  centreY: HAUTEUR_MUR * 0.62,
};
