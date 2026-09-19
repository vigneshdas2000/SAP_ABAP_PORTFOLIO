document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.panel');
  const tabnav = document.getElementById('tabnav');
  const menuToggle = document.getElementById('menuToggle');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Animated stat counters (Overview tab) ----------
  function animateStats() {
    const stats = document.querySelectorAll('.stat-num[data-target]');
    stats.forEach((el) => {
      const raw = el.dataset.target;
      const target = parseFloat(raw);
      const decimals = (raw.split('.')[1] || '').length;

      if (prefersReduced) {
        el.textContent = raw;
        return;
      }

      el.textContent = decimals ? (0).toFixed(decimals) : '0';
      const duration = 900;
      let start = null;

      function step(timestamp) {
        if (start === null) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = decimals ? value.toFixed(decimals) : Math.round(value);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = raw;
        }
      }
      requestAnimationFrame(step);
    });
  }

  // ---------- Copy-to-clipboard (Contact tab) ----------
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      const original = btn.textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied';
      } catch (err) {
        btn.textContent = 'Copy failed';
      }
      btn.classList.add('is-copied');
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('is-copied');
      }, 1600);
    });
  });

  // ---------- Tap-to-toggle tooltips on tx-code tags (touch devices) ----------
  document.querySelectorAll('.tx').forEach((tx) => {
    tx.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.tx.is-open').forEach((other) => {
        if (other !== tx) other.classList.remove('is-open');
      });
      tx.classList.toggle('is-open');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.tx.is-open').forEach((tx) => tx.classList.remove('is-open'));
  });

  // ---------- Tab navigation ----------
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

    if (panelId === 'overview') {
      animateStats();
    }
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
  } else {
    animateStats();
  }
});
