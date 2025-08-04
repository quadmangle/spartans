/**
 * @fileoverview The main application entry point. This file orchestrates all
 * the other modular scripts and sets up the website on page load.
 */
import { services } from './scripts/app-data.js';
import { applyTranslations } from './scripts/interactions/toggles.js';
import { openModal } from './scripts/interactions/modals.js';
import { setupMobileNav } from './scripts/interactions/mobile-nav.js';
import { setupChatbot } from './scripts/components/chatbot.js';
import { setupContactForm } from './scripts/components/contact-form.js';
import { setupJoinForm } from './scripts/components/join-form.js';

// Global variable for current language, initialized in toggles.js
declare var currentLanguage: string;

/**
 * Dynamically generates the service cards based on the data in app-data.js.
 */
function createServiceCards() {
  const container = document.getElementById('cards-section');
  if (!container) return;
  container.innerHTML = '';
  
  // Create cards from the services object.
  Object.keys(services).forEach(key => {
    const serviceData = services[key];
    const cardData = serviceData[currentLanguage || 'en']; // Use current language or fallback to 'en'
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

/**
 * Initializes all the components of the website.
 */
function initApp() {
  // Setup core functionalities first.
  applyTranslations();
  createServiceCards();
  setupMobileNav();

  // Setup modals and forms.
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
        // A placeholder for showing a dynamic modal with service details.
        // For a real app, this would dynamically generate content for a single modal.
        console.log(`Open modal for service: ${serviceKey}`);
        // openModal('dynamic-service-modal');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initApp);
