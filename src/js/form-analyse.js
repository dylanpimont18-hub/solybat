/* Formulaire de demande d'analyse de rentabilité (/analyse-rentabilite/).
   Module distinct de form-devis.js : les deux formulaires n'exigent pas les
   mêmes champs, et mélanger les deux jeux de règles dans une seule fonction
   rendrait chacune plus difficile à vérifier.

   La validation ci-dessous double celle de devis-validation.php côté serveur,
   qui reste la seule qui fasse foi : sans JS, le formulaire poste nativement
   et le PHP renvoie sur la page avec les valeurs en paramètres d'URL. */

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CHAMPS_REQUIS = [
  ['nom', 'Le nom est requis.'],
  ['ville', 'La ville ou le secteur du bien est requis.'],
  ['bien', 'Le type et la surface du bien sont requis.'],
  ['prix_achat', "Le prix d'achat envisagé est requis."],
];

const CHAMPS_RAPPELES = ['nom', 'email', 'telephone', 'ville', 'bien', 'prix_achat', 'travaux', 'loyer', 'message'];

export function validerAnalyse(donnees) {
  const erreurs = {};

  CHAMPS_REQUIS.forEach(([champ, message]) => {
    const valeur = donnees[champ];
    if (!valeur || valeur.trim() === '') {
      erreurs[champ] = message;
    }
  });

  if (!donnees.email || !REGEX_EMAIL.test(donnees.email)) {
    erreurs.email = 'Adresse email invalide.';
  }

  return { valide: Object.keys(erreurs).length === 0, erreurs };
}

export function initFormAnalyse() {
  const formulaire = document.querySelector('[data-formulaire-analyse]');
  if (!formulaire) return;

  const zoneErreurs = formulaire.querySelector('[data-formulaire-erreurs]');

  formulaire.addEventListener('submit', (evenement) => {
    const donnees = Object.fromEntries(new FormData(formulaire));
    const resultat = validerAnalyse(donnees);
    if (!resultat.valide) {
      evenement.preventDefault();
      zoneErreurs.hidden = false;
      zoneErreurs.textContent = Object.values(resultat.erreurs).join(' ');
    }
  });

  /* Retour d'une validation serveur échouée : la page étant statique, les
     valeurs saisies reviennent en paramètres d'URL, on les réaffiche. */
  const parametres = new URLSearchParams(window.location.search);

  /* L'envoi du mail a echoue cote serveur : on le dit, plutot que de laisser
     croire a un succes, et on donne l'adresse de repli. */
  if (parametres.get('erreur') === 'envoi') {
    zoneErreurs.hidden = false;
    zoneErreurs.textContent =
      "L'envoi a échoué. Merci de nous écrire directement à contact@solybat18.fr, nous vous répondrons aussi vite.";
    return;
  }

  if (parametres.get('erreur') !== '1') return;

  CHAMPS_RAPPELES.forEach((champ) => {
    const valeur = parametres.get(champ);
    const element = formulaire.querySelector(`#analyse-${champ}`);
    if (valeur && element) element.value = valeur;
  });

  zoneErreurs.hidden = false;
  zoneErreurs.textContent = 'Certains champs sont invalides ou manquants. Merci de vérifier votre saisie.';
}
