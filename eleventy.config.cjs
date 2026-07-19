module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/manifest.json": "manifest.json" });
  eleventyConfig.addPassthroughCopy({ "src/.htaccess": ".htaccess" });
  eleventyConfig.addPassthroughCopy({ "traiter-devis.php": "traiter-devis.php" });
  eleventyConfig.addPassthroughCopy({ "devis-validation.php": "devis-validation.php" });

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
