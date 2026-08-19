/**
 * Assemblage des feuilles de style en un seul fichier, au moment du build.
 *
 * Pourquoi : `styles.css` chaînait 21 `@import`, que le navigateur charge en
 * série et qui bloquent tous le rendu (26 requêtes CSS mesurées sur l'accueil).
 * On garde un fichier par composant côté source — la convention du projet — et
 * on n'en sert qu'un seul.
 *
 * Module CommonJS : `eleventy.config.cjs` doit rester en CJS (voir CLAUDE.md).
 */

const MOTIF_IMPORT = /@import\s+url\(\s*(['"]?)([^'")]+)\1\s*\)\s*;/g;

/**
 * Remplace récursivement chaque `@import` par le contenu du fichier visé.
 *
 * `lireFichier(nom)` doit retourner le contenu, ou null si introuvable.
 * Un import déjà résolu est ignoré : une boucle entre deux feuilles ne peut
 * donc pas faire tourner l'assemblage à l'infini.
 */
function resoudreImports(contenu, lireFichier, dejaVus) {
  const vus = dejaVus || new Set();
  return contenu.replace(MOTIF_IMPORT, (correspondance, guillemet, nom) => {
    if (vus.has(nom)) return '';
    vus.add(nom);
    const inclus = lireFichier(nom);
    if (inclus === null || inclus === undefined) {
      // Import non résolu : on le laisse tel quel plutôt que de perdre la règle.
      return correspondance;
    }
    return `/* ${nom} */\n${resoudreImports(inclus, lireFichier, vus)}`;
  });
}

/**
 * Minification prudente : commentaires retirés, espaces réduits.
 *
 * On ne touche volontairement PAS aux espaces autour de `:` ni des
 * combinateurs — `a :hover` et `a:hover` ne désignent pas la même chose, et
 * une minification trop zélée casserait silencieusement des sélecteurs.
 * Le contenu des chaînes (notamment les `url("data:image/svg+xml,…")`) est
 * recopié à l'identique.
 */
function minifierCss(css) {
  let sortie = '';
  let i = 0;

  while (i < css.length) {
    const c = css[i];

    // Chaîne entre guillemets : recopiée telle quelle, échappements compris.
    if (c === '"' || c === "'") {
      const guillemet = c;
      sortie += c;
      i += 1;
      while (i < css.length) {
        if (css[i] === '\\') {
          sortie += css[i] + (css[i + 1] || '');
          i += 2;
          continue;
        }
        sortie += css[i];
        if (css[i] === guillemet) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }

    // Commentaire.
    if (c === '/' && css[i + 1] === '*') {
      const fin = css.indexOf('*/', i + 2);
      i = fin === -1 ? css.length : fin + 2;
      continue;
    }

    // Suite d'espaces : réduite à un seul.
    if (/\s/.test(c)) {
      let j = i;
      while (j < css.length && /\s/.test(css[j])) j += 1;
      const precedent = sortie[sortie.length - 1];
      const suivant = css[j];
      // Un espace collé à une accolade, un point-virgule ou une virgule
      // n'a aucun effet : on le supprime.
      if (!'{};,'.includes(precedent) && !'{};,'.includes(suivant) && suivant !== undefined) {
        sortie += ' ';
      }
      i = j;
      continue;
    }

    // Espace inutile juste avant une accolade / un séparateur.
    if ('{};,'.includes(c) && sortie.endsWith(' ')) {
      sortie = sortie.slice(0, -1);
    }

    // Dernier point-virgule d'un bloc.
    if (c === '}' && sortie.endsWith(';')) {
      sortie = sortie.slice(0, -1);
    }

    sortie += c;
    i += 1;
  }

  return sortie.trim();
}

/** Assemble et minifie en une passe. */
function assembler(contenuRacine, lireFichier) {
  return minifierCss(resoudreImports(contenuRacine, lireFichier));
}

module.exports = { resoudreImports, minifierCss, assembler };
