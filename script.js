document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.panel');
  const tabnav = document.getElementById('tabnav');
  const menuToggle = document.getElementById('menuToggle');

  function activatePanel(panelId, options = {}) {
    const { updateHash = true, closeMenu = true } = options;

    tabButtons.forEach((btn) => {
      const isMatch = btn.dataset.panel === panelId;
      btn.classList.toggle('is-active', isMatch);
      btn.setAttribute('aria-selected', String(isMatch));
    });

    panels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.id === panelId);
    });

    if (updateHash && history.replaceState) {
      history.replaceState(null, '', `#${panelId}`);
    }

    if (closeMenu) {
      tabnav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }

    // Move focus to the panel heading for keyboard/screen-reader users
    const heading = document.querySelector(`#${panelId} h1, #${panelId} h2`);
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activatePanel(btn.dataset.panel);
    });
  });

  // Hero buttons that jump to a specific tab
  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      activatePanel(el.dataset.nav);
    });
  });

  // Mobile menu toggle
  menuToggle.addEventListener('click', () => {
    const isOpen = tabnav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Respect a deep link like index.html#experience on load
  const initialHash = window.location.hash.replace('#', '');
  const validPanel = Array.from(panels).some((p) => p.id === initialHash);
  if (validPanel) {
    activatePanel(initialHash, { updateHash: false, closeMenu: false });
  }
});
