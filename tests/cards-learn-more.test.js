const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

test('only .learn-more clicks open service modal', () => {
  const html = `<!DOCTYPE html><html><body>
    <div id="modal-root"></div>
    <section id="cards-section">
      <div class="card" data-service-key="ops">
        <button class="learn-more">Learn More</button>
      </div>
    </section>
  </body></html>`;

  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom;
  window.currentLanguage = 'en';

  const script = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
  window.eval(script);

  let called = false;
  window.createModal = () => { called = true; };

  window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));

  // click on card itself - should not open modal
  const card = window.document.querySelector('.card');
  called = false;
  card.click();
  assert.equal(called, false, 'card click should not open modal');

  // click on learn-more button - should open modal and stop bubbling
  const btn = window.document.querySelector('.learn-more');
  let bubbled = false;
  window.document.addEventListener('click', () => { bubbled = true; });
  called = false;
  btn.click();
  assert.equal(called, true, 'learn-more click should open modal');
  assert.equal(bubbled, false, 'event propagation should stop at container');
});
