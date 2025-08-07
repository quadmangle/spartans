// This file contains the main logic for page-specific dynamic content and modals.

// Grab the translation data from langtheme.js (which is loaded first).
// The `translations` object contains all service card and modal data.
// We assume `translations` and `currentLanguage` are globally available after langtheme.js loads.

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
      <a href="${serviceData.learn}" class="modal-btn learn-more" data-key="modal-learn-more"></a>
    </div>
  `;

  // Append modal directly to the modal root
  modalRoot.appendChild(modalContent);

  // Make the modal draggable
  makeDraggable(modalContent);

  // Update button text with translations
  updateModalContent(modalContent, lang);

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

// Basic sanitization helper
function sanitizeInput(str) {
  // In a real application, we would use a library like DOMPurify here.
  // This is a placeholder to simulate the sanitization process.
  const sanitized = str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return sanitized;
}

// Function to handle form submission
  async function handleFormSubmit(event) {
    event.preventDefault();

    // Honeypot check: block bots that fill hidden fields
    const honeypot = event.target.querySelector('input[name="hp"]');
    if (honeypot && honeypot.value !== '') {
      console.warn('Honeypot filled. Blocking form submission.');
      event.target.reset();
      return;
    }

    const formData = new FormData(event.target);
    const hcaptchaResponse = formData.get('h-captcha-response');

    if (!hcaptchaResponse) {
      alert('Please complete the CAPTCHA.');
      return;
    }

    const sanitized = {};
    formData.forEach((value, key) => {
      if (key !== 'hp' && key !== 'h-captcha-response') {
        sanitized[key] = sanitizeInput(value);
      }
    });

    // Add CSRF token to the sanitized data.
    // In a real application, this token would be fetched from the server.
    sanitized.csrf_token = 'placeholder_csrf_token';

    try {
      const response = await fetch('https://example.com/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({ ...sanitized, 'h-captcha-response': hcaptchaResponse })
      });

      if (response.ok) {
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
      } else {
        alert('Form submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Form submission failed:', err);
      // In a real application, we would send this error to a logging service.
      // logError(err);
      alert('Unable to submit form at this time.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle) {
    const updateToggleVisibility = () => {
      navToggle.style.display = window.innerWidth <= 768 ? 'block' : 'none';
    };
    updateToggleVisibility();
    window.addEventListener('resize', updateToggleVisibility);
  }
  if (navToggle && navLinks) {
    let lastFocusedElement;
    let firstFocusable;
    let lastFocusable;

    function trapFocus(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      } else if (e.key === 'Escape') {
        closeMenu();
      }
    }

    function openMenu() {
      navLinks.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
      const focusable = navLinks.querySelectorAll('a, button');
      firstFocusable = focusable[0];
      lastFocusable = focusable[focusable.length - 1];
      lastFocusedElement = document.activeElement;
      if (firstFocusable) {
        firstFocusable.focus();
      }
      document.addEventListener('keydown', trapFocus);
    }

    function closeMenu() {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', trapFocus);
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    }

    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          closeMenu();
        }
      });
    });
  }

  // --- Card Learn More Buttons ---
  const learnButtons = document.querySelectorAll('#cards-section .card .learn-more');
  learnButtons.forEach(btn => {
    const card = btn.closest('.card');
    if (!card) return;
    const serviceKey = card.getAttribute('data-service-key');
    const serviceData = translations.services[serviceKey];
    if (serviceData && serviceData.learn) {
      btn.setAttribute('href', serviceData.learn);
    }
  });

  // --- Form Submission Logic ---
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });

});
