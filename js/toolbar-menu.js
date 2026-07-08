export function enableToolbarMenu(root = document) {
  const toggle = root.querySelector('[data-toolbar-menu-toggle]');
  const menu = root.querySelector('[data-toolbar-menu]');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  });
}
