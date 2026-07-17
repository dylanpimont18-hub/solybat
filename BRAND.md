# Soly'bat — Brief de marque & projet site web

Ce document sert de référence unique pour le développement du site (contenu, code, design). À lire avant toute génération de code par Claude Code.

---

## 1. L'entreprise

**Nom** : Soly'bat
**Activité** : Entreprise de BTP / rénovation de biens immobiliers (maison, appartement, immeuble)
**Zone d'intervention** : rayon d'environ 50 km autour de Vierzon (Cher, Centre-Val de Loire)

### Le service phare

Soly'bat intervient sur un chantier pour le compte de propriétaires souhaitant mettre leur bien en location. L'entreprise prend en charge **l'intégralité des travaux nécessaires** pour rendre le bien prêt à louer — un seul interlocuteur, un chantier maîtrisé, un bien livré prêt à l'usage.

### Clientèle cible

1. **Investisseurs locatifs** — veulent un bien rentable vite, sans gérer 10 corps de métier
2. **Agences immobilières / gestionnaires de biens** — besoin d'un prestataire fiable et réactif, potentiellement récurrent
3. **Particuliers** — rénovation de leur propre bien (résidence ou bien à louer)

### Positionnement

> Soly'bat transforme un bien à rénover en bien prêt à louer ou à vivre, avec un seul interlocuteur, un seul chantier, un délai maîtrisé.

Accroche possible pour le hero du site :
> "Un bien à rénover. Un bien loué. Un seul interlocuteur."

---

## 2. Identité visuelle

### Logo retenu : "Le sceau"

Un badge circulaire façon sceau de certification/garantie, qui associe deux idées : la confiance (label de qualité) et la précision de l'artisan (bulle de niveau).

- Cercle fin terracotta encadrant l'ensemble
- Wordmark "Soly'bat" centré, typographie serif épaisse et rustique, couleur anthracite
- Sous le texte : une bulle de niveau à bulle stylisée (cercle vide + point olive centré) — signature de marque récurrente
- Autour du cercle extérieur, en petites majuscules espacées : "RÉNOVATION & MISE EN LOCATION"
- Fond crème sable

**Fichier logo** : `logo-solybat.png` (dans ce même répertoire)

### Autres concepts explorés (non retenus, gardés pour référence/déclinaisons futures)

- **Le niveau** — l'apostrophe de "Soly'bat" devient une bulle de niveau
- **La maison-cadre** — pictogramme de maison en trait continu avec structure intérieure en terracotta
- **L'équerre** — wordmark sobre souligné d'un trait d'équerre + baseline
- **La clé** — le "y" devient un anneau de clé dont le panneton dessine une silhouette de toiture

### Palette de couleurs

| Nom | Hex | Usage |
|---|---|---|
| Terracotta | `#B5502E` | Accent signature, CTA, éléments du logo — jamais en fond de bloc large |
| Bois brûlé | `#6B4A32` | Texture, labels secondaires, petites majuscules |
| Crème sable | `#EDE4D3` | Fond principal — jamais de blanc pur |
| Crème claire | `#F6F1E7` | Fond alternatif / body plus clair |
| Anthracite | `#2B2723` | Texte principal — jamais de noir pur |
| Vert olivier | `#7A8560` | Petites touches : validations, coche "garanti", point central du sceau |

### Typographie

- **Display** (titres, accroches) : **Fraunces** (serif à empattements marqués, un peu rustique) — utilisée avec parcimonie, un titre en gros corps par section max
- **Corps de texte** (descriptifs, devis, formulaires, UI) : **Inter** (sans-serif géométrique sobre)

Import Google Fonts :
```
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
```

### Signature de marque

Le motif de la **bulle de niveau** (cercle terracotta + point olive centré) revient partout : dans le logo, comme repère de progression sur la frise du process (coché à chaque étape), comme tampon "chantier garanti" sur les réalisations, en favicon.

### Ton / voix

- Sobre et factuel plutôt que promotionnel — la cible pro (agences, investisseurs) est rassurée par la précision, pas par le lyrisme
- Actif, direct : "Nous prenons en charge…" plutôt que "Vos travaux sont pris en charge…"
- Jamais de jargon BTP non expliqué face à un public non-initié (particuliers)

---

## 3. Direction artistique du site

### Thèse

Le site ne vend pas "des travaux", il prouve la disparition d'un problème : un bien qui ne rapporte rien devient un bien loué, sans que le client touche à rien. Chaque section doit démontrer cette transformation, pas seulement la décrire.

### Structure de la page d'accueil

```
┌─────────────────────────────────────┐
│  HERO                                │
│  Sceau + accroche + photo réelle     │
│  de chantier (pas de stock)          │
├─────────────────────────────────────┤
│  01 Diagnostic → 02 Devis →          │
│  03 Chantier → 04 Remise des clés    │
│  (frise horizontale, numérotée —     │
│  légitime ici car vrai process)      │
├─────────────────────────────────────┤
│  RÉALISATIONS                        │
│  Slider avant/après par projet       │
├─────────────────────────────────────┤
│  POUR QUI : 3 colonnes               │
│  Agences · Investisseurs · Particul. │
├─────────────────────────────────────┤
│  GARANTIES (motif sceau réutilisé)   │
├─────────────────────────────────────┤
│  CONTACT / DEMANDE DE DEVIS          │
└─────────────────────────────────────┘
```

### Règles de direction artistique

- **Photographie** : uniquement des photos réelles de chantiers Soly'bat (même smartphone, lumière naturelle) — jamais de stock, une agence immobilière repère un stock générique instantanément et ça détruit la crédibilité
- **Mouvement** : minimal et volontaire — le slider avant/après est le seul vrai moment d'interaction, pas d'animations au scroll partout (incompatible avec le sérieux recherché en B2B)
- **Numérotation** : légitime uniquement pour la frise du process (01→04), qui est un vrai séquencement — ne pas en abuser ailleurs
- **Fond** : crème sable partout, jamais blanc pur ni noir pur

---

## 4. Arborescence complète du site

```
/                           Accueil
/renovation-location        Notre service (offre + sections par profil client via ancres/onglets)
/realisations                Galerie filtrable (type de bien, ampleur du chantier)
/realisations/[nom-projet]   Fiche projet individuelle (surface, durée, corps de métier, avant/après)
/process                    Détail des 4 étapes, délais moyens, suivi de chantier
/espace-pro                 Page dédiée agences/gestionnaires (volume, réactivité, facturation, plaquette PDF)
/a-propos                   Histoire, valeurs, zone d'intervention
/faq                        Délais, garanties, assurance décennale/RC pro, paiement
/devis                      Formulaire de contact différencié par profil
/mentions-legales           SIRET, assurance décennale, RC pro, CGV, politique de confidentialité
```

### Notes structurantes

- Les 3 profils clients (agences, investisseurs, particuliers) sont regroupés dans **une seule page service** via onglets/ancres plutôt que 3 pages séparées — plus simple à maintenir et suffisant pour le référencement local au démarrage
- `/espace-pro` est une page isolée car le discours à une agence (volume, réactivité, facturation) diffère du discours à un particulier
- Chaque fiche `/realisations/[nom-projet]` doit être indexable individuellement (SEO) → nécessite de shooter systématiquement avant/après sur chaque chantier futur

---

## 5. À définir / prochaines étapes

- [ ] Rédaction du contenu texte définitif (accueil, page service)
- [ ] Déclinaison du logo en favicon, versions carte de visite, signature mail
- [ ] Récolte des photos avant/après des chantiers déjà réalisés
- [ ] Choix technique (stack, hébergement) pour l'implémentation du site
