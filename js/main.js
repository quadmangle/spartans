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
  `;

  // Append modal directly to the modal root
  modalRoot.appendChild(modalContent);

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
    closeModal();
    openChatbotModal();
  });

  const joinUsBtn = document.getElementById('join-us-btn');
  joinUsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
    openJoinModal();
  });

  const contactUsBtn = document.getElementById('contact-us-btn');
  contactUsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
    openContactModal();
  });
  
  // Add event listener to close button
  modalContent.querySelector('.close-modal').addEventListener('click', closeModal);

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

// Function to handle form submission (prevents default behavior)
function handleFormSubmit(event) {
  event.preventDefault();
  // In a real application, you would send this data to a server
  console.log('Form submitted:', new FormData(event.target));
  alert('Thank you for your submission!');
  event.target.reset(); // Clear the form
}

// Open a contact form modal
function openContactModal() {
  const modalRoot = document.getElementById('modal-root');
  const modal = document.createElement('div');
  modal.className = 'ops-modal';

  modal.innerHTML = `
    <button class="close-modal" aria-label="Close modal">×</button>
    <div class="modal-header"><h3 data-key="modal-contact-us">Contact Us</h3></div>
    <div class="modal-content-body">
      <form>
        <input type="text" placeholder="" data-key="form-name" required />
        <input type="email" placeholder="" data-key="form-email" required />
        <input type="tel" placeholder="" data-key="form-phone" required />
        <input type="text" placeholder="" data-key="form-company" required />
        <button type="submit" class="submit-button" data-key="form-submit">Request Now</button>
      </form>
    </div>
  `;

  modalRoot.appendChild(modal);
  updateModalContent(modal, currentLanguage);
  makeDraggable(modal);

  modal.querySelector('form').addEventListener('submit', handleFormSubmit);
  modal.querySelector('.close-modal').addEventListener('click', () => {
    modal.remove();
  });
}

// Open a join-us form modal
function openJoinModal() {
  const modalRoot = document.getElementById('modal-root');
  const modal = document.createElement('div');
  modal.className = 'ops-modal';

  modal.innerHTML = `
    <button class="close-modal" aria-label="Close modal">×</button>
    <div class="modal-header"><h3 data-key="modal-join-us">Join Us</h3></div>
    <div class="modal-content-body">
      <form>
        <input type="text" placeholder="" data-key="form-name" required />
        <input type="email" placeholder="" data-key="form-email" required />
        <input type="tel" placeholder="" data-key="form-phone" required />
        <input type="text" placeholder="" data-key="form-company" required />
        <button type="submit" class="submit-button" data-key="form-submit">Request Now</button>
      </form>
    </div>
  `;

  modalRoot.appendChild(modal);
  updateModalContent(modal, currentLanguage);
  makeDraggable(modal);

  modal.querySelector('form').addEventListener('submit', handleFormSubmit);
  modal.querySelector('.close-modal').addEventListener('click', () => {
    modal.remove();
  });
}

// Open a simple chatbot modal
function openChatbotModal() {
  const modalRoot = document.getElementById('modal-root');
  const modal = document.createElement('div');
  modal.className = 'ops-modal';

  modal.innerHTML = `
    <button class="close-modal" aria-label="Close modal">×</button>
    <div class="modal-header"><h3 data-key="modal-ask-chattia">Ask Chattia</h3></div>
    <div class="modal-content-body chatbot-body">
      <div class="chat-log" aria-live="polite"></div>
      <form class="chat-form">
        <input type="text" aria-label="Message" placeholder="Type your message" required />
        <button type="submit">Send</button>
      </form>
    </div>
  `;

  modalRoot.appendChild(modal);
  updateModalContent(modal, currentLanguage);
  makeDraggable(modal);

  modal.querySelector('.close-modal').addEventListener('click', () => {
    modal.remove();
  });

  const chatForm = modal.querySelector('form');
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = chatForm.querySelector('input');
    const message = input.value.trim();
    if (!message) return;
    const log = modal.querySelector('.chat-log');
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.textContent = message;
    log.appendChild(userMsg);
    input.value = '';
  });
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

  // --- Modal trigger buttons ---
  const contactTriggers = [
    document.getElementById('contact-fab'),
    document.getElementById('mobile-contact-btn')
  ];
  contactTriggers.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openContactModal();
      });
    }
  });

  const joinTriggers = [
    document.getElementById('join-fab'),
    document.getElementById('mobile-join-btn')
  ];
  joinTriggers.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openJoinModal();
      });
    }
  });

  const chatbotTriggers = [
    document.getElementById('chatbot-fab'),
    document.getElementById('mobile-chatbot-btn')
  ];
  chatbotTriggers.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openChatbotModal();
      });
    }
  });
});
