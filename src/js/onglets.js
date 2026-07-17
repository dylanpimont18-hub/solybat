export function calculerOngletActif(boutons, cible) {
  const index = boutons.findIndex((bouton) => bouton.dataset.ongletBouton === cible);
  return index === -1 ? 0 : index;
}

export function initOnglets() {
  const conteneurs = document.querySelectorAll('[data-onglets]');
  conteneurs.forEach((conteneur) => {
    const boutons = Array.from(conteneur.querySelectorAll('[data-onglet-bouton]'));
    const panneaux = Array.from(conteneur.querySelectorAll('[data-onglet-panneau]'));
    if (boutons.length === 0) return;

    function activer(cible) {
      const index = calculerOngletActif(boutons, cible);
      boutons.forEach((bouton, i) => bouton.setAttribute('aria-selected', String(i === index)));
      panneaux.forEach((panneau) => {
        panneau.hidden = panneau.dataset.ongletPanneau !== boutons[index].dataset.ongletBouton;
      });
    }

    boutons.forEach((bouton) => {
      bouton.addEventListener('click', () => activer(bouton.dataset.ongletBouton));
    });

    activer(boutons[0].dataset.ongletBouton);
  });
}
