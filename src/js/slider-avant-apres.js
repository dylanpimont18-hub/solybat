export function calculerPositionPourcentage(clientX, rectLeft, rectWidth) {
  const position = ((clientX - rectLeft) / rectWidth) * 100;
  return Math.min(100, Math.max(0, position));
}

export function initSliderAvantApres() {
  const sliders = document.querySelectorAll('[data-slider-avant-apres]');
  sliders.forEach((slider) => {
    const curseur = slider.querySelector('[data-slider-curseur]');
    const calqueApres = slider.querySelector('[data-slider-apres]');
    if (!curseur || !calqueApres) return;

    function deplacer(clientX) {
      const rect = slider.getBoundingClientRect();
      const pourcentage = calculerPositionPourcentage(clientX, rect.left, rect.width);
      calqueApres.style.clipPath = `inset(0 0 0 ${pourcentage}%)`;
      curseur.style.left = `${pourcentage}%`;
    }

    curseur.addEventListener('pointerdown', (evenementDebut) => {
      curseur.setPointerCapture(evenementDebut.pointerId);

      function onMove(evenement) {
        deplacer(evenement.clientX);
      }
      function onUp() {
        curseur.removeEventListener('pointermove', onMove);
        curseur.removeEventListener('pointerup', onUp);
      }

      curseur.addEventListener('pointermove', onMove);
      curseur.addEventListener('pointerup', onUp);
    });
  });
}
