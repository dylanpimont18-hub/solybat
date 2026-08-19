/**
 * Lecture des dimensions d'une image directement dans son en-tête binaire.
 *
 * Pourquoi sans dépendance : le projet n'a volontairement aucune bibliothèque
 * de traitement d'image, et on n'a besoin que de deux entiers. JPEG et PNG
 * couvrent 100 % des images du site.
 *
 * Sert à écrire `width`/`height` sur chaque <img> : sans eux, le navigateur ne
 * peut pas réserver la place avant le téléchargement, ce qui décale la mise en
 * page pendant le chargement (Cumulative Layout Shift).
 */

/** PNG : les dimensions sont dans le bloc IHDR, toujours en tête de fichier. */
function lireDimensionsPng(donnees) {
  if (donnees.length < 24) return null;
  const signature = donnees.subarray(0, 8);
  const attendue = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!signature.equals(attendue)) return null;
  if (donnees.subarray(12, 16).toString('ascii') !== 'IHDR') return null;
  return {
    largeur: donnees.readUInt32BE(16),
    hauteur: donnees.readUInt32BE(20),
  };
}

/**
 * JPEG : il faut parcourir les segments jusqu'au marqueur SOF (Start Of Frame),
 * qui porte les dimensions. Les SOF valides sont 0xC0..0xCF, sauf 0xC4 (table
 * de Huffman), 0xC8 (extension JPEG) et 0xCC (table arithmétique) qui ne sont
 * pas des en-têtes d'image.
 */
function lireDimensionsJpeg(donnees) {
  if (donnees.length < 4) return null;
  if (donnees[0] !== 0xff || donnees[1] !== 0xd8) return null;

  let position = 2;
  while (position < donnees.length - 9) {
    if (donnees[position] !== 0xff) {
      position += 1;
      continue;
    }
    const marqueur = donnees[position + 1];

    // Marqueurs sans charge utile.
    if (marqueur === 0xd8 || marqueur === 0x01 || (marqueur >= 0xd0 && marqueur <= 0xd7)) {
      position += 2;
      continue;
    }
    if (marqueur === 0xd9 || marqueur === 0xda) break; // fin, ou début des données

    const longueur = donnees.readUInt16BE(position + 2);
    const estSof = marqueur >= 0xc0 && marqueur <= 0xcf
      && marqueur !== 0xc4 && marqueur !== 0xc8 && marqueur !== 0xcc;

    if (estSof) {
      return {
        hauteur: donnees.readUInt16BE(position + 5),
        largeur: donnees.readUInt16BE(position + 7),
      };
    }
    if (longueur < 2) return null; // segment corrompu : on abandonne proprement
    position += 2 + longueur;
  }
  return null;
}

/** Retourne { largeur, hauteur } ou null si le format n'est pas reconnu. */
function lireDimensions(donnees) {
  if (!donnees || donnees.length === 0) return null;
  return lireDimensionsPng(donnees) || lireDimensionsJpeg(donnees);
}

module.exports = { lireDimensions, lireDimensionsPng, lireDimensionsJpeg };
