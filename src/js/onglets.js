export function calculerOngletActif(boutons, cible) {
  const index = boutons.findIndex((bouton) => bouton.dataset.ongletBouton === cible);
  return index === -1 ? 0 : index;
}

const TOUCHES_NAVIGATION = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];

export function initOnglets() {
  const conteneurs = document.querySelectorAll('[data-onglets]');
  conteneurs.forEach((conteneur) => {
    const boutons = Array.from(conteneur.querySelectorAll('[data-onglet-bouton]'));
    const panneaux = Array.from(conteneur.querySelectorAll('[data-onglet-panneau]'));
    if (boutons.length === 0) return;

    function activer(cible, deplacerFocus = false) {
      const index = calculerOngletActif(boutons, cible);
      boutons.forEach((bouton, i) => {
        const actif = i === index;
        bouton.setAttribute('aria-selected', String(actif));
        bouton.setAttribute('tabindex', actif ? '0' : '-1');
      });
      panneaux.forEach((panneau) => {
        panneau.hidden = panneau.dataset.ongletPanneau !== boutons[index].dataset.ongletBouton;
      });
      if (deplacerFocus) boutons[index].focus();
    }

    boutons.forEach((bouton, i) => {
      bouton.addEventListener('click', () => activer(bouton.dataset.ongletBouton));

      bouton.addEventListener('keydown', (evenement) => {
        if (!TOUCHES_NAVIGATION.includes(evenement.key)) return;
        evenement.preventDefault();
        let cibleIndex = i;
        if (evenement.key === 'ArrowRight') cibleIndex = (i + 1) % boutons.length;
        else if (evenement.key === 'ArrowLeft') cibleIndex = (i - 1 + boutons.length) % boutons.length;
        else if (evenement.key === 'Home') cibleIndex = 0;
        else if (evenement.key === 'End') cibleIndex = boutons.length - 1;
        activer(boutons[cibleIndex].dataset.ongletBouton, true);
      });
    });

    activer(boutons[0].dataset.ongletBouton);
  });
}
