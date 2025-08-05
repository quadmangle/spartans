// This file contains the main logic for page-specific dynamic content and modals.

// Grab the translation data from langtheme.js (which is loaded first)
// The `translations` object contains all service card and modal data.
// We assume `translations` and `currentLanguage` are globally available after langtheme.js loads.

const CHATBOT_SNIPPET_URL = 'chatbot.html';
const CHATBOT_RATE_LIMIT_MS = 5000;
let lastChatbotLaunch = 0;

function createServiceCards(services, lang) {
  const container = document.getElementById('cards-section');
  if (!container) return; // Only run this on the index page

  // Clear any existing content
  container.innerHTML = '';

  Object.keys(services).forEach(key => {
    const serviceData = services[key];
    const cardData = serviceData[lang];

    // Create a new card element
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-service-key', key);

    // Build the inner HTML for the card
    card.innerHTML = `
      <div class="title">${cardData.title}</div>
      <div class="icon">${serviceData.icon}</div>
      <div class="content">${cardData.desc}</div>
    `;

    // Add the card to the container
    container.appendChild(card);
  });
}

function createModal(serviceKey, lang) {
  const modalRoot = document.getElementById('modal-root');
  const serviceData = translations.services[serviceKey];
  const modalData = serviceData[lang].modal;

  if (!modalData) return;

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'ops-modal';

  // Build the modal HTML with new buttons in the footer
  modalContent.innerHTML = `
    <button class="close-modal" aria-label="Close modal">×</button>
    <div class="modal-header">
      <img src="${serviceData.img}" alt="${modalData.imgAlt}" class="modal-img">
      <h3 class="modal-title">${modalData.title}</h3>
    </div>
    <div class="modal-content-body">
      <p>${modalData.content}</p>
      <ul class="modal-features">
        ${modalData.features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
    </div>
    <div class="modal-actions">
      <a href="${serviceData.learn}" class="modal-btn" data-key="modal-learn-more"></a>
      <a href="#" id="ask-chattia-btn" class="modal-btn" data-key="modal-ask-chattia"></a>
      <a href="#" id="join-us-btn" class="modal-btn" data-key="modal-join-us"></a>
      <a href="#" id="contact-us-btn" class="modal-btn" data-key="modal-contact-us"></a>
    </div>

  // Append modal directly to the modal root
  modalRoot.appendChild(modalContent);

  // Make the modal draggable
  makeDraggable(modalContent);

  // Update button text with translations
  updateModalContent(modalContent, lang);

  // Add event listeners for new buttons
  const askChattiaBtn = document.getElementById('ask-chattia-btn');
  askChattiaBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openChatbotModal('service-modal');
    closeModal();
    openChattiaModal();
  });

  const joinUsBtn = document.getElementById('join-us-btn');
  joinUsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
    openJoinModal();
  });

  const contactBtn = document.getElementById('contact-us-btn');
  contactBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openContactModal();
    closeModal();
  });

  // Add event listener to close button
  modalContent.querySelector('.close-modal').addEventListener('click', closeModal);

  // Close modal on Escape key
  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  };
  document.addEventListener('keydown', handleKeydown);

  // Close modal when clicking outside of it
  function handleOutsideClick(event) {
    if (!modalContent.contains(event.target)) {
      closeModal();
    }
  }
  document.addEventListener('click', handleOutsideClick);

  function closeModal() {
    modalRoot.innerHTML = '';
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('keydown', handleKeydown);
  }
}

function openChattiaModal() {
  const modalRoot = document.getElementById('modal-root');
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';

  const modalContent = document.createElement('div');
  modalContent.className = 'ops-modal';
  modalContent.id = 'chattia-modal';
  modalContent.innerHTML = `
    <button class="close-modal" aria-label="Close modal">×</button>
    <div class="modal-content-body">
      <p data-key="modal-chattia-loading">Launching Chatbot...</p>
    </div>
  `;

  modalBackdrop.appendChild(modalContent);
  modalRoot.appendChild(modalBackdrop);

  makeDraggable(modalContent);
  updateModalContent(modalContent, currentLanguage);

  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  };
  document.addEventListener('keydown', handleKeydown);

  modalContent.querySelector('.close-modal').addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });

  function closeModal() {
    modalRoot.innerHTML = '';
    document.removeEventListener('keydown', handleKeydown);
  }
}

function openJoinUsModal() {
  const modalRoot = document.getElementById('modal-root');
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';

  const modalContent = document.createElement('div');
  modalContent.className = 'ops-modal';
  modalContent.id = 'join-us-modal';
  modalContent.innerHTML = `
    <button class="close-modal" aria-label="Close modal">×</button>
    <div class="modal-content-body">
      <p data-key="modal-joinus-loading">Opening Join Us form...</p>
    </div>
  `;

  modalBackdrop.appendChild(modalContent);
  modalRoot.appendChild(modalBackdrop);

  makeDraggable(modalContent);
  updateModalContent(modalContent, currentLanguage);

  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  };
  document.addEventListener('keydown', handleKeydown);

  modalContent.querySelector('.close-modal').addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });

  function closeModal() {
    modalRoot.innerHTML = '';
    document.removeEventListener('keydown', handleKeydown);
  }
}

function makeDraggable(modal) {
  const header = modal.querySelector('.modal-header');
  if (!header) return;

  let isDragging = false;
  let offsetX, offsetY;

  header.addEventListener('mousedown', (e) => {
    isDragging = true;

    // We calculate the offset from the top-left of the modal.
    // This prevents the modal from "jumping" to the cursor position.
    offsetX = e.clientX - modal.offsetLeft;
    offsetY = e.clientY - modal.offsetTop;

    // The transform is removed to allow for smooth dragging based on top/left.
    modal.style.transform = 'none';

    // We add the listeners to the document so that dragging continues
    // even if the cursor moves outside the modal header.
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;

    // Prevent text selection during drag
    e.preventDefault();

    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;

    modal.style.left = `${newX}px`;
    modal.style.top = `${newY}px`;
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }
}

// Export the draggable helper for other modules
window.makeDraggable = makeDraggable;

// Helper function to update content inside the modal after creation
function updateModalContent(modalElement, lang) {
  const elements = modalElement.querySelectorAll('[data-key]');
  elements.forEach(el => {
    const key = el.getAttribute('data-key');
    const translation = translations[lang][key];
    if (translation) {
      el.textContent = translation;
    }
  });
}

function auditLog(event, details = {}) {
  const payload = { event, details, timestamp: new Date().toISOString() };
  console.log('audit', payload);
  if (location.protocol === 'https:') {
    fetch('https://example.com/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(payload)
    }).catch(() => {});
  }
}

function openChatbotModal(source = 'unknown') {
  if (Date.now() - lastChatbotLaunch < CHATBOT_RATE_LIMIT_MS) {
    console.warn('Chatbot modal rate limited');
    return;
  }
  lastChatbotLaunch = Date.now();

  if (location.protocol !== 'https:') {
    console.warn('Chatbot requires HTTPS');
    return;
  }

  auditLog('chatbot_open', { source });

  fetch(CHATBOT_SNIPPET_URL, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    cache: 'no-cache'
  })
    .then(res => res.text())
    .then(html => {
      const backdrop = document.createElement('div');
      backdrop.id = 'chatbot-modal';
      backdrop.className = 'modal-backdrop';

      const content = document.createElement('div');
      content.className = 'chatbot-modal-content';
      content.innerHTML = `<button class="chatbot-close" aria-label="Close chatbot">×</button>${html}`;

      backdrop.appendChild(content);
      document.body.appendChild(backdrop);

      const closeModal = () => {
        auditLog('chatbot_close', { source });
        document.removeEventListener('keydown', handleKeydown);
        backdrop.remove();
      };
      const handleKeydown = (e) => {
        if (e.key === 'Escape') {
          closeModal();
        }
      };
      document.addEventListener('keydown', handleKeydown);

      content.querySelector('.chatbot-close').addEventListener('click', closeModal);
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
      });
    })
    .catch(err => console.error('Chatbot failed to load', err));
}

async function openContactModal() {
  let modal = document.getElementById('contact-modal');

  if (!modal) {
    const response = await fetch('contactus.html', { mode: 'same-origin' });
    const html = await response.text();
    const container = document.createElement('div');
    container.innerHTML = html.trim();
    modal = container.firstElementChild;
    document.body.appendChild(modal);

    const form = modal.querySelector('form');
    form.addEventListener('submit', handleFormSubmit);
    modal.querySelector('.close-modal').addEventListener('click', () => modal.close());
  }

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      modal.close();
    }
  };
  const handleOutsideClick = (e) => {
    if (e.target === modal) {
      modal.close();
    }
  };
  modal.addEventListener('keydown', handleKeydown);
  modal.addEventListener('click', handleOutsideClick);

  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', 'true');
  }

  modal.addEventListener('close', () => {
    modal.removeEventListener('keydown', handleKeydown);
    modal.removeEventListener('click', handleOutsideClick);
  }, { once: true });
}

// Function to handle form submission (prevents default behavior)
async function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const sanitized = {};
  formData.forEach((value, key) => {
    sanitized[key] = sanitizeInput(value);
  });

  try {
    await fetch('https://example.com/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify(sanitized)
    });
    alert('Thank you for your submission!');
    event.target.reset();
    const dialog = event.target.closest('dialog');
    if (dialog) {
      dialog.close();
    } else {
      const modal = event.target.closest('.ops-modal');
      if (modal) {
        modal.remove();
      }
    }
  } catch (err) {
    console.error('Form submission failed:', err);
    alert('Unable to submit form at this time.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // --- Main Page Logic ---
  // Generate service cards on the main page dynamically
  createServiceCards(translations.services, currentLanguage);

  // Event listener for dynamically created cards
  const cardsContainer = document.getElementById('cards-section');
  if (cardsContainer) {
    cardsContainer.addEventListener('click', (event) => {
      const card = event.target.closest('.card');
      if (card) {
        const serviceKey = card.getAttribute('data-service-key');
        createModal(serviceKey, currentLanguage);
      }
    });
  }

  const chatbotFab = document.getElementById('chatbot-fab');
  if (chatbotFab) {
    chatbotFab.addEventListener('click', () => openChatbotModal('fab'));
  }

  const chatbotMenuLink = document.getElementById('chatbot-menu-link');
  if (chatbotMenuLink) {
    chatbotMenuLink.addEventListener('click', (e) => {
      e.preventDefault();
      openChatbotModal('mobile-menu');
    });
  }

  // --- Form Submission Logic ---
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });

  const fabJoin = document.getElementById('fab-join');
  if (fabJoin) {
    fabJoin.addEventListener('click', (e) => {
      e.preventDefault();
      openJoinModal();
    });
  }

  const mobileJoin = document.getElementById('join-nav-mobile');
  if (mobileJoin) {
    mobileJoin.addEventListener('click', (e) => {
      e.preventDefault();
      openJoinModal();
    });
  }
});
