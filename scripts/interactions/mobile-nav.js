/**
 * @fileoverview Manages the mobile navigation menu and its state.
 */
const mobileNav = document.getElementById('mobile-nav');
const toggleBtn = document.getElementById('toggle-nav');
const svcBtn = document.getElementById('svc-btn');
const svcMenu = document.getElementById('svc-menu');

/**
 * Toggles the main mobile nav menu.
 */
export function toggleMobileNav() {
  const isOpen = mobileNav.classList.toggle('open');
  toggleBtn.setAttribute('aria-expanded', isOpen);
}

/**
 * Toggles the services dropdown menu within the mobile nav.
 */
function toggleSvcDropdown() {
  const isExpanded = svcBtn.getAttribute('aria-expanded') === 'true';
  svcBtn.setAttribute('aria-expanded', !isExpanded);
  svcMenu.style.display = isExpanded ? 'none' : 'block';
}

/**
 * Sets up the event listeners for the mobile navigation.
 */
export function setupMobileNav() {
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleMobileNav);
  }
  if (svcBtn) {
    svcBtn.addEventListener('click', toggleSvcDropdown);
  }

  // Close the services dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (svcMenu && !svcMenu.contains(e.target) && !svcBtn.contains(e.target)) {
      svcBtn.setAttribute('aria-expanded', 'false');
      svcMenu.style.display = 'none';
    }
  });
}
