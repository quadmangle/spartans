/**
 * cojoinlistener.js
 *
 * Creates a stack of Floating Action Buttons (FABs) that launch
 * Contact, Join, Chatbot modals and the site navigation menu.
 */
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  let fabStack = null;
  let activeModal = null;
  let overlay = null;
  let lastFocused = null; // Remember focus to restore when modal closes

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

  function buildFabStack() {
    if (fabStack) return;

    fabStack = document.createElement('div');
    fabStack.className = 'fab-stack';
    body.appendChild(fabStack);

    const contactFab = createFab('contact', '<i class="fa fa-envelope"></i>', 'Contact Us', 'fab-stack__contact');
    const joinFab = createFab('join', '<i class="fa fa-user-plus"></i>', 'Join Us', 'fab-stack__join');
    const chatbotFab = createFab('chatbot', '<i class="fa fa-comments"></i>', 'Chatbot', 'fab-stack__chatbot');
    const menuFab = createFab('menu', '<i class="fa fa-bars"></i>', 'Menu', 'fab-stack__menu');

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

  function removeFabStack() {
    if (fabStack) {
      fabStack.remove();
      fabStack = null;
    }
  }

  function checkFabVisibility() {
    if (window.innerWidth <= 768) {
      buildFabStack();
    } else {
      removeFabStack();
    }
  }

  checkFabVisibility();
  window.addEventListener('resize', checkFabVisibility);

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
    button.className = `fab-stack__button ${extraClass}`;
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
   * @param {string} modalId 'contact', 'join', or 'chatbot'.
   */
  async function showModal(modalId) {
    const targetId = modalId === 'chatbot' ? 'chatbot-container' : `${modalId}-modal`;
    lastFocused = document.activeElement;

    if (activeModal && activeModal.id !== targetId) {
      hideModal(activeModal);
    }

    let modal = document.getElementById(targetId);
    if (modal) {
      modal.style.display = 'flex';
      activeModal = modal;
    } else {
      try {
        const url = `fabs/${modalId}.html`;
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
        modal = root.querySelector('.modal-container') || root.querySelector('#chatbot-container');
        if (modal) {
          if (modalId !== 'chatbot') {
            modal.id = targetId;
          }
          document.body.appendChild(modal);
          if (window.initCojoinForms) {
            try {
              window.initCojoinForms();
            } catch (err) {
              console.error('initCojoinForms failed:', err);
            }
          }
          modal.style.display = 'flex';
          activeModal = modal;

          const closeBtn = modal.querySelector('.modal-close');
          if (closeBtn) {
            closeBtn.addEventListener('click', () => hideModal(modal));
          }

          if (modalId === 'chatbot' && window.initChatbot) {
            window.initChatbot();
          }
        }
      } catch (error) {
        console.error(`Failed to load modal for ${modalId}:`, error);
      }
    }

    if (modal) {
      removeOverlay();
      overlay = document.createElement('div');
      overlay.className = 'backdrop';
      overlay.dataset.open = 'true';
      overlay.addEventListener('click', () => hideModal(modal));
      document.body.appendChild(overlay);
      document.documentElement.dataset.lock = 'true';
      document.body.dataset.lock = 'true';

      if (window.initDraggableModal) {
        window.initDraggableModal(modal);
      }

      const focusTarget =
        modalId === 'chatbot'
          ? modal.querySelector('#chatbot-input')
          : modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusTarget && focusTarget.focus) {
        focusTarget.focus();
      }
    }
  }

  /**
   * Hides the specified modal and cleans up overlay/focus.
   */
  function hideModal(modal) {
    if (modal) {
      modal.style.display = 'none';
      activeModal = null;
    }
    removeOverlay();
    if (lastFocused && lastFocused.focus) {
      lastFocused.focus();
      lastFocused = null;
    }
  }

  function removeOverlay() {
    if (overlay) {
      if (overlay.remove) {
        overlay.remove();
      } else if (overlay.parentNode && overlay.parentNode.children) {
        const idx = overlay.parentNode.children.indexOf(overlay);
        if (idx > -1) {
          overlay.parentNode.children.splice(idx, 1);
        }
      }
      overlay = null;
    }
    if (document.documentElement && document.documentElement.dataset) {
      delete document.documentElement.dataset.lock;
    }
    if (document.body && document.body.dataset) {
      delete document.body.dataset.lock;
    }
  }

  // Adjust draggable on resize
  window.addEventListener('resize', () => {
    if (activeModal && window.initDraggableModal) {
      window.initDraggableModal(activeModal);
    }
  });
});
