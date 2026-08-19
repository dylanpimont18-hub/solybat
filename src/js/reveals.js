/**
 * Apparition des blocs à l'entrée dans le viewport.
 *
 * Principe de dégradation : le CSS ne masque les éléments que si la classe
 * `reveals-actifs` est présente sur <html>, et c'est ce module qui la pose.
 * Si le JS ne s'exécute pas, tout le contenu reste visible.
 *
 * L'apparition est jouée une seule fois : pas d'aller-retour au scroll inverse,
 * qui donne vite le tournis sur une page longue.
 */

const CLASSE_ACTIVE = 'reveals-actifs';
const CLASSE_VISIBLE = 'est-visible';
const PAS_DECALAGE_MS = 70;
const PLAFOND_DECALAGE_MS = 350;

/**
 * Décalage d'apparition d'un élément selon son rang dans son groupe.
 * Plafonné : au-delà, le dernier élément d'une longue grille attendrait
 * plusieurs secondes après le premier.
 */
export function calculerDecalage(rang, pas = PAS_DECALAGE_MS, plafond = PLAFOND_DECALAGE_MS) {
  if (!Number.isFinite(rang) || rang <= 0) return 0;
  return Math.min(rang * pas, plafond);
}

/** Rang de chaque élément parmi ses frères porteurs de `data-reveal`. */
export function calculerRangsParGroupe(elements) {
  const compteurs = new Map();
  return elements.map((element) => {
    const parent = element.parentElement;
    const rang = compteurs.get(parent) || 0;
    compteurs.set(parent, rang + 1);
    return rang;
  });
}

export function initReveals() {
  const elements = Array.from(document.querySelectorAll('[data-reveal]'));
  if (elements.length === 0) return;

  const animationsReduites = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (animationsReduites || typeof window.IntersectionObserver !== 'function') return;

  document.documentElement.classList.add(CLASSE_ACTIVE);

  const rangs = calculerRangsParGroupe(elements);
  elements.forEach((element, index) => {
    element.style.setProperty('--decalage-reveal', `${calculerDecalage(rangs[index])}ms`);
  });

  const observateur = new IntersectionObserver((entrees) => {
    for (const entree of entrees) {
      if (!entree.isIntersecting) continue;
      entree.target.classList.add(CLASSE_VISIBLE);
      observateur.unobserve(entree.target);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  for (const element of elements) observateur.observe(element);
}
