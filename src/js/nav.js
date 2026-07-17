export function calculerProchainEtat(etatOuvert) {
  return !etatOuvert;
}

export function initNav() {
  const bouton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav-principale]');
  if (!bouton || !nav) return;

  bouton.addEventListener('click', () => {
    const ouvert = bouton.getAttribute('aria-expanded') === 'true';
    const prochainEtat = calculerProchainEtat(ouvert);
    bouton.setAttribute('aria-expanded', String(prochainEtat));
    nav.classList.toggle('header__nav--ouvert', prochainEtat);
  });
}
