/**
 * fabs/js/cojoin.js
 *
 * This script contains the logic for both the Contact Us and Join Us forms.
 * It handles form submission, security checks (honeypot, malicious code),
 * and the dynamic form fields for the Join form.
 */

document.addEventListener('DOMContentLoaded', () => {

  const contactForm = document.getElementById('contactForm');
  const joinForm = document.getElementById('joinForm');

  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
  }

  if (joinForm) {
    joinForm.addEventListener('submit', handleJoinSubmit);
    initJoinForm();
  }

  /**
   * Enables draggable functionality for modals on large screens.
   * @param {HTMLElement} modal The modal element to make draggable.
   */
  function makeDraggable(modal) {
    // Only make draggable on larger screens where there is enough space.
    if (window.innerWidth < 768) {
      return;
    }

    let isDragging = false;
    let offsetX, offsetY;

    const modalHeader = modal.querySelector('.modal-header') || modal.querySelector('#chatbot-header');
    if (!modalHeader) return;

    modalHeader.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - modal.getBoundingClientRect().left;
      offsetY = e.clientY - modal.getBoundingClientRect().top;
      modal.style.cursor = 'grabbing';
      modal.style.transition = 'none'; // Disable transition while dragging
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;

      modal.style.left = `${newX}px`;
      modal.style.top = `${newY}px`;
      modal.style.transform = 'none';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      modal.style.cursor = 'move';
      modal.style.transition = 'transform 0.3s ease'; // Re-enable transition
    });
  }

  // Expose the draggable function globally for use by the listener script
  window.initDraggableModal = makeDraggable;

  /**
   * Sanitizes input to prevent malicious code injection.
   * This is a simple client-side check and not a replacement for server-side validation.
   * @param {string} input The string to sanitize.
   * @returns {string} The sanitized string.
   */
  function sanitizeInput(input) {
    // Regex to find common malicious patterns
    const maliciousPatterns = /<script.*?>.*?<\/script>|javascript:|on\w+=|onerror=|onload=|<\w+[^>]*\s+[^>]*on\w+=/ig;
    let sanitized = input.replace(maliciousPatterns, '');

    // Also escape common characters to prevent XSS
    sanitized = sanitized.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return sanitized;
  }

  /**
   * Simulated function to send data to a Cloudflare worker.
   * This is where you would implement your data encryption logic before sending.
   * @param {object} data The sanitized form data to send.
   */
  async function sendToCloudflareWorker(data) {
    console.log("Data is clean. Encrypting and sending to Cloudflare worker...", data);
    try {
      const response = await fetch('https://your-cloudflare-worker.example.com/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Data successfully sent and processed by Cloudflare worker.');
      } else {
        console.error('Failed to send data to Cloudflare worker.');
      }
    } catch (error) {
      console.error('Network error or worker unreachable:', error);
    }
  }

  /**
   * Contact Us form submission handler.
   * @param {Event} e The form submission event.
   */
  async function handleContactSubmit(e) {
    e.preventDefault();

    // 1. Honeypot check: Block if this hidden field is filled
    const honeypotField = document.getElementById('honeypot-contact');
    if (honeypotField && honeypotField.value !== '') {
      console.warn('Honeypot filled. Blocking form submission.');
      e.target.reset(); // Reset form to clear any malicious data
      return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // 2. Malicious code check and sanitization
    const sanitizedData = {};
    for (const key in data) {
      const sanitizedValue = sanitizeInput(data[key]);
      sanitizedData[key] = sanitizedValue;
    }
    
    // 3. Prepare and send sanitized data to worker
    alert('Contact form submitted successfully!');
    await sendToCloudflareWorker(sanitizedData);
    form.reset();
  }

  /**
   * Join Us form submission handler.
   * @param {Event} e The form submission event.
   */
  async function handleJoinSubmit(e) {
    e.preventDefault();

    // 1. Honeypot check
    const honeypotField = document.getElementById('honeypot-join');
    if (honeypotField && honeypotField.value !== '') {
      console.warn('Honeypot filled. Blocking form submission.');
      e.target.reset();
      return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Check that all dynamic sections are 'accepted' or empty
    const formSections = document.querySelectorAll('.form-section[data-section]');
    for (const section of formSections) {
      const inputs = section.querySelectorAll('input[type=text]');
      if (inputs.length > 0 && !section.classList.contains('completed')) {
        alert(`Please accept your entries in "${section.querySelector('h2').textContent}" or remove them.`);
        return;
      }
    }

    // 2. Malicious code check and sanitization
    const sanitizedData = {};
    for (const key in data) {
      const sanitizedValue = sanitizeInput(data[key]);
      sanitizedData[key] = sanitizedValue;
    }

    // 3. Prepare and send sanitized data to worker
    alert('Join form submitted successfully!');
    await sendToCloudflareWorker(sanitizedData);
    form.reset();
    resetJoinFormState();
  }

  /**
   * Initializes event listeners for the Join Us form's dynamic sections.
   */
  function initJoinForm() {
    const formSections = document.querySelectorAll('.form-section[data-section]');
    formSections.forEach(section => {
      const addBtn = section.querySelector('.circle-btn.add');
      const removeBtn = section.querySelector('.circle-btn.remove');
      const acceptBtn = section.querySelector('.accept-btn');
      const editBtn = section.querySelector('.edit-btn');
      const inputsContainer = section.querySelector('.inputs');

      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const input = document.createElement('input');
          input.type = 'text';
          input.placeholder = `Enter ${section.querySelector('h2').textContent.toLowerCase()}`;
          inputsContainer.appendChild(input);
          input.focus();
        });
      }

      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          if (!section.classList.contains('completed')) {
            if (inputsContainer.lastElementChild) {
              inputsContainer.removeChild(inputsContainer.lastElementChild);
            }
          }
        });
      }

      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          const inputs = inputsContainer.querySelectorAll('input[type=text]');
          if (inputs.length === 0) {
            alert('Add at least one entry.');
            return;
          }
          for (const input of inputs) {
            if (!input.value.trim()) {
              alert('Please fill out all fields before accepting.');
              return;
            }
          }
          toggleSectionState(section, true);
        });
      }

      if (editBtn) {
        editBtn.addEventListener('click', () => {
          toggleSectionState(section, false);
        });
      }
    });
  }

  /**
   * Resets the Join Us form to its initial state after submission.
   */
  function resetJoinFormState() {
    const formSections = document.querySelectorAll('.form-section[data-section]');
    formSections.forEach(section => {
      toggleSectionState(section, false);
      const inputsContainer = section.querySelector('.inputs');
      inputsContainer.innerHTML = '';
    });
  }

  /**
   * Toggles the state of a dynamic form section (accepted/editable).
   * @param {HTMLElement} section The form section element.
   * @param {boolean} accepted True to lock the section, false to unlock.
   */
  function toggleSectionState(section, accepted) {
    const inputs = section.querySelectorAll('input[type=text]');
    const acceptBtn = section.querySelector('.accept-btn');
    const editBtn = section.querySelector('.edit-btn');
    const addBtn = section.querySelector('.circle-btn.add');
    const removeBtn = section.querySelector('.circle-btn.remove');

    inputs.forEach(input => input.disabled = accepted);

    if (accepted) {
      if (acceptBtn) acceptBtn.style.display = 'none';
      if (editBtn) editBtn.style.display = 'inline-block';
      if (addBtn) addBtn.disabled = true;
      if (removeBtn) removeBtn.disabled = true;
      section.classList.add('completed');
    } else {
      if (acceptBtn) acceptBtn.style.display = 'inline-block';
      if (editBtn) editBtn.style.display = 'none';
      if (addBtn) addBtn.disabled = false;
      if (removeBtn) removeBtn.disabled = false;
      section.classList.remove('completed');
    }
  }
});
