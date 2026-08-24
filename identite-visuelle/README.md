# Déclinaisons du logo Soly'bat

Générées le 2026-07-30, à partir de `logo-solybat.png` (recadré/détouré en transparent depuis le sceau original). Carte de visite générique (pas de nom de personne, pas d'adresse postale — voir `CLAUDE.md` pour le contexte).

- `carte-visite-recto.png` / `carte-visite-verso.png` — 1004×650 px (300 dpi, format 85×55 mm sans fond perdu). À donner tel quel à un imprimeur, qui ajoutera le fond perdu si besoin.
- `signature-email-solybat.html` — bloc HTML à coller dans l'éditeur de signature du client mail (Gmail : Paramètres > Signature > éditeur HTML). Référence l'image `src/images/signature-sceau.png` via l'URL `https://www.solybat18.fr/images/signature-sceau.png` — ne fonctionnera qu'une fois le site déployé sur ce domaine (avant ça, l'image n'apparaîtra pas chez les destinataires).
- `signature-email-apercu.png` — rendu visuel de la signature, pour vérification rapide sans avoir à la coller dans un client mail.

## Plaquette de présentation

- `plaquette-solybat.html` — **source** de `src/documents/plaquette-solybat.pdf` (**dépliant 3 volets** : A4 paysage recto-verso, soit 2 pages PDF, plié en 3 après impression ; lié en téléchargement depuis `/espace-pro/`). Écrite le 2026-08-24 pour pouvoir régénérer la plaquette : le PDF original du 2026-07-30 avait été produit à partir d'un HTML jamais versionné, et il a fallu la refaire pour en retirer la mention « rayon d'environ 50 km » (paragraphe de couverture **et** carte-chiffre « 50 km », remplacée par « 9 corps de métier », le compte exact de la liste de `/renovation-location/`). Toute modification future passe par ce fichier, plus par le PDF.
- Refonte du 2026-08-24 (rendu jugé pas assez haut de gamme).
- **Pli roulé** (confirmé par le client le 2026-08-24), roulage par la droite.
- **Géométrie — les volets ne font pas tous la même largeur.** En pli roulé, le volet qui rentre à l'intérieur doit être plus étroit, sinon il bute contre la pliure et fait gondoler la plaquette :

```
face EXTÉRIEURE (page 1) : [ 97mm rentrant ] [ 100mm dos ] [ 100mm COUVERTURE ]
face INTÉRIEURE (page 2) : [ 100mm métiers ] [ 100mm process ] [ 97mm rentrant ]
```

  **Le rentrant est à droite à l'intérieur et à gauche à l'extérieur** : c'est le même volet physique, et retourner la feuille inverse l'ordre. C'est l'erreur classique — mettre le volet étroit du même côté sur les deux faces donne une plaquette dont le contenu ne tombe pas en face des plis. Total 297 mm des deux côtés (`.feuille--exterieur` / `.feuille--interieur` dans le HTML).
- Chaque volet garde **8 mm de marge de part et d'autre d'une pliure** ; rien d'important ne doit traverser un pli. C'est la contrainte qui commande toute la mise en page : le tableau à 6 colonnes de la version précédente ne tenait pas dans 97 mm, il a fallu le passer en lignes compactes.
- **Ordre de lecture** : fermée, on voit la couverture (volet droit de l'extérieur) ; on retourne, on lit le dos (volet du milieu) ; on ouvre le rabat, le volet 97 mm apparaît ; tout déplié, les 3 volets intérieurs se lisent de gauche à droite.
- **Si l'imprimeur roule par la gauche** et non par la droite, tout est à mettre en miroir : permuter les colonnes de chaque face et échanger les deux `grid-template-columns`.
- **Les chiffres du volet 6 sont écrits en dur** et vérifiés par `tests/plaquette.test.js` : si `retoursClients.json` bouge, `npm test` échoue et rappelle de regénérer le PDF.
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
