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

  // Build the modal HTML
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
      <a href="${serviceData.learn}" class="modal-btn cta">Learn More</a>
    </div>
  `;

  // Append modal to the DOM
  modalBackdrop.appendChild(modalContent);
  modalRoot.appendChild(modalBackdrop);

  // Add event listener to close button
  modalContent.querySelector('.close-modal').addEventListener('click', () => {
    modalRoot.innerHTML = '';
  });

  // Close modal when clicking outside of it
  modalBackdrop.addEventListener('click', (event) => {
    if (event.target === modalBackdrop) {
      modalRoot.innerHTML = '';
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
