/**
 * Header collant qui se condense au défilement.
 *
 * L'hystérésis évite le clignotement : une fois condensé, le header ne se
 * redéploie qu'en repassant nettement au-dessus du seuil, sinon un scroll
 * qui oscille autour de la limite ferait vibrer la barre.
 */

const SEUIL_PX = 64;
const HYSTERESIS_PX = 24;

/**
 * Le header doit-il être condensé, sachant son état précédent ?
 * Fonction pure : c'est elle qui porte toute la logique d'hystérésis.
 */
export function calculerEtatHeader(defilement, etaitCondense, seuil = SEUIL_PX, hysteresis = HYSTERESIS_PX) {
  if (!Number.isFinite(defilement)) return etaitCondense;
  if (etaitCondense) return defilement > Math.max(0, seuil - hysteresis);
  return defilement > seuil;
}

export function initHeaderCondense() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  let condense = false;
  let enAttente = false;

  const appliquer = () => {
    enAttente = false;
    const prochain = calculerEtatHeader(window.scrollY, condense);
    if (prochain === condense) return;
    condense = prochain;
    header.classList.toggle('header--condense', condense);
  };

  window.addEventListener('scroll', () => {
    if (enAttente) return;
    enAttente = true;
    window.requestAnimationFrame(appliquer);
  }, { passive: true });

  appliquer();
}
