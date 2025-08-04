/**
 * @fileoverview Manages the Join Us form functionality.
 */
const joinForm = document.getElementById('join-form');

function generateJoinFormHtml() {
  return `
    <div class="form-pairs">
      <div><label for="join-name" data-key="form-name"></label><input id="join-name" name="name" required placeholder="Enter your name" /></div>
      <div><label for="join-email" data-key="form-email"></label><input id="join-email" type="email" name="email" required placeholder="Enter your email" /></div>
      <div><label for="join-phone" data-key="form-phone"></label><input id="join-phone" type="tel" name="phone" required placeholder="Enter your phone" /></div>
    </div>
    <div class="form-section" data-section="Skills">
      <div class="section-header"><h2>Skills</h2><div><button type="button" class="circle-btn add" title="Add field">+</button><button type="button" class="circle-btn remove" title="Remove last field">−</button></div></div>
      <div class="inputs"></div>
      <button type="button" class="accept-btn">Accept</button><button type="button" class="edit-btn" style="display:none;">Edit</button>
    </div>
    <div class="form-section" data-section="Education">
      <div class="section-header"><h2>Education</h2><div><button type="button" class="circle-btn add" title="Add field">+</button><button type="button" class="circle-btn remove" title="Remove last field">−</button></div></div>
      <div class="inputs"></div>
      <button type="button" class="accept-btn">Accept</button><button type="button" class="edit-btn" style="display:none;">Edit</button>
    </div>
    <div class="form-section" data-section="Certification">
      <div class="section-header"><h2>Certification</h2><div><button type="button" class="circle-btn add" title="Add field">+</button><button type="button" class="circle-btn remove" title="Remove last field">−</button></div></div>
      <div class="inputs"></div>
      <button type="button" class="accept-btn">Accept</button><button type="button" class="edit-btn" style="display:none;">Edit</button>
    </div>
    <div class="form-section" data-section="Hobbies">
      <div class="section-header"><h2>Hobbies</h2><div><button type="button" class="circle-btn add" title="Add field">+</button><button type="button" class="circle-btn remove" title="Remove last field">−</button></div></div>
      <div class="inputs"></div>
      <button type="button" class="accept-btn">Accept</button><button type="button" class="edit-btn" style="display:none;">Edit</button>
    </div>
    <div class="form-section">
      <h2 data-key="form-interest"></h2>
      <select id="jn-interest" name="interest" required>
        <option value="" disabled selected data-key="form-select-option"></option>
        <option value="business-operations" data-key="service-business-ops"></option>
        <option value="contact-center" data-key="service-contact-center"></option>
        <option value="it-support" data-key="service-it-support"></option>
        <option value="professional-services" data-key="service-professionals"></option>
      </select>
    </div>
    <div style="margin-top:1rem;"><label for="join-about" data-key="form-about"></label><textarea id="join-about" name="about" rows="4" placeholder="Tell us about yourself..."></textarea></div>
    <div class="modal-footer"><button type="submit" class="submit-btn" data-key="form-submit"></button></div>
  `;
}

/**
 * Handles the form submission logic for the Join Us form.
 */
async function handleJoinSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Collect dynamic fields
  const dynamicFields = ['Skills', 'Education', 'Certification', 'Hobbies'];
  dynamicFields.forEach(section => {
    const inputs = form.querySelectorAll(`[data-section="${section}"] .inputs input`);
    data[section.toLowerCase()] = Array.from(inputs).map(input => input.value);
  });

  try {
    console.log('Join form submitted:', data);
    // await fetch('https://your-form-api.workers.dev/join', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    
    alert('Thank you for your interest! We will review your application.');
    form.reset();

  } catch (error) {
    console.error('Join form submission failed:', error);
    alert('There was an error submitting your form. Please try again.');
  }
}

/**
 * Adds a new input field to a dynamic section.
 */
function addField(section) {
  const inputsContainer = section.querySelector('.inputs');
  const input = document.createElement('input');
  input.type = 'text';
  inputsContainer.appendChild(input);
}

/**
 * Removes the last input field from a dynamic section.
 */
function removeField(section) {
  const inputsContainer = section.querySelector('.inputs');
  if (inputsContainer.children.length > 0) {
    inputsContainer.removeChild(inputsContainer.lastChild);
  }
}

export function setupJoinForm() {
  if (joinForm) {
    joinForm.innerHTML = generateJoinFormHtml();

    joinForm.querySelectorAll('.form-section').forEach(section => {
      const addBtn = section.querySelector('.add');
      const removeBtn = section.querySelector('.remove');
      const acceptBtn = section.querySelector('.accept-btn');
      const editBtn = section.querySelector('.edit-btn');
      const inputsContainer = section.querySelector('.inputs');
      const inputSection = section.querySelector('.section-header');

      addBtn.addEventListener('click', () => addField(section));
      removeBtn.addEventListener('click', () => removeField(section));

      // Handle Accept/Edit functionality
      acceptBtn.addEventListener('click', () => {
        section.querySelectorAll('input').forEach(input => input.disabled = true);
        inputSection.style.display = 'none';
        acceptBtn.style.display = 'none';
        editBtn.style.display = 'inline-block';
      });

      editBtn.addEventListener('click', () => {
        section.querySelectorAll('input').forEach(input => input.disabled = false);
        inputSection.style.display = 'flex';
        editBtn.style.display = 'none';
        acceptBtn.style.display = 'inline-block';
      });

      // Add one default field on load
      addField(section);
    });

    joinForm.addEventListener('submit', handleJoinSubmit);
  }
}
