export function calculerPositionPourcentage(clientX, rectLeft, rectWidth) {
  const position = ((clientX - rectLeft) / rectWidth) * 100;
  return Math.min(100, Math.max(0, position));
}

const PAS_CLAVIER = 5;

export function initSliderAvantApres() {
  const sliders = document.querySelectorAll('[data-slider-avant-apres]');
  sliders.forEach((slider) => {
    const curseur = slider.querySelector('[data-slider-curseur]');
    const calqueApres = slider.querySelector('[data-slider-apres]');
    if (!curseur || !calqueApres) return;

    function positionner(pourcentage) {
      calqueApres.style.clipPath = `inset(0 0 0 ${pourcentage}%)`;
      curseur.style.left = `${pourcentage}%`;
      curseur.setAttribute('aria-valuenow', String(Math.round(pourcentage)));
    }

    function deplacer(clientX) {
      const rect = slider.getBoundingClientRect();
      positionner(calculerPositionPourcentage(clientX, rect.left, rect.width));
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

    curseur.addEventListener('keydown', (evenement) => {
      const actuel = Number(curseur.getAttribute('aria-valuenow')) || 50;
      if (evenement.key === 'ArrowLeft' || evenement.key === 'ArrowDown') {
        evenement.preventDefault();
        positionner(Math.max(0, actuel - PAS_CLAVIER));
      } else if (evenement.key === 'ArrowRight' || evenement.key === 'ArrowUp') {
        evenement.preventDefault();
        positionner(Math.min(100, actuel + PAS_CLAVIER));
      } else if (evenement.key === 'Home') {
        evenement.preventDefault();
        positionner(0);
      } else if (evenement.key === 'End') {
        evenement.preventDefault();
        positionner(100);
      }
    });
  });
}
