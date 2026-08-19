/**
 * Compteurs animés : les chiffres clés montent quand ils entrent à l'écran.
 *
 * Le HTML porte toujours la valeur finale en texte : si le JS ne tourne pas,
 * ou si l'utilisateur refuse les animations, le chiffre est simplement là.
 */

const DUREE_MS = 1100;

/** Espaces pouvant servir de séparateur de milliers, y compris insécables. */
const ESPACES = '[\\s\\u00a0\\u202f]';

/** Décélération (easeOutCubic) : la valeur ralentit en approchant de la cible. */
export function adoucirSortie(t) {
  const x = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - x, 3);
}

/** Valeur intermédiaire entre `depart` et `arrivee` pour une progression 0..1. */
export function calculerValeurAffichee(depart, arrivee, progression) {
  return depart + (arrivee - depart) * adoucirSortie(progression);
}

/**
 * Lit la valeur numérique d'un libellé français et retient son habillage.
 * « 8,4 % » donne 8.4, un séparateur décimal virgule, le préfixe vide et le
 * suffixe « % » — de quoi reconstruire le texte à l'identique en fin de course.
 */
export function analyserValeur(texte) {
  // Chaque espace interne doit être suivi d'un chiffre : sans cette contrainte,
  // « 42 500 € » avalerait aussi l'espace précédant l'unité, et l'aller-retour
  // rendrait « 42 500€ ».
  const motif = new RegExp('-?\\d(?:' + ESPACES + '?\\d)*(?:[.,]\\d+)?');
  const correspondance = String(texte).match(motif);
  if (!correspondance) return null;

  const brut = correspondance[0];
  const normalise = brut.replace(new RegExp(ESPACES, 'g'), '').replace(',', '.');
  const nombre = Number.parseFloat(normalise);
  if (!Number.isFinite(nombre)) return null;

  const partieDecimale = normalise.split('.')[1];
  return {
    valeur: nombre,
    decimales: partieDecimale ? partieDecimale.length : 0,
    separateur: brut.includes(',') ? ',' : '.',
    espaceMillier: new RegExp(ESPACES).test(brut),
    separateurMillier: (brut.match(new RegExp(ESPACES)) || [' '])[0],
    prefixe: texte.slice(0, correspondance.index),
    suffixe: texte.slice(correspondance.index + brut.length),
  };
}

/** Reconstruit le libellé à partir d'une valeur et de l'habillage relevé. */
export function formaterValeur(valeur, format) {
  const arrondie = valeur.toFixed(format.decimales);
  const [entiere, decimale] = arrondie.split('.');
  const entiereFormatee = format.espaceMillier
    ? entiere.replace(/\B(?=(\d{3})+(?!\d))/g, format.separateurMillier || ' ')
    : entiere;
  const nombre = decimale ? entiereFormatee + format.separateur + decimale : entiereFormatee;
  return format.prefixe + nombre + format.suffixe;
}

export function initCompteurs() {
  const elements = Array.from(document.querySelectorAll('[data-compteur]'));
  if (elements.length === 0) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof window.IntersectionObserver !== 'function') return;

  const animer = (element) => {
    const format = analyserValeur(element.textContent.trim());
    if (!format) return;

    const debut = performance.now();
    const image = (maintenant) => {
      const progression = Math.min(1, (maintenant - debut) / DUREE_MS);
      element.textContent = formaterValeur(
        calculerValeurAffichee(0, format.valeur, progression),
        format,
      );
      if (progression < 1) window.requestAnimationFrame(image);
    };
    window.requestAnimationFrame(image);
  };

  const observateur = new IntersectionObserver((entrees) => {
    for (const entree of entrees) {
      if (!entree.isIntersecting) continue;
      observateur.unobserve(entree.target);
      animer(entree.target);
    }
  }, { threshold: 0.5 });

  for (const element of elements) observateur.observe(element);
}
