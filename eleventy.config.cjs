const fs = require("node:fs");
const path = require("node:path");
const { assembler } = require("./lib/assembler-css.cjs");
const { lireDimensions } = require("./lib/dimensions-image.cjs");
const { calculerSynthese, meilleuresOperations } = require("./lib/synthese-rentabilite.cjs");

const DOSSIER_CSS = path.join(__dirname, "src", "css");
const DOSSIER_SORTIE_CSS = path.join(__dirname, "_site", "css");
const DOSSIER_JS = path.join(__dirname, "src", "js");

/** Cache des dimensions : chaque image n'est lue qu'une fois par build. */
const cacheDimensions = new Map();

function dimensionsImage(cheminSite) {
  if (!cheminSite) return null;
  if (cacheDimensions.has(cheminSite)) return cacheDimensions.get(cheminSite);

  const relatif = String(cheminSite).replace(/^\//, "");
  const fichier = path.join(__dirname, "src", relatif);
  let resultat = null;
  try {
    resultat = lireDimensions(fs.readFileSync(fichier));
  } catch (erreur) {
    resultat = null; // image absente : on n'écrit simplement pas d'attributs
  }
  cacheDimensions.set(cheminSite, resultat);
  return resultat;
}

/** Liste des modules JS à précharger (tous sauf le point d'entrée). */
function listerModulesJs(dossier = DOSSIER_JS, prefixe = "/js") {
  const modules = [];
  for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
    const chemin = `${prefixe}/${entree.name}`;
    if (entree.isDirectory()) {
      modules.push(...listerModulesJs(path.join(dossier, entree.name), chemin));
    } else if (entree.name.endsWith(".js") && chemin !== "/js/main.js") {
      modules.push(chemin);
    }
  }
  return modules.sort();
}

/**
 * Assemble les feuilles de style en un seul fichier servi.
 *
 * Sans cela, `styles.css` chaîne 21 `@import` que le navigateur charge en
 * série, tous bloquants pour le rendu. On garde un fichier par composant côté
 * source, on n'en sert qu'un.
 */
function assemblerFeuillesDeStyle() {
  const racine = path.join(DOSSIER_CSS, "styles.css");
  if (!fs.existsSync(racine)) return;

  const lire = (nom) => {
    const fichier = path.join(DOSSIER_CSS, nom);
    return fs.existsSync(fichier) ? fs.readFileSync(fichier, "utf8") : null;
  };

  const assemble = assembler(fs.readFileSync(racine, "utf8"), lire);
  fs.mkdirSync(DOSSIER_SORTIE_CSS, { recursive: true });
  fs.writeFileSync(path.join(DOSSIER_SORTIE_CSS, "styles.css"), assemble, "utf8");

  // Les feuilles individuelles ont été recopiées par le passthrough mais ne
  // sont plus référencées : les retirer évite de les téléverser en FTP et
  // d'exposer une seconde copie du CSS.
  for (const fichier of fs.readdirSync(DOSSIER_SORTIE_CSS)) {
    if (fichier.endsWith(".css") && fichier !== "styles.css") {
      fs.unlinkSync(path.join(DOSSIER_SORTIE_CSS, fichier));
    }
  }

  const ko = (Buffer.byteLength(assemble, "utf8") / 1024).toFixed(1);
  console.log(`[css] 1 feuille assemblée (${ko} Ko) au lieu de 21 imports chaînés`);
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/documents": "documents" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/manifest.json": "manifest.json" });
  eleventyConfig.addPassthroughCopy({ "src/.htaccess": ".htaccess" });
  eleventyConfig.addPassthroughCopy({ "traiter-devis.php": "traiter-devis.php" });
  eleventyConfig.addPassthroughCopy({ "devis-validation.php": "devis-validation.php" });

  // Dimensions natives d'une image, pour réserver sa place avant chargement.
  eleventyConfig.addFilter("dimensionsImage", dimensionsImage);

  eleventyConfig.addGlobalData("modulesJs", () => listerModulesJs());

  // Agregats des operations chiffrees, recalcules a chaque build : un « 8/8 »
  // ecrit en dur deviendrait faux des la premiere operation ajoutee.
  eleventyConfig.addGlobalData("syntheseRentabilite", () => {
    const fichier = path.join(__dirname, "src", "_data", "retoursClients.json");
    const operations = JSON.parse(fs.readFileSync(fichier, "utf8"));
    return Object.assign(calculerSynthese(operations), {
      meilleures: meilleuresOperations(operations, 3),
    });
  });

  eleventyConfig.on("eleventy.after", assemblerFeuillesDeStyle);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    // Racine "/" en production (FTP, domaine dédié). Surchargée par la variable
    // d'environnement PATH_PREFIX pour un déploiement sous-dossier (ex. GitHub Pages
    // project site : /nom-du-depot/) — voir .github/workflows/deploy-pages.yml.
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
};
