const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validerFormulaire(donnees) {
  const erreurs = {};

  if (!donnees.profil) {
    erreurs.profil = 'Sélectionnez un profil.';
  }
  if (!donnees.nom || donnees.nom.trim() === '') {
    erreurs.nom = 'Le nom est requis.';
  }
  if (!donnees.email || !REGEX_EMAIL.test(donnees.email)) {
    erreurs.email = 'Adresse email invalide.';
  }
  if (!donnees.message || donnees.message.trim() === '') {
    erreurs.message = 'Le message est requis.';
  }

  return { valide: Object.keys(erreurs).length === 0, erreurs };
}

export function initFormDevis() {
  const formulaire = document.querySelector('[data-formulaire-devis]');
  if (!formulaire) return;

  const boutonsProfil = Array.from(formulaire.querySelectorAll('[data-profil-bouton]'));
  const blocsProfil = Array.from(formulaire.querySelectorAll('[data-profil-bloc]'));
  const champProfil = formulaire.querySelector('[data-profil-input]');
  const zoneErreurs = formulaire.querySelector('[data-formulaire-erreurs]');

  function selectionnerProfil(profil) {
    champProfil.value = profil;
    blocsProfil.forEach((bloc) => {
      bloc.hidden = bloc.dataset.profilBloc !== profil;
    });
    boutonsProfil.forEach((bouton) => {
      bouton.setAttribute('aria-pressed', String(bouton.dataset.profilBouton === profil));
    });
  }

  boutonsProfil.forEach((bouton) => {
    bouton.addEventListener('click', () => selectionnerProfil(bouton.dataset.profilBouton));
  });

  formulaire.addEventListener('submit', (evenement) => {
    const donnees = Object.fromEntries(new FormData(formulaire));
    const resultat = validerFormulaire(donnees);
    if (!resultat.valide) {
      evenement.preventDefault();
      zoneErreurs.hidden = false;
      zoneErreurs.textContent = Object.values(resultat.erreurs).join(' ');
    }
  });

  const parametres = new URLSearchParams(window.location.search);
  if (parametres.get('erreur') === '1') {
    const profil = parametres.get('profil');
    if (profil) selectionnerProfil(profil);
    ['nom', 'email', 'telephone', 'message'].forEach((champ) => {
      const valeur = parametres.get(champ);
      const element = formulaire.querySelector(`#devis-${champ}`);
      if (valeur && element) element.value = valeur;
    });
    zoneErreurs.hidden = false;
    zoneErreurs.textContent = 'Certains champs sont invalides ou manquants. Merci de vérifier votre saisie.';
  }
}
