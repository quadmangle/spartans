/**
 * cojoinlistener.js
 *
 * Creates a stack of Floating Action Buttons (FABs) that launch
 * Contact, Join, Chatbot modals and the site navigation menu.
 */
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  let fabStack = null;
  let menuFab = null;
  let activeModal = null;
  let lastFocused = null; // Remember focus to restore when modal closes
  const modalIds = {
    contact: 'modal-contact-center',
    join: 'modal-join-us',
    chatbot: 'modal-chatbot'
  };

  window.hideActiveFabModal = () => {
    if (activeModal) {
      hideModal(activeModal);
    }
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModal) {
      hideModal(activeModal);
    }
  });

  const mobileQuery = '(max-width: 1024px)';
  const mobileMql = window.matchMedia
    ? window.matchMedia(mobileQuery)
    : {
        matches: window.innerWidth <= 1024,
        addEventListener: () => {},
        addListener: () => {},
      };
  function isMobileWidth() {
    return mobileMql.matches;
  }

  function buildFabStack() {
    if (fabStack) return;
    fabStack = document.createElement('div');
    fabStack.className = 'fab-stack';
    body.appendChild(fabStack);
    const contactFab = createFab('contact', '<i class="fa fa-envelope"></i>', 'Contact Us', 'fab--contact');
    const joinFab = createFab('join', '<i class="fa fa-user-plus"></i>', 'Join Us', 'fab--join');
    const chatbotFab = createFab('chatbot', '<i class="fa fa-comments"></i>', 'Chatbot', 'fab--chatbot');
    menuFab = createFab('menu', '<i class="fa fa-bars"></i>', 'Menu', 'fab--menu');
    fabStack.appendChild(contactFab);
    fabStack.appendChild(joinFab);
    fabStack.appendChild(chatbotFab);
    fabStack.appendChild(menuFab);
    contactFab.addEventListener('click', () => showModal('contact'));
    joinFab.addEventListener('click', () => showModal('join'));
    chatbotFab.addEventListener('click', () => showModal('chatbot'));
    menuFab.addEventListener('click', () => {
      const navToggle = document.querySelector('.nav-menu-toggle');
      if (navToggle && navToggle.click) {
        navToggle.click();
      }
    });
  }

  function updateMenuFab() {
    const navToggle = document.querySelector('.nav-menu-toggle');
    const shouldShow = navToggle && isMobileWidth();
    if (menuFab) {
      menuFab.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        const isOpen = navLinks.classList.contains('open');
        if (isOpen) {
          if (window.closeOpsNavMenu) window.closeOpsNavMenu();
        } else {
          if (window.openOpsNavMenu) window.openOpsNavMenu();
        }
      });
    }
  }

  function checkFabVisibility() {
    if (!fabStack) {
      buildFabStack();
    }
    updateMenuFab();
  }

  checkFabVisibility();
  const handleMediaChange = () => {
    updateMenuFab();
    if (activeModal && window.initDraggableModal) {
      window.initDraggableModal(activeModal);
    }
  };

  if (mobileMql.addEventListener) {
    mobileMql.addEventListener('change', handleMediaChange);
  } else if (mobileMql.addListener) {
    mobileMql.addListener(handleMediaChange);
  }

  /**
   * Create a single FAB button.
   * @param {string} id Unique identifier for the button.
   * @param {string} icon HTML for the icon.
   * @param {string} title Tooltip/aria label.
   * @param {string} extraClass Additional class name.
   * @returns {HTMLButtonElement}
   */
  function createFab(id, icon, title, extraClass) {
    const button = document.createElement('button');
    button.className = `fab ${extraClass}`;
    button.id = `fab-${id}`;
    button.innerHTML = icon;
    button.title = title;
    button.setAttribute('aria-label', title);
    return button;
  }

  /**
   * Basic HTML sanitization using DOMPurify when available.
   * Falls back to removing script tags.
   */
  function sanitizeHTML(dirty) {
    if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
      return window.DOMPurify.sanitize(dirty);
    }
    return dirty.replace(/<script[^>]*>.*?<\/script>/gi, '');
  }

  /**
   * Displays the specified modal, dynamically loading it if not already present.
   * @param {string} modalKey 'contact', 'join', or 'chatbot'.
   */
  async function showModal(modalKey) {
    const targetId = modalIds[modalKey];
    lastFocused = document.activeElement;

    if (activeModal && activeModal.id !== targetId) {
      hideModal(activeModal);
    }

    let modal = document.getElementById(targetId);
    if (modal) {
      modal.classList.add('is-visible');
      activeModal = modal;
    } else {
      try {
        const url = `fabs/${modalKey}.html`;
        const response = await fetch(url, { credentials: 'same-origin' });
        const responseURL = response.url || '';
        if (responseURL && !responseURL.startsWith(window.location.origin)) {
          throw new Error('Cross-origin fetch blocked');
        }
        const type = (response.headers && response.headers.get ? response.headers.get('Content-Type') : '') || '';
        if (type && !type.toLowerCase().startsWith('text/html')) {
          throw new Error(`Unexpected content type: ${type}`);
        }
        const htmlContent = await response.text();
        const sanitized = sanitizeHTML(htmlContent);
        const template = document.createElement('template');
        template.innerHTML = sanitized;

        const root = template.content || template;
        modal = root.querySelector(`#${targetId}`);
        if (modal) {
          document.body.appendChild(modal);
          if (window.initCojoinForms) {
            try {
              window.initCojoinForms();
            } catch (err) {
              console.error('initCojoinForms failed:', err);
            }
          }
          modal.classList.add('is-visible');
          activeModal = modal;

            const closeBtns = modal.querySelectorAll('.modal-close');
            closeBtns.forEach(btn => {
              btn.addEventListener('click', () => hideModal(modal));
            });

          if (modalKey === 'chatbot' && window.initChatbot) {
            window.initChatbot();
          }
        }
      } catch (error) {
        console.error(`Failed to load modal for ${modalKey}:`, error);
      }
    }

    if (modal) {
      if (window.cojoinUI && window.cojoinUI.showBackdrop) {
        window.cojoinUI.showBackdrop();
      }
      if (window.cojoinUI && window.cojoinUI.lockScroll) {
        window.cojoinUI.lockScroll();
      }

      if (window.initDraggableModal) {
        window.initDraggableModal(modal);
      }

      const focusTarget =
        modalKey === 'chatbot'
          ? modal.querySelector('#chatbot-input')
          : modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusTarget && focusTarget.focus) {
        focusTarget.focus();
      }
    }
  }

  /**
   * Hides the specified modal and cleans up backdrop/focus.
   */
  function hideModal(modal) {
    if (modal) {
      modal.classList.remove('is-visible');
      activeModal = null;
    }
    if (window.cojoinUI && window.cojoinUI.hideBackdrop) {
      window.cojoinUI.hideBackdrop();
    }
    if (window.cojoinUI && window.cojoinUI.unlockScroll) {
      window.cojoinUI.unlockScroll();
    }
    if (lastFocused && lastFocused.focus) {
      lastFocused.focus();
      lastFocused = null;
    }
  }

  // Adjust draggable on resize and toggle menu FAB
  window.addEventListener('resize', () => {
    checkFabVisibility();
    if (activeModal && window.initDraggableModal) {
      window.initDraggableModal(activeModal);
    }
  });
});
