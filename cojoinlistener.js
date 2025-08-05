/**
 * cojoinlistener.js
 *
 * This script creates and manages the Floating Action Buttons (FABs)
 * for the Contact, Join, and Chatbot modals. It handles the toggle
 * logic and dynamically loads the modal content from the 'fabs' directory.
 */

document.addEventListener('DOMContentLoaded', () => {

  const body = document.body;

  // Create the FAB container and buttons
  const fabContainer = document.createElement('div');
  fabContainer.className = 'fab-container';
  body.appendChild(fabContainer);

  const fabMain = document.createElement('button');
  fabMain.className = 'fab-main';
  fabMain.innerHTML = '<i class="fas fa-plus"></i>';
  fabContainer.appendChild(fabMain);

  const fabOptions = document.createElement('div');
  fabOptions.className = 'fab-options';
  fabContainer.appendChild(fabOptions);

  const contactFab = createFabOption('contact', '<i class="fa fa-envelope"></i>', 'Contact Us');
  const joinFab = createFabOption('join', '<i class="fa fa-user-plus"></i>', 'Join Us');
  const chatbotFab = createFabOption('chatbot', '<i class="fa fa-comments"></i>', 'Chatbot');

  fabOptions.appendChild(contactFab);
  fabOptions.appendChild(joinFab);
  fabOptions.appendChild(chatbotFab);

  let activeModal = null;

  // Main FAB click handler
  fabMain.addEventListener('click', () => {
    fabContainer.classList.toggle('open');
    // If FABs close, also close the active modal
    if (!fabContainer.classList.contains('open') && activeModal) {
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
   * Creates a single FAB option button.
   * @param {string} id The unique ID for the button.
   * @param {string} icon The HTML for the Font Awesome icon.
   * @param {string} title The title/aria-label for accessibility.
   * @returns {HTMLButtonElement} The created button element.
   */
  function createFabOption(id, icon, title) {
    const button = document.createElement('button');
    button.className = 'fab-option';
    button.id = `fab-${id}`;
    button.innerHTML = icon;
    button.title = title;
    button.setAttribute('aria-label', title);
    return button;
  }

  /**
   * Displays the specified modal, dynamically loading it if not already present.
   * @param {string} modalId The ID of the modal to show ('contact', 'join', or 'chatbot').
   */
  async function showModal(modalId) {
    // Hide any currently active modal before showing a new one
    if (activeModal && activeModal.id !== `${modalId}-modal`) {
      hideModal(activeModal);
    }

    let modal = document.getElementById(`${modalId}-modal`);
    if (modal) {
      modal.style.display = 'flex';
      activeModal = modal;
    } else {
      // Dynamic loading logic: fetch HTML from 'fabs/' directory
      try {
        const htmlContent = await fetch(`fabs/${modalId}.html`).then(res => res.text());
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        modal = tempDiv.querySelector('.modal-container') || tempDiv.querySelector('#chatbot-container');
        if (modal) {
          modal.id = `${modalId}-modal`;
          document.body.appendChild(modal);
          if (window.initCojoinForms) {
            window.initCojoinForms();
          }
          modal.style.display = 'flex';
          activeModal = modal;

          // Add close button functionality
          const closeBtn = modal.querySelector('.modal-close');
          // For chatbot, the close button is part of the header, but we can still target it if needed
          if (closeBtn) {
            closeBtn.addEventListener('click', () => hideModal(modal));
          }
        }
      } catch (error) {
        console.error(`Failed to load modal for ${modalId}:`, error);
      }
    }
    
    // Initialize draggable on window load, then update on resize
    // This function is expected to be defined in fabs/js/cojoin.js
    if (window.initDraggableModal) {
      window.initDraggableModal(modal);
    }

    fabContainer.classList.remove('open');
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
  }

  // Handle window resizing to adjust draggable functionality
  window.addEventListener('resize', () => {
    if (activeModal && window.initDraggableModal) {
      window.initDraggableModal(activeModal);
    }
  });

});
