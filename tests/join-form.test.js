const test = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');

function setupDom(html) {
  const dom = new JSDOM(html);
  global.window = dom.window;
  global.document = dom.window.document;
  global.alert = () => {};
  global.fetch = () => Promise.resolve({ ok: true });
  return dom;
}

test('Experience section adds numbered textareas', () => {
  const dom = setupDom(`
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
  `);
  delete require.cache[require.resolve('../fabs/js/cojoin.js')];
  require('../fabs/js/cojoin.js');
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  const addBtn = dom.window.document.querySelector('.form-section[data-section="Experience"] .circle-btn.add');
  addBtn.click();
  addBtn.click();
  const placeholders = [...dom.window.document.querySelectorAll('.form-section[data-section="Experience"] textarea')].map(el => el.placeholder);
  assert.deepStrictEqual(placeholders, ['tell us about your Experience 1', 'tell us about your Experience 2']);
  delete global.window;
  delete global.document;
  delete global.alert;
  delete global.fetch;
});

test('Continued Education section adds textarea with specific placeholder', () => {
  const dom = setupDom(`
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
  `);
  delete require.cache[require.resolve('../fabs/js/cojoin.js')];
  require('../fabs/js/cojoin.js');
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  const addBtn = dom.window.document.querySelector('.form-section[data-section="Continued Education"] .circle-btn.add');
  addBtn.click();
  const textarea = dom.window.document.querySelector('.form-section[data-section="Continued Education"] textarea');
  assert.strictEqual(textarea.placeholder, 'Online Courses, Seminars, Webinars with Completion Certification');
  delete global.window;
  delete global.document;
  delete global.alert;
  delete global.fetch;
});

