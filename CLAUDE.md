# Soly'bat — Site web

Projet en phase de cadrage : pas encore de code source, pas de stack technique choisie. Ce fichier résume le brief de marque (`BRAND.md`) comme référence rapide ; **`BRAND.md` reste la source de vérité** — le consulter en entier avant toute génération de contenu ou de design.

## L'entreprise

- **Soly'bat** : BTP / rénovation de biens immobiliers en vue de mise en location, rayon ~50 km autour de Vierzon (Cher).
- **Service phare** : prise en charge intégrale d'un chantier (tous corps de métier) pour un bien prêt à louer — un seul interlocuteur.
- **Cibles** : investisseurs locatifs, agences/gestionnaires immobiliers, particuliers.
- **Positionnement** : "Un bien à rénover. Un bien loué. Un seul interlocuteur."
- **Ton** : sobre, factuel, direct ("Nous prenons en charge…"), jamais de jargon BTP non expliqué face au grand public.

## Identité visuelle

- **Logo** : `logo-solybat.png` — sceau circulaire terracotta, wordmark serif anthracite, bulle de niveau stylisée (signature de marque récurrente à réutiliser dans l'UI : frise process, tampon "chantier garanti", favicon).

### Palette

| Nom | Hex | Usage |
|---|---|---|
| Terracotta | `#B5502E` | Accent/CTA — jamais en fond de bloc large |
| Bois brûlé | `#6B4A32` | Texture, labels secondaires |
| Crème sable | `#EDE4D3` | Fond principal — jamais blanc pur |
| Crème claire | `#F6F1E7` | Fond alternatif |
| Anthracite | `#2B2723` | Texte principal — jamais noir pur |
| Vert olivier | `#7A8560` | Petites touches : validations, coche, point du sceau |

### Typographie

- Display (titres) : **Fraunces**, avec parcimonie.
- Corps de texte : **Inter**.
- Import : `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');`

### Règles de direction artistique

- Photos réelles de chantiers uniquement — jamais de stock.
- Mouvement minimal ; le slider avant/après est le seul vrai moment d'interaction.
- Numérotation (01→04) réservée à la frise du process, pas ailleurs.
- Fond crème sable partout.

## Arborescence cible du site

```
/                           Accueil
/renovation-location        Offre + sections par profil (onglets/ancres)
/realisations                Galerie filtrable
/realisations/[nom-projet]   Fiche projet (avant/après)
/process                    Détail des 4 étapes
/espace-pro                 Page dédiée agences/gestionnaires
/a-propos                   Histoire, valeurs, zone d'intervention
/faq                        Délais, garanties, assurances, paiement
/devis                      Formulaire de contact par profil
/mentions-legales           SIRET, assurances, CGV, confidentialité
```

## État du projet

- [ ] Stack technique et hébergement à choisir
- [ ] Contenu texte définitif à rédiger
- [ ] Déclinaisons du logo (favicon, carte de visite, signature mail)
- [ ] Photos avant/après à collecter

## CODEBASE_MAP.md

Pas encore créé — aucun fichier source à indexer. À générer dès que la stack est choisie et que les premiers fichiers de code existent (voir instructions globales de l'utilisateur).
