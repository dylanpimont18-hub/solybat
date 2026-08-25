import { initNav } from './nav.js';
import { initOnglets } from './onglets.js';
import { initFiltreGalerie } from './filtre-galerie.js';
import { initSliderAvantApres } from './slider-avant-apres.js';
import { initFormDevis } from './form-devis.js';
import { initFormAnalyse } from './form-analyse.js';
import { initHero3d } from './hero-3d/index.js';
import { initReveals } from './reveals.js';
import { initTiltCartes } from './tilt-cartes.js';
import { initCompteurs } from './compteurs.js';
import { initHeaderCondense } from './header-condense.js';

initNav();
initOnglets();
initFiltreGalerie();
initSliderAvantApres();
initFormDevis();
initFormAnalyse();

// Couche visuelle : chaque init sort immediatement si sa cible est absente.
initHeaderCondense();
initReveals();
initTiltCartes();
initCompteurs();
initHero3d();
