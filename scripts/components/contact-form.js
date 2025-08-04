/**
 * @fileoverview Manages the Contact Us form functionality.
 */
const contactForm = document.getElementById('contact-form');

function generateContactFormHtml() {
  return `
    <div class="form-row">
      <div class="form-cell"><label for="contact-name" data-key="form-name"></label><input id="contact-name" name="name" required placeholder="Enter your name" /></div>
      <div class="form-cell"><label for="contact-email" data-key="form-email"></label><input id="contact-email" type="email" name="email" required placeholder="Enter your email" /></div>
    </div>
    <div class="form-row">
      <div class="form-cell"><label for="contact-number" data-key="form-contact-number"></label><input id="contact-number" type="tel" name="phone" required placeholder="Enter your contact number" /></div>
      <div class="form-cell"><label for="contact-date" data-key="form-preferred-date"></label><input id="contact-date" type="date" name="preferredDate" required /></div>
    </div>
    <div class="form-row">
      <div class="form-cell"><label for="contact-time" data-key="form-preferred-time"></label><input id="contact-time" type="time" name="preferredTime" required /></div>
      <div class="form-cell"><label for="contact-interest" data-key="form-interest"></label><select id="contact-interest" name="interest" required><option value="" disabled selected data-key="form-select-option"></option><option value="business-operations" data-key="service-business-ops"></option><option value="contact-center" data-key="service-contact-center"></option><option value="it-support" data-key="service-it-support"></option><option value="professional-services" data-key="service-professionals"></option></select></div>
    </div>
    <div style="margin-top:1rem;"><label for="contact-comments" data-key="form-comments"></label><textarea id="contact-comments" name="comments" rows="4" placeholder="What service are you interested in?"></textarea></div>
    <div class="modal-footer"><button type="submit" class="submit-btn" data-key="form-send"></button></div>
  `;
}

/**
 * Handles the form submission logic. In a real-world scenario, this would send data to a backend.
 */
async function handleContactSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    // --- Security Best Practices ---
    // In a real application, you would implement CSRF tokens and server-side validation.
    // For this example, we'll just log the data and show a success message.

    console.log('Contact form submitted:', data);
    // await fetch('https://your-form-api.workers.dev/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    
    alert('Thank you for contacting us! We will be in touch shortly.');
    form.reset();
    
  } catch (error) {
    console.error('Contact form submission failed:', error);
    alert('There was an error submitting your form. Please try again.');
  }
}

export function setupContactForm() {
  if (contactForm) {
    contactForm.innerHTML = generateContactFormHtml();
    contactForm.addEventListener('submit', handleContactSubmit);
  }
}
