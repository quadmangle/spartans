const test = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function setupTestEnvironment(html) {
  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  const { window } = dom;
  const { document } = window;

  // Create a sandboxed context for the script to run in
  const context = vm.createContext({
    window,
    document,
    alert: () => {},
    fetch: () => Promise.resolve({ ok: true }),
    console,
  });

  // Load and execute the cojoin.js script in the sandbox
  const scriptPath = path.resolve(__dirname, '../fabs/js/cojoin.js');
  const scriptCode = fs.readFileSync(scriptPath, 'utf8');
  vm.runInContext(scriptCode, context);

  // Dispatch DOMContentLoaded to trigger the script's initializers
  document.dispatchEvent(new window.Event('DOMContentLoaded'));

  return { window, document };
}

test('Experience section adds numbered textareas', () => {
  const html = `
    <form id="joinForm">
      <div class="form-section" data-section="Experience">
        <div class="section-header">
          <h2>Experience</h2>
          <div>
            <button type="button" class="circle-btn add" title="Add field">+</button>
            <button type="button" class="circle-btn remove" title="Remove last field">−</button>
          </div>
        </div>
        <div class="inputs"></div>
        <button type="button" class="accept-btn">Accept</button>
        <button type="button" class="edit-btn" style="display:none;">Edit</button>
      </div>
    </form>
  `;

  const { document } = setupTestEnvironment(html);

  const addBtn = document.querySelector('.form-section[data-section="Experience"] .circle-btn.add');
  addBtn.click();
  addBtn.click();
  const placeholders = [...document.querySelectorAll('.form-section[data-section="Experience"] textarea')].map(el => el.placeholder);
  assert.deepStrictEqual(placeholders, ['tell us about your Experience 1', 'tell us about your Experience 2']);
});

test('Continued Education section adds textarea with specific placeholder', () => {
  const html = `
    <form id="joinForm">
      <div class="form-section" data-section="Continued Education">
        <div class="section-header">
          <h2>Continued Education</h2>
          <div>
            <button type="button" class="circle-btn add" title="Add field">+</button>
            <button type="button" class="circle-btn remove" title="Remove last field">−</button>
          </div>
        </div>
        <div class="inputs"></div>
        <button type="button" class="accept-btn">Accept</button>
        <button type="button" class="edit-btn" style="display:none;">Edit</button>
      </div>
    </form>
  `;

  const { document } = setupTestEnvironment(html);

  const addBtn = document.querySelector('.form-section[data-section="Continued Education"] .circle-btn.add');
  addBtn.click();
  const textarea = document.querySelector('.form-section[data-section="Continued Education"] textarea');
  assert.strictEqual(textarea.placeholder, 'Online Courses, Seminars, Webinars with Completion Certification');
});
