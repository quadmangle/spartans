import { translations, services } from './scripts/app-data.js';
import { applyTranslations } from './scripts/interactions/toggles.js';
import { openModal } from './scripts/interactions/modals.js';
import { openMobileNav, setupMobileNav } from './scripts/interactions/mobile-nav.js';
import { setupChatbot } from './scripts/components/chatbot.js';
import { setupContactForm } from './scripts/components/contact-form.js';
import { setupJoinForm } from './scripts/components/join-form.js';

// --- Core Business Logic ---
function createServiceCards() {
  const container = document.getElementById('cards-section');
  if (!container) return;
  container.innerHTML = '';
  Object.keys(services).forEach(key => {
    const serviceData = services[key];
    const cardData = serviceData[currentLanguage];
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-service-key', key);
    card.innerHTML = `
      <div class="title">${cardData.title}</div>
      <div class="icon">${serviceData.icon}</div>
      <div class="content">${cardData.desc}</div>
    `;
    container.appendChild(card);
  });
}

// --- Document Ready Handler ---
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modular components
  applyTranslations();
  createServiceCards();
  setupMobileNav();
  setupChatbot();
  setupContactForm();
  setupJoinForm();

  // Event listener for opening the service-specific modals
  const cardsContainer = document.getElementById('cards-section');
  if (cardsContainer) {
    cardsContainer.addEventListener('click', (event) => {
      const card = event.target.closest('.card');
      if (card) {
        const serviceKey = card.getAttribute('data-service-key');
        openModal('dynamic-service-modal', serviceKey);
      }
    });
  }

  // Hook up FAB buttons to open specific modals
  document.getElementById('fab-join-btn').addEventListener('click', () => openModal('join-us-modal'));
  document.getElementById('fab-contact-btn').addEventListener('click', () => openModal('contact-us-modal'));
  document.getElementById('fab-chatbot-btn').addEventListener('click', () => openModal('chatbot-modal'));
});
