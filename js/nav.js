function initNavigation() {
  const mobileNav = document.getElementById('mobileNav');
  const fabMenu = document.getElementById('fab-menu');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const langButtons = document.querySelectorAll('.lang-toggle');
  const themeButtons = document.querySelectorAll('.theme-toggle');

  function toggleMenu() {
    const expanded = fabMenu && fabMenu.getAttribute('aria-expanded') === 'true';
    const newState = !expanded;
    if (fabMenu) fabMenu.setAttribute('aria-expanded', newState);
    if (mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded', newState);
    mobileNav.setAttribute('aria-hidden', String(!newState));
    if (newState) {
      const firstLink = mobileNav.querySelector('a');
      firstLink && firstLink.focus();
    } else {
      if (mobileMenuButton) mobileMenuButton.focus();
    }
  }

  fabMenu && fabMenu.addEventListener('click', toggleMenu);
  mobileMenuButton && mobileMenuButton.addEventListener('click', toggleMenu);

  mobileNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      toggleMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.getAttribute('aria-hidden') === 'false') {
      toggleMenu();
    }
  });

  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleLanguage();
      updateContent();
    });
  });

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleTheme();
      updateTheme();
    });
  });

  // Sync buttons with current state
  updateContent();
  updateTheme();
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('mobile-nav.html')
    .then(res => res.text())
    .then(html => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper.firstElementChild);
      initNavigation();
    })
    .catch(err => console.error('Mobile nav load failed', err));
});
