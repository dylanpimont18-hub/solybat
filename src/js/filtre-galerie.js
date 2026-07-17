export function filtrerRealisations(realisations, filtres) {
  return realisations.filter((realisation) => {
    const matchType = filtres.typeDeBien === 'tous' || realisation.typeDeBien === filtres.typeDeBien;
    const matchAmpleur = filtres.ampleurChantier === 'tous' || realisation.ampleurChantier === filtres.ampleurChantier;
    return matchType && matchAmpleur;
  });
}

export function initFiltreGalerie() {
  const galerie = document.querySelector('[data-galerie]');
  if (!galerie) return;

  const cartes = Array.from(galerie.querySelectorAll('[data-slug]'));
  const realisations = cartes.map((carte) => ({
    slug: carte.dataset.slug,
    typeDeBien: carte.dataset.typeDeBien,
    ampleurChantier: carte.dataset.ampleurChantier,
  }));

  const selectType = document.querySelector('[data-filtre-type]');
  const selectAmpleur = document.querySelector('[data-filtre-ampleur]');
  const messageVide = document.querySelector('[data-galerie-vide]');
  if (!selectType || !selectAmpleur || !messageVide) return;

  function appliquerFiltres() {
    const filtres = { typeDeBien: selectType.value, ampleurChantier: selectAmpleur.value };
    const slugsVisibles = filtrerRealisations(realisations, filtres).map((r) => r.slug);
    cartes.forEach((carte) => {
      carte.hidden = !slugsVisibles.includes(carte.dataset.slug);
    });
    messageVide.hidden = slugsVisibles.length > 0;
  }

  selectType.addEventListener('change', appliquerFiltres);
  selectAmpleur.addEventListener('change', appliquerFiltres);
}
