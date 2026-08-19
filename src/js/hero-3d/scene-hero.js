/**
 * Scène 3D du hero : assemblage des tampons, caméra, boucle de rendu.
 *
 * Garde-fous imposés par la contrainte « ça doit tourner sur smartphone » :
 *   - densité de pixels plafonnée (un écran 3x ne rend pas 9x plus de pixels) ;
 *   - boucle stoppée dès que l'onglet passe en arrière-plan ;
 *   - perte de contexte WebGL rattrapée par le repli photo ;
 *   - une seule image rendue si l'utilisateur refuse les animations.
 */

import {
  matriceIdentite,
  matricePerspective,
  matriceTranslation,
  matriceVueOrbite,
  multiplierMatrices,
} from './matrices.js';
import {
  construireGeometrieMaison,
  construireGrilleSol,
  extrairePointsDeConvergence,
  compterEtapes,
  normaliser,
  DIMENSIONS,
} from './geometrie-maison.js';
import { calculerEtatScene, etatImmobile } from './phases.js';
import {
  creerContexte,
  creerProgramme,
  creerTampon,
  lierAttribut,
  SHADER_SOLIDE_SOMMET,
  SHADER_SOLIDE_FRAGMENT,
  SHADER_LIGNE_SOMMET,
  SHADER_LIGNE_FRAGMENT,
  SHADER_POINT_SOMMET,
  SHADER_POINT_FRAGMENT,
} from './webgl.js';

const PLAFOND_DENSITE_PIXELS = 1.5;
const CHAMP_DE_VISION = 0.74;
const RAYON_CAMERA_BASE = 5.35;
const VITESSE_ORBITE = 0.155;

const COULEUR_ARETE = [0.878, 0.541, 0.388];
const COULEUR_GRILLE = [0.62, 0.40, 0.29];
const COULEUR_PARTICULE = [0.929, 0.894, 0.827];
const COULEUR_FENETRE_ALLUMEE = [1.0, 0.74, 0.45];

/**
 * Recul de la caméra selon le rapport largeur/hauteur.
 *
 * Sur un téléphone en portrait, le cadre est étroit : sans compensation la
 * maison déborde latéralement. Fonction pure, testée séparément.
 */
export function calculerRayonCamera(rapport) {
  if (!Number.isFinite(rapport) || rapport <= 0) return RAYON_CAMERA_BASE;
  if (rapport >= 1) return RAYON_CAMERA_BASE;
  const compensation = 1 + (1 - rapport) * 1.45;
  return Math.min(RAYON_CAMERA_BASE * compensation, RAYON_CAMERA_BASE * 2.4);
}

/**
 * Décalage de la maquette dans le cadre, pour qu'elle ne passe pas sous le texte.
 *
 * En paysage large, le texte occupe la moitié gauche : la maison part à droite.
 * En portrait, le texte est en bas : la maison remonte. Fonction pure, testée.
 * Le résultat est exprimé en unités de la scène, dans le repère caméra.
 */
export function calculerDecalageCamera(rapport) {
  if (!Number.isFinite(rapport) || rapport <= 0) return [0, 0];
  if (rapport >= 1.5) return [1.15, 0.05];
  if (rapport >= 1.05) return [0.72, 0.05];
  if (rapport >= 0.8) return [0, 0.80];
  return [0, 1.05];
}

/** Générateur pseudo-aléatoire déterministe : la scène est identique à chaque visite. */
function creerTirage(graine) {
  let etat = graine >>> 0;
  return () => {
    etat = (etat * 1664525 + 1013904223) >>> 0;
    return etat / 4294967296;
  };
}

function construireEssaim(cibles, tirage) {
  const departs = new Float32Array(cibles.length * 3);
  const arrivees = new Float32Array(cibles.length * 3);
  for (let i = 0; i < cibles.length; i += 1) {
    const theta = tirage() * Math.PI * 2;
    const phi = Math.acos(2 * tirage() - 1);
    const rayon = 3.8 + tirage() * 3.4;
    departs[i * 3] = Math.sin(phi) * Math.cos(theta) * rayon;
    departs[i * 3 + 1] = Math.abs(Math.cos(phi)) * rayon * 0.7 + 0.2;
    departs[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * rayon;
    arrivees[i * 3] = cibles[i][0];
    arrivees[i * 3 + 1] = cibles[i][1];
    arrivees[i * 3 + 2] = cibles[i][2];
  }
  return { departs, arrivees, nombre: cibles.length };
}

/**
 * Prépare la scène et retourne son pilotage.
 * Retourne null si WebGL est indisponible : l'appelant bascule alors sur le repli.
 */
export function creerSceneHero(canvas, options) {
  const reglages = options || {};
  const gl = creerContexte(canvas);
  if (!gl) return null;

  let programmeSolide;
  let programmeLigne;
  let programmePoint;
  try {
    programmeSolide = creerProgramme(gl, SHADER_SOLIDE_SOMMET, SHADER_SOLIDE_FRAGMENT);
    programmeLigne = creerProgramme(gl, SHADER_LIGNE_SOMMET, SHADER_LIGNE_FRAGMENT);
    programmePoint = creerProgramme(gl, SHADER_POINT_SOMMET, SHADER_POINT_FRAGMENT);
  } catch (erreur) {
    return null;
  }

  const pieces = construireGeometrieMaison();
  const nombreEtapes = compterEtapes(pieces);

  const piecesGpu = pieces.map((piece) => ({
    ...piece,
    tamponPositions: creerTampon(gl, piece.positions),
    tamponNormales: creerTampon(gl, piece.normales),
    tamponAretes: creerTampon(gl, piece.aretes),
    nombreSommets: piece.positions.length / 3,
    nombreSommetsAretes: piece.aretes.length / 3,
  }));

  const grille = construireGrilleSol();
  const tamponGrille = creerTampon(gl, grille);
  const nombreSommetsGrille = grille.length / 3;

  const essaim = construireEssaim(extrairePointsDeConvergence(pieces, 200), creerTirage(20260819));
  const tamponDepart = creerTampon(gl, essaim.departs);
  const tamponArrivee = creerTampon(gl, essaim.arrivees);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE); // murs et cloison sont visibles des deux cotes
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const modele = matriceIdentite();
  let parallaxeCibleX = 0;
  let parallaxeCibleY = 0;
  let parallaxeX = 0;
  let parallaxeY = 0;
  let identifiantAnimation = null;
  let dernierHorodatageMs = null;
  let tempsEcouleSecondes = 0;
  let vivant = true;

  function redimensionner() {
    const densite = Math.min(window.devicePixelRatio || 1, PLAFOND_DENSITE_PIXELS);
    const largeur = Math.max(1, Math.round(canvas.clientWidth * densite));
    const hauteur = Math.max(1, Math.round(canvas.clientHeight * densite));
    if (canvas.width !== largeur || canvas.height !== hauteur) {
      canvas.width = largeur;
      canvas.height = hauteur;
    }
  }

  function dessinerLignes(projectionVue, tampon, nombreSommets, couleur, opacite) {
    if (opacite <= 0.004) return;
    gl.useProgram(programmeLigne.programme);
    gl.uniformMatrix4fv(programmeLigne.uniformes.uProjectionVue, false, projectionVue);
    gl.uniformMatrix4fv(programmeLigne.uniformes.uModele, false, modele);
    gl.uniform3fv(programmeLigne.uniformes.uCouleur, couleur);
    gl.uniform1f(programmeLigne.uniformes.uOpacite, opacite);
    lierAttribut(gl, tampon, programmeLigne.attributs.aPosition, 3);
    gl.drawArrays(gl.LINES, 0, nombreSommets);
  }

  function dessiner(etat, tempsSecondes) {
    redimensionner();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const rapport = canvas.width / canvas.height;
    const azimut = tempsSecondes * VITESSE_ORBITE + parallaxeX * 0.38;
    const elevation = 0.34 + parallaxeY * 0.14;
    const projection = matricePerspective(CHAMP_DE_VISION, rapport, 0.1, 60);
    const orbite = matriceVueOrbite(calculerRayonCamera(rapport), azimut, elevation, DIMENSIONS.centreY);
    const decalage = calculerDecalageCamera(rapport);
    // Le decalage s'applique dans le repere camera, donc apres l'orbite.
    const vue = multiplierMatrices(matriceTranslation(decalage[0], decalage[1], 0), orbite);
    const projectionVue = multiplierMatrices(projection, vue);

    // La lumiere suit partiellement la camera : sans cela, la moitie de
    // l'orbite presenterait une facade a contre-jour.
    const angleLumiere = azimut * 0.6 + 0.95;
    const lumiere = normaliser([
      Math.sin(angleLumiere) * 0.55,
      0.78,
      Math.cos(angleLumiere) * 0.55,
    ]);

    dessinerLignes(
      projectionVue,
      tamponGrille,
      nombreSommetsGrille,
      COULEUR_GRILLE,
      etat.opaciteGrille * etat.opaciteScene * 0.30,
    );

    // Les faces sont legerement reculees pour que les aretes se posent
    // dessus sans z-fighting.
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1, 1);
    gl.useProgram(programmeSolide.programme);
    gl.uniformMatrix4fv(programmeSolide.uniformes.uProjectionVue, false, projectionVue);
    gl.uniformMatrix4fv(programmeSolide.uniformes.uModele, false, modele);
    gl.uniform3fv(programmeSolide.uniformes.uDirectionLumiere, new Float32Array(lumiere));
    gl.uniform3fv(programmeSolide.uniformes.uCouleurChaude, new Float32Array(COULEUR_FENETRE_ALLUMEE));

    for (const piece of piecesGpu) {
      const emergence = etat.emergences[piece.ordre] || 0;
      if (emergence <= 0.002) continue;

      const estVitrage = piece.nom === 'vitres';
      const opacite = etat.opaciteScene * Math.min(1, emergence * 2.2);
      gl.uniform1f(programmeSolide.uniformes.uEmergence, emergence);
      gl.uniform1f(programmeSolide.uniformes.uHauteurEmergence, piece.hauteurEmergence);
      gl.uniform1f(programmeSolide.uniformes.uOpacite, opacite);
      gl.uniform3fv(programmeSolide.uniformes.uCouleur, new Float32Array(piece.couleur));
      gl.uniform1f(programmeSolide.uniformes.uMelangeChaud, estVitrage ? etat.lumiereFenetres : 0);
      gl.uniform1f(programmeSolide.uniformes.uEmissivite, estVitrage ? etat.lumiereFenetres * 0.85 : 0);

      lierAttribut(gl, piece.tamponPositions, programmeSolide.attributs.aPosition, 3);
      lierAttribut(gl, piece.tamponNormales, programmeSolide.attributs.aNormale, 3);
      gl.drawArrays(gl.TRIANGLES, 0, piece.nombreSommets);
    }
    gl.disable(gl.POLYGON_OFFSET_FILL);

    const opaciteAretes = etat.opaciteAretes * etat.opaciteScene;
    for (const piece of piecesGpu) {
      dessinerLignes(
        projectionVue,
        piece.tamponAretes,
        piece.nombreSommetsAretes,
        COULEUR_ARETE,
        opaciteAretes * 0.92,
      );
    }

    const opaciteParticules = etat.opaciteParticules * etat.opaciteScene;
    if (opaciteParticules > 0.004) {
      gl.useProgram(programmePoint.programme);
      gl.uniformMatrix4fv(programmePoint.uniformes.uProjectionVue, false, projectionVue);
      gl.uniformMatrix4fv(programmePoint.uniformes.uModele, false, modele);
      gl.uniform1f(programmePoint.uniformes.uConvergence, etat.convergence);
      gl.uniform1f(
        programmePoint.uniformes.uTaillePoint,
        Math.max(2, Math.min(5, canvas.height * 0.006)),
      );
      gl.uniform3fv(programmePoint.uniformes.uCouleur, new Float32Array(COULEUR_PARTICULE));
      gl.uniform1f(programmePoint.uniformes.uOpacite, opaciteParticules * 0.85);
      lierAttribut(gl, tamponDepart, programmePoint.attributs.aDepart, 3);
      lierAttribut(gl, tamponArrivee, programmePoint.attributs.aCible, 3);
      gl.drawArrays(gl.POINTS, 0, essaim.nombre);
    }
  }

  function image(horodatageMs) {
    if (!vivant) return;
    if (dernierHorodatageMs === null) dernierHorodatageMs = horodatageMs;
    // L'écart est borné : après une pause (onglet en arrière-plan, hero sorti
    // du viewport), la scène doit reprendre où elle en était, pas sauter.
    const ecart = Math.min((horodatageMs - dernierHorodatageMs) / 1000, 0.1);
    dernierHorodatageMs = horodatageMs;
    tempsEcouleSecondes += ecart;

    parallaxeX += (parallaxeCibleX - parallaxeX) * 0.06;
    parallaxeY += (parallaxeCibleY - parallaxeY) * 0.06;

    dessiner(calculerEtatScene(tempsEcouleSecondes, nombreEtapes), tempsEcouleSecondes);
    identifiantAnimation = window.requestAnimationFrame(image);
  }

  function demarrer() {
    if (identifiantAnimation !== null || !vivant) return;
    // Reprise sans saut : le premier écart calculé sera nul.
    dernierHorodatageMs = null;
    identifiantAnimation = window.requestAnimationFrame(image);
  }

  /** Rend une image isolée à un instant donné de la boucle (debug et tests visuels). */
  function dessinerInstant(tempsSecondes) {
    redimensionner();
    dessiner(calculerEtatScene(tempsSecondes, nombreEtapes), tempsSecondes);
  }

  function arreter() {
    if (identifiantAnimation === null) return;
    window.cancelAnimationFrame(identifiantAnimation);
    identifiantAnimation = null;
  }

  /** Rend une seule image de la maison terminée (mode « animations réduites »). */
  function dessinerEtatFinal() {
    dessiner(etatImmobile(nombreEtapes), 6.2);
  }

  function viserParallaxe(x, y) {
    parallaxeCibleX = Math.max(-1, Math.min(1, x));
    parallaxeCibleY = Math.max(-1, Math.min(1, y));
  }

  function detruire() {
    arreter();
    vivant = false;
  }

  if (reglages.animer === false) {
    redimensionner();
    dessinerEtatFinal();
  }

  return {
    demarrer,
    arreter,
    detruire,
    dessinerEtatFinal,
    dessinerInstant,
    viserParallaxe,
    redimensionner,
    nombreEtapes,
    nombreTriangles: pieces.reduce((somme, piece) => somme + piece.nombreTriangles, 0),
  };
}
