// This file contains the main logic for page-specific dynamic content and modals.

// Grab the translation data from langtheme.js (which is loaded first)
// The `translations` object contains all service card and modal data.
// We assume `translations` and `currentLanguage` are globally available after langtheme.js loads.

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

  // Create modal backdrop and content
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';

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
  `;

  // Append modal to the DOM
  modalBackdrop.appendChild(modalContent);
  modalRoot.appendChild(modalBackdrop);

  // Make the modal draggable
  makeDraggable(modalContent);

  // Update button text with translations
  updateModalContent(modalContent, lang);

  // Add event listeners for new buttons
  // Note: These are placeholders. You will need to replace the `console.log` calls
  // with actual calls to your Cloudflare Workers or other services.
  const askChattiaBtn = document.getElementById('ask-chattia-btn');
  askChattiaBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Redirecting to Chatbot via Cloudflare Worker...');
    alert('Launching Chatbot...');
    closeModal();
  });

  const joinUsBtn = document.getElementById('join-us-btn');
  joinUsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Redirecting to Join Us form via Cloudflare Worker...');
    alert('Launching Join Us form...');
    closeModal();
  });

  const contactBtn = document.getElementById('contact-us-btn');
  contactBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openContactModal();
    closeModal();
  });
  
  // Add event listener to close button
  modalContent.querySelector('.close-modal').addEventListener('click', closeModal);

  // Close modal when clicking outside of it
  modalBackdrop.addEventListener('click', (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });

  function closeModal() {
    modalRoot.innerHTML = '';
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

function sanitizeInput(str) {
  return str.replace(/[&<>"']/g, (char) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return map[char];
  });
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

  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', 'true');
  }
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

  // --- Form Submission Logic ---
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });
});
