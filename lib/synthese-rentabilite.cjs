/**
 * Agrégats des opérations chiffrées, calculés au build.
 *
 * Pourquoi ne pas écrire « 8/8 » en dur dans le gabarit : à la première
 * opération ajoutée ou retirée dans `retoursClients.json`, le chiffre affiché
 * deviendrait faux sans que personne s'en aperçoive. Ici il suit la donnée.
 *
 * Module CommonJS : consommé par `eleventy.config.cjs`, qui doit rester en CJS.
 */

const ESPACES = /[\s  ]/g;

/**
 * Extrait le nombre d'un libellé français.
 * « 16,08 % » → 16.08 ; « 42 500 € » → 42500 ; « 1,38 » → 1.38.
 * Retourne null si aucun nombre n'est lisible, plutôt que NaN — un NaN se
 * propagerait silencieusement dans toutes les moyennes.
 */
function lireNombre(valeur) {
  if (typeof valeur === 'number') return Number.isFinite(valeur) ? valeur : null;
  if (typeof valeur !== 'string') return null;
  const correspondance = valeur.match(/-?\d(?:[\s  ]?\d)*(?:[.,]\d+)?/);
  if (!correspondance) return null;
  const nombre = Number.parseFloat(correspondance[0].replace(ESPACES, '').replace(',', '.'));
  return Number.isFinite(nombre) ? nombre : null;
}

function moyenne(valeurs) {
  if (valeurs.length === 0) return null;
  return valeurs.reduce((somme, v) => somme + v, 0) / valeurs.length;
}

/** « 12,1 % » — une décimale, séparateur français. */
function formaterPourcentage(valeur, decimales = 1) {
  if (valeur === null) return null;
  return `${valeur.toFixed(decimales).replace('.', ',')} %`;
}

/** « 410 200 € » — séparateur de milliers insécable, comme le reste du site. */
function formaterEuros(valeur) {
  if (valeur === null) return null;
  return `${Math.round(valeur).toLocaleString('fr-FR')} €`;
}

/**
 * Synthèse chiffrée d'une liste d'opérations.
 *
 * Les libellés retournés sont directement affichables ; ils restent lisibles
 * par `analyserValeur()` de `compteurs.js`, qui anime les chiffres à l'écran.
 */
function calculerSynthese(operations) {
  const liste = Array.isArray(operations) ? operations : [];

  const rentabilites = liste.map((o) => lireNombre(o.rentabiliteBrute)).filter((v) => v !== null);
  const cashFlows = liste.map((o) => lireNombre(o.cashFlow)).filter((v) => v !== null);
  const dscrs = liste.map((o) => lireNombre(o.dscr)).filter((v) => v !== null);
  const travaux = liste.map((o) => lireNombre(o.travaux)).filter((v) => v !== null);
  const couts = liste.map((o) => lireNombre(o.coutTotal)).filter((v) => v !== null);

  const rentabiliteMoyenne = moyenne(rentabilites);
  const cashFlowMoyen = moyenne(cashFlows);

  return {
    nombreOperations: liste.length,
    cashFlowPositif: cashFlows.filter((v) => v > 0).length,
    dscrSuperieurA1: dscrs.filter((v) => v > 1).length,

    rentabiliteMoyenne,
    rentabiliteMin: rentabilites.length ? Math.min(...rentabilites) : null,
    rentabiliteMax: rentabilites.length ? Math.max(...rentabilites) : null,

    cashFlowMoyen,
    cashFlowMin: cashFlows.length ? Math.min(...cashFlows) : null,
    cashFlowMax: cashFlows.length ? Math.max(...cashFlows) : null,

    travauxCumules: travaux.length ? travaux.reduce((s, v) => s + v, 0) : null,
    coutTotalCumule: couts.length ? couts.reduce((s, v) => s + v, 0) : null,

    // Libellés prêts à afficher.
    libelles: {
      cashFlowPositif: `${cashFlows.filter((v) => v > 0).length}/${liste.length}`,
      rentabiliteMoyenne: formaterPourcentage(rentabiliteMoyenne),
      cashFlowMoyen: cashFlowMoyen === null ? null : `${Math.round(cashFlowMoyen)} €`,
      travauxCumules: formaterEuros(travaux.length ? travaux.reduce((s, v) => s + v, 0) : null),
      fourchetteRentabilite: rentabilites.length
        ? `${formaterPourcentage(Math.min(...rentabilites), 2)} à ${formaterPourcentage(Math.max(...rentabilites), 2)}`
        : null,
    },
  };
}

/**
 * Les `n` opérations les plus rentables, pour l'aperçu de l'accueil.
 * Tri stable : à rentabilité égale, l'ordre du fichier de données est conservé.
 */
function meilleuresOperations(operations, n = 3) {
  const liste = Array.isArray(operations) ? operations : [];
  return liste
    .map((operation, rang) => ({ operation, rang, valeur: lireNombre(operation.rentabiliteBrute) }))
    .filter((entree) => entree.valeur !== null)
    .sort((a, b) => (b.valeur - a.valeur) || (a.rang - b.rang))
    .slice(0, n)
    .map((entree) => entree.operation);
}

module.exports = {
  lireNombre,
  moyenne,
  formaterPourcentage,
  formaterEuros,
  calculerSynthese,
  meilleuresOperations,
};
