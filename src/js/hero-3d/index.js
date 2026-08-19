/**
 * Câblage DOM de la scène 3D du hero.
 *
 * Tout ce qui peut échouer bascule sur le repli photo plutôt que de laisser
 * un cadre vide : pas de WebGL, shaders refusés, contexte perdu.
 * La scène ne tourne que lorsqu'elle est réellement visible à l'écran.
 */

import { creerSceneHero } from './scene-hero.js';

/** Décale l'initialisation après le premier rendu, pour ne pas peser sur le LCP. */
function apresLePremierRendu(action) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(action, { timeout: 1200 });
  } else {
    window.setTimeout(action, 180);
  }
}

export function initHero3d() {
  const conteneur = document.querySelector('[data-hero-3d]');
  if (!conteneur) return null;

  const canvas = conteneur.querySelector('[data-hero-3d-canvas]');
  if (!canvas) return null;

  const requeteAnimationsReduites = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointeurFin = window.matchMedia('(hover: hover) and (pointer: fine)');

  let scene = null;

  const basculerSurRepli = () => {
    conteneur.classList.add('hero-3d--repli');
    conteneur.classList.remove('hero-3d--actif');
  };

  const demarrer = () => {
    const animer = !requeteAnimationsReduites.matches;
    scene = creerSceneHero(canvas, { animer });

    if (!scene) {
      basculerSurRepli();
      return;
    }

    conteneur.classList.add('hero-3d--actif');

    canvas.addEventListener('webglcontextlost', (evenement) => {
      evenement.preventDefault();
      if (scene) scene.detruire();
      scene = null;
      basculerSurRepli();
    });

    if (!animer) {
      window.addEventListener('resize', () => {
        if (!scene) return;
        scene.redimensionner();
        scene.dessinerEtatFinal();
      });
      return;
    }

    // La boucle ne tourne que si le hero est a l'ecran ET l'onglet au premier plan.
    let dansLeViewport = true;
    const rafraichirActivite = () => {
      if (!scene) return;
      if (dansLeViewport && !document.hidden) scene.demarrer();
      else scene.arreter();
    };

    if (typeof window.IntersectionObserver === 'function') {
      const observateur = new IntersectionObserver((entrees) => {
        dansLeViewport = entrees.some((entree) => entree.isIntersecting);
        rafraichirActivite();
      }, { threshold: 0 });
      observateur.observe(conteneur);
    }

    document.addEventListener('visibilitychange', rafraichirActivite);
    rafraichirActivite();

    if (pointeurFin.matches) {
      conteneur.addEventListener('pointermove', (evenement) => {
        if (!scene) return;
        const cadre = conteneur.getBoundingClientRect();
        if (!cadre.width || !cadre.height) return;
        scene.viserParallaxe(
          ((evenement.clientX - cadre.left) / cadre.width) * 2 - 1,
          ((evenement.clientY - cadre.top) / cadre.height) * 2 - 1,
        );
      });
      conteneur.addEventListener('pointerleave', () => {
        if (scene) scene.viserParallaxe(0, 0);
      });
    }
  };

  apresLePremierRendu(demarrer);
  return conteneur;
}
