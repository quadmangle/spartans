/**
 * cojoinlistener.js
 *
 * This script creates and manages the Floating Action Buttons (FABs)
 * for the Contact, Join, and Chatbot modals. It handles the toggle
 * logic and dynamically loads the modal content from the 'fabs' directory.
 */

document.addEventListener('DOMContentLoaded', () => {

  const body = document.body;

  // Create the FAB stack and buttons
  const fabStack = document.createElement('div');
  fabStack.className = 'fab-stack';
  body.appendChild(fabStack);

  const fabMenu = document.createElement('button');
  fabMenu.className = 'fab fab--menu';
  fabMenu.innerHTML = '<i class="fas fa-plus"></i>';
  fabStack.appendChild(fabMenu);

  const contactFab = createFab('contact', '<i class="fa fa-envelope"></i>', 'Contact Us');
  const joinFab = createFab('join', '<i class="fa fa-user-plus"></i>', 'Join Us');
  const chatbotFab = createFab('chatbot', '<i class="fa fa-comments"></i>', 'Chatbot');

  fabStack.appendChild(contactFab);
  fabStack.appendChild(joinFab);
  fabStack.appendChild(chatbotFab);

  let activeModal = null;
  let overlay = null;
  // Track the element that was focused before a modal opened so we can
  // restore focus when the modal closes.
  let lastFocused = null;

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

  // Main FAB click handler
  fabMenu.addEventListener('click', () => {
    fabStack.classList.toggle('open');
    // Removed shine animation to prevent spinning effect on click
    // fabMenu.classList.add('shine');
    // setTimeout(() => {
    //   fabMenu.classList.remove('shine');
    // }, 600);
    // If FABs close, also close the active modal
    if (!fabStack.classList.contains('open') && activeModal) {
      hideModal(activeModal);
    }
  });

  // Individual FAB click handlers
  contactFab.addEventListener('click', () => {
    showModal('contact');
  });

  joinFab.addEventListener('click', () => {
    showModal('join');
  });

  chatbotFab.addEventListener('click', () => {
    showModal('chatbot');
  });

  /**
   * Creates a single FAB button.
   * @param {string} id The unique ID for the button.
   * @param {string} icon The HTML for the Font Awesome icon.
   * @param {string} title The title/aria-label for accessibility.
   * @returns {HTMLButtonElement} The created button element.
   */
  function createFab(id, icon, title) {
    const button = document.createElement('button');
    button.className = `fab fab--${id}`;
    button.id = `fab-${id}`;
    button.innerHTML = icon;
    button.title = title;
    button.setAttribute('aria-label', title);
    return button;
  }

  /**
   * Basic HTML sanitization. Uses DOMPurify when available and falls back to
   * stripping script tags otherwise.
   * @param {string} dirty The HTML string to sanitize.
   * @returns {string} A sanitized HTML string.
   */
  function sanitizeHTML(dirty) {
    if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
      return window.DOMPurify.sanitize(dirty);
    }
    return dirty.replace(/<script[^>]*>.*?<\/script>/gi, '');
  }

  /**
   * Displays the specified modal, dynamically loading it if not already present.
   * @param {string} modalId The ID of the modal to show ('contact', 'join', or 'chatbot').
   */
  async function showModal(modalId) {
    const targetId = modalId === 'chatbot' ? 'chatbot-container' : `${modalId}-modal`;

    // Remember the currently focused element to restore later
    lastFocused = document.activeElement;

    // Hide any currently active modal before showing a new one
    if (activeModal && activeModal.id !== targetId) {
      hideModal(activeModal);
    }

    let modal = document.getElementById(targetId);
    if (modal) {
      modal.style.display = 'flex';
      activeModal = modal;
    } else {
      // Dynamic loading logic: fetch HTML from 'fabs/' directory
      try {
        const url = `fabs/${modalId}.html`;
        const response = await fetch(url, { credentials: 'same-origin' });
        const responseURL = response.url || '';
        if (responseURL && !responseURL.startsWith(window.location.origin)) {
          throw new Error('Cross-origin fetch blocked');
        }
        const type = (response.headers && response.headers.get
          ? response.headers.get('Content-Type')
          : '') || '';
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

          // Add close button functionality
          const closeBtn = modal.querySelector('.modal-close');
          // For chatbot, the close button is part of the header, but we can still target it if needed
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
      overlay.className = 'modal-overlay';
      overlay.addEventListener('click', () => hideModal(modal));
      document.body.appendChild(overlay);

      // Initialize draggable on window load, then update on resize
      // This function is expected to be defined in fabs/js/cojoin.js
      if (window.initDraggableModal) {
        window.initDraggableModal(modal);
      }

      // Shift keyboard focus into the modal. For chatbot we focus the input;
      // otherwise focus the first interactive element.
      const focusTarget =
        modalId === 'chatbot'
          ? modal.querySelector('#chatbot-input')
          : modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusTarget && focusTarget.focus) {
        focusTarget.focus();
      }
    }

    fabStack.classList.remove('open');
  }

  /**
   * Hides the specified modal.
   * @param {HTMLElement} modal The modal element to hide.
   */
  function hideModal(modal) {
    if (modal) {
      modal.style.display = 'none';
      activeModal = null;
    }
    removeOverlay();
    // Restore focus to the element that triggered the modal
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
  }

  // Handle window resizing to adjust draggable functionality
  window.addEventListener('resize', () => {
    if (activeModal && window.initDraggableModal) {
      window.initDraggableModal(activeModal);
    }
  });

});
