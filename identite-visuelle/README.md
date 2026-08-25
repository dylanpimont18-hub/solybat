# Déclinaisons du logo Soly'bat

Générées le 2026-07-30, à partir de `logo-solybat.png` (recadré/détouré en transparent depuis le sceau original). Carte de visite générique (pas de nom de personne, pas d'adresse postale — voir `CLAUDE.md` pour le contexte).

- `carte-visite.html` — **source** des deux PNG ci-dessous, écrite le 2026-08-25. Les PNG du 2026-07-30 avaient été produits à partir d'un HTML jamais versionné, et la carte était restée périmée : elle affichait encore « rayon de 50 km » et l'ancienne adresse gmail, en contradiction avec le site. **Ne plus retoucher les PNG directement.** Régénération : `msedge --headless=new --force-device-scale-factor=1 --window-size=1004,1300 --screenshot=cartes.png file:///.../carte-visite.html`, puis découper en deux à la moitié (0–650 = recto, 650–1300 = verso).
- `carte-visite-recto.png` / `carte-visite-verso.png` — 1004×650 px (300 dpi, format 85×55 mm sans fond perdu). À donner tel quel à un imprimeur, qui ajoutera le fond perdu si besoin.
- `signature-email-solybat.html` — bloc HTML à coller dans l'éditeur de signature du client mail (Gmail : Paramètres > Signature > éditeur HTML). Référence l'image `src/images/signature-sceau.png` via l'URL `https://www.solybat18.fr/images/signature-sceau.png` — ne fonctionnera qu'une fois le site déployé sur ce domaine (avant ça, l'image n'apparaîtra pas chez les destinataires).
- `signature-email-apercu.png` — rendu visuel de la signature, pour vérification rapide sans avoir à la coller dans un client mail. **Le générer avec une copie temporaire du HTML dont l'URL du sceau pointe vers `../src/images/signature-sceau.png`** : telle quelle, la signature référence l'image sur `solybat18.fr`, et l'aperçu sortirait avec une image cassée tant que le site n'est pas en ligne.

## Plaquette de présentation

- `plaquette-solybat.html` — **source** de `src/documents/plaquette-solybat.pdf` (**dépliant 3 volets** : A4 paysage recto-verso, soit 2 pages PDF, plié en 3 après impression ; lié en téléchargement depuis `/espace-pro/`). Écrite le 2026-08-24 pour pouvoir régénérer la plaquette : le PDF original du 2026-07-30 avait été produit à partir d'un HTML jamais versionné, et il a fallu la refaire pour en retirer la mention « rayon d'environ 50 km » (paragraphe de couverture **et** carte-chiffre « 50 km », remplacée par « 9 corps de métier », le compte exact de la liste de `/renovation-location/`). Toute modification future passe par ce fichier, plus par le PDF.
- Refonte du 2026-08-24 (rendu jugé pas assez haut de gamme).
- **Les contraintes d'impression ont été écartées** par le client le 2026-08-24 : les 3 sections de chaque page font désormais la **même largeur (99 mm)** et la page 1 est composée symétriquement — sombre / clair / sombre. Si l'impression pliée revient au programme, la géométrie de pli roulé (volet rentrant à 97 mm, inversé d'une face à l'autre) est récupérable dans l'historique git, commit « passe la plaquette en pli roulé ».
- **Règle éditoriale** : le **nombre d'opérations ne doit jamais apparaître** (demande du client) — ni en titre, ni en ratio « 8/8 », ni en renvoi « les huit opérations ». D'où « 100 % » pour le cash-flow positif et le DSCR. `tests/plaquette.test.js` vérifie qu'aucun compte ne se glisse dans le texte imprimé — il retire d'abord le bloc `<style>` et les commentaires HTML, qui eux documentent la règle et citent donc les tournures interdites.
- **Toutes les opérations de `retoursClients.json` sont listées**, pas seulement les trois meilleures : en ajouter une fait échouer `npm test` tant qu'elle n'est pas reportée dans la plaquette.
- **Les chiffres sont écrits en dur** et vérifiés par `tests/plaquette.test.js` : si `retoursClients.json` bouge, `npm test` échoue et rappelle de regénérer le PDF.
- **Remplissage des volets mesuré** au navigateur avant chaque tirage (`.volet` : `scrollHeight` vs `clientHeight`) : les volets sont en `overflow: hidden`, donc un dépassement serait **rogné sans aucun avertissement**. Au dernier contrôle : 93 % de remplissage sur 5 volets, 69 % sur le dos (centré, volontaire), 0 rognage.
- Régénération (le PDF n'est pas produit par `npm run build`, il faut relancer la commande à la main) :

```
msedge --headless=new --disable-gpu --no-pdf-header-footer \n  --print-to-pdf="src/documents/plaquette-solybat.pdf" \n  "file:///.../identite-visuelle/plaquette-solybat.html"
```

  Le logo est référencé en chemin relatif (`../src/images/logo-solybat.png`) et les polices viennent de Google Fonts : générer depuis le dépôt, avec le réseau, sinon logo manquant et polices de repli.

Reste à faire si besoin : favicon et apple-touch-icon déjà en place (voir `src/manifest.json`), donc ce dossier couvre les 2 dernières déclinaisons listées dans `CLAUDE.md`.

## Publicité climatisation

Générée le 2026-08-01, à la demande de l'utilisateur qui a fourni une publicité concurrente ("Vierzon Carrelage — Climatisation", fond bleu nuit/orange, format 1080×1350) à reproduire avec le ton et l'identité Soly'bat, en conservant l'accroche prix "à partir de 2 500 € HT".

- `publicite-climatisation.html` — source éditable (HTML/CSS autonome, tokens de couleur/police repris de `src/css/tokens.css`, logo référencé en relatif depuis `src/images/logo-solybat.png`). Rouvrir et éditer ce fichier pour toute modification de texte/prix, puis régénérer le PNG (voir commande ci-dessous).
- `publicite-climatisation.png` — export 1080×1350 px (format portrait 4:5, réseaux sociaux/impression), généré via `msedge --headless --disable-gpu --force-device-scale-factor=1 --window-size=1080,1350 --screenshot=publicite-climatisation.png file:///.../publicite-climatisation.html`.

Différences volontaires avec la publicité de référence (pas une reproduction à l'identique) :
- Palette/typo Soly'bat (crème sable, terracotta, Fraunces/Inter) au lieu du bleu nuit/orange/cyan de la référence — cohérent avec la règle de marque "fond crème sable partout" (`CLAUDE.md`).
- Mention TVA reformulée en "TVA à 5,5 % possible sous conditions" (au lieu d'une affirmation ferme) — reprise mot pour mot du bandeau du site (`src/_includes/composants/bandeau-nouveaute.njk`), car le type d'équipement ouvrant droit au taux réduit n'a jamais été confirmé par le client (voir mémoire `service-climatisation`).
- Le point "Marques reconnues (Carrier, LG...)" de la référence n'a pas été repris (partenariats de marque non confirmés) — remplacé par "Pose par nos partenaires certifiés RGE", déjà établi sur le site.
- Sous-titre et points clés réécrits dans la voix Soly'bat ("un seul interlocuteur", équipes qui rénovent le bien) plutôt que traduits mot à mot.
