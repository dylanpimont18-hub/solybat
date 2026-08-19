import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import dimensionsImage from '../lib/dimensions-image.cjs';

const { lireDimensions } = dimensionsImage;

/** Construit un en-tete PNG minimal valide. */
function pngFactice(largeur, hauteur) {
  const tampon = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(tampon, 0);
  tampon.writeUInt32BE(13, 8);
  tampon.write('IHDR', 12, 'ascii');
  tampon.writeUInt32BE(largeur, 16);
  tampon.writeUInt32BE(hauteur, 20);
  return tampon;
}

/** Construit un JPEG minimal : SOI, un segment APP0, puis un SOF0. */
function jpegFactice(largeur, hauteur, marqueurSof = 0xc0) {
  const app0 = Buffer.alloc(20);
  app0.writeUInt16BE(0xffe0, 0);
  app0.writeUInt16BE(18, 2); // longueur du segment
  const sof = Buffer.alloc(11);
  sof.writeUInt16BE(0xff00 | marqueurSof, 0);
  sof.writeUInt16BE(9, 2);
  sof.writeUInt8(8, 4);
  sof.writeUInt16BE(hauteur, 5);
  sof.writeUInt16BE(largeur, 7);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), app0, sof, Buffer.from([0xff, 0xd9])]);
}

test('lit les dimensions d un PNG', () => {
  assert.deepEqual(lireDimensions(pngFactice(1080, 1350)), { largeur: 1080, hauteur: 1350 });
});

test('lit les dimensions d un JPEG de base', () => {
  assert.deepEqual(lireDimensions(jpegFactice(1200, 800)), { largeur: 1200, hauteur: 800 });
});

test('lit un JPEG progressif (SOF2)', () => {
  assert.deepEqual(lireDimensions(jpegFactice(640, 480, 0xc2)), { largeur: 640, hauteur: 480 });
});

test('ne confond pas une table de Huffman (0xC4) avec un en-tete d image', () => {
  // 0xC4 est dans la plage 0xC0-0xCF mais n'est pas un SOF : s'il etait lu
  // comme tel, on retournerait des dimensions absurdes.
  const huffman = Buffer.alloc(11);
  huffman.writeUInt16BE(0xffc4, 0);
  huffman.writeUInt16BE(9, 2);
  const donnees = Buffer.concat([
    Buffer.from([0xff, 0xd8]),
    huffman,
    jpegFactice(300, 200).subarray(2),
  ]);
  assert.deepEqual(lireDimensions(donnees), { largeur: 300, hauteur: 200 });
});

test('retourne null sur un format inconnu ou un fichier vide', () => {
  assert.equal(lireDimensions(Buffer.from('pas une image')), null);
  assert.equal(lireDimensions(Buffer.alloc(0)), null);
  assert.equal(lireDimensions(null), null);
});

test('retourne null sur un PNG tronque plutot que de planter', () => {
  assert.equal(lireDimensions(pngFactice(100, 100).subarray(0, 15)), null);
});

test('un JPEG sans SOF ne plante pas', () => {
  const donnees = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
  assert.equal(lireDimensions(donnees), null);
});

test('un segment de longueur corrompue ne provoque pas de boucle infinie', () => {
  const donnees = Buffer.alloc(64);
  donnees.writeUInt16BE(0xffd8, 0);
  donnees.writeUInt16BE(0xffe0, 2);
  donnees.writeUInt16BE(0, 4); // longueur invalide
  assert.equal(lireDimensions(donnees), null);
});

test('lit les vraies images du site', () => {
  const cas = [
    ['src/images/publicite-climatisation.png', 1080, 1350],
    ['src/images/og-image.jpg', 1200, 630],
  ];
  for (const [chemin, largeur, hauteur] of cas) {
    const mesure = lireDimensions(readFileSync(chemin));
    assert.deepEqual(mesure, { largeur, hauteur }, `dimensions inattendues pour ${chemin}`);
  }
});

test('toutes les photos de realisations sont lisibles', () => {
  const photos = ['cuisine-renovee.jpg', 'sejour-renove.jpg', 'piece-a-renover.jpg'];
  for (const photo of photos) {
    const mesure = lireDimensions(readFileSync(`src/images/realisations/${photo}`));
    assert.ok(mesure, `${photo} : dimensions illisibles`);
    assert.ok(mesure.largeur > 0 && mesure.hauteur > 0, `${photo} : dimensions nulles`);
    assert.ok(mesure.largeur <= 4000 && mesure.hauteur <= 4000, `${photo} : dimensions aberrantes`);
  }
});
