/**
 * Léger basculement 3D des cartes au survol.
 *
 * Réservé aux pointeurs fins (souris/trackpad) : sur écran tactile, l'effet
 * ne se déclencherait qu'au moment du tap, ce qui parasiterait la navigation.
 */

const AMPLITUDE_DEGRES = 5.5;

/**
 * Inclinaison à appliquer selon la position du pointeur dans la carte.
 *
 * Retourne aussi la position relative du pointeur en pourcentages, utilisée
 * par le CSS pour déplacer le reflet dans le sens de l'inclinaison.
 * Les coordonnées hors cadre sont bornées : un pointeur qui sort en diagonale
 * ne doit pas produire une inclinaison démesurée.
 */
export function calculerInclinaison(clientX, clientY, cadre, amplitude = AMPLITUDE_DEGRES) {
  if (!cadre || !cadre.width || !cadre.height) {
    return { rotationX: 0, rotationY: 0, pourcentageX: 50, pourcentageY: 50 };
  }

  const borner = (valeur) => Math.max(-1, Math.min(1, valeur));
  const relatifX = borner(((clientX - cadre.left) / cadre.width) * 2 - 1);
  const relatifY = borner(((clientY - cadre.top) / cadre.height) * 2 - 1);

  return {
    // Le pointeur en haut doit incliner la carte vers l'arrière, d'où le signe.
    rotationX: -relatifY * amplitude,
    rotationY: relatifX * amplitude,
    pourcentageX: (relatifX + 1) * 50,
    pourcentageY: (relatifY + 1) * 50,
  };
}

function appliquer(carte, inclinaison) {
  carte.style.setProperty('--tilt-x', `${inclinaison.rotationX.toFixed(2)}deg`);
  carte.style.setProperty('--tilt-y', `${inclinaison.rotationY.toFixed(2)}deg`);
  carte.style.setProperty('--reflet-x', `${inclinaison.pourcentageX.toFixed(1)}%`);
  carte.style.setProperty('--reflet-y', `${inclinaison.pourcentageY.toFixed(1)}%`);
}

function reinitialiser(carte) {
  carte.style.setProperty('--tilt-x', '0deg');
  carte.style.setProperty('--tilt-y', '0deg');
  carte.style.setProperty('--reflet-x', '50%');
  carte.style.setProperty('--reflet-y', '50%');
}

export function initTiltCartes() {
  const cartes = document.querySelectorAll('[data-tilt]');
  if (cartes.length === 0) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.documentElement.classList.add('tilt-actif');

  for (const carte of cartes) {
    let enAttente = false;

    carte.addEventListener('pointermove', (evenement) => {
      if (enAttente) return;
      enAttente = true;
      // Une seule mise a jour par image : le pointeur emet bien plus souvent.
      window.requestAnimationFrame(() => {
        enAttente = false;
        appliquer(carte, calculerInclinaison(
          evenement.clientX,
          evenement.clientY,
          carte.getBoundingClientRect(),
        ));
      });
    });

    carte.addEventListener('pointerleave', () => reinitialiser(carte));
    carte.addEventListener('blur', () => reinitialiser(carte), true);
  }
}
