const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// helper to load DOM with optional viewport width
function setupDom(width = 500) {
  const html = `<!DOCTYPE html><html><head></head><body>
    <nav class="ops-nav">
      <div class="nav-links" id="primary-nav">
        <a href="#" class="nav-link">Home</a>
        <a href="#" class="nav-link">About</a>
      </div>
      <div class="toggles"></div>
      <button class="nav-menu-toggle" aria-expanded="false" aria-controls="primary-nav">Menu</button>
    </nav>
  </body></html>`;

  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true });

  // emulate viewport width and simple matchMedia
  Object.defineProperty(dom.window, 'innerWidth', { value: width, configurable: true });
  dom.window.matchMedia = query => ({
    matches: width <= 768 && /max-width:\s*768px/.test(query),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });

  // inject CSS so computed styles are available
  const styleEl = dom.window.document.createElement('style');
  styleEl.textContent = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  dom.window.document.head.appendChild(styleEl);

  // load nav script
  const script = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
  dom.window.eval(script);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded', { bubbles: true }));
  return dom;
}

test('nav-menu-toggle visible and operable at mobile widths', () => {
  const dom = setupDom(600); // below 768px
  const doc = dom.window.document;
  const toggle = doc.querySelector('.nav-menu-toggle');
  const primaryNav = doc.getElementById('primary-nav');

  // presence and initial attributes
  assert.ok(toggle, 'toggle exists');
  assert.strictEqual(toggle.getAttribute('aria-expanded'), 'false');
  assert.notStrictEqual(dom.window.getComputedStyle(toggle).display, 'none', 'toggle visible');

  // click to open
  toggle.click();
  assert.strictEqual(toggle.getAttribute('aria-expanded'), 'true');
  assert.ok(primaryNav.classList.contains('open'));

  // click to close again
  toggle.click();
  assert.strictEqual(toggle.getAttribute('aria-expanded'), 'false');
  assert.ok(!primaryNav.classList.contains('open'));
});

test('nav-menu-toggle hidden on desktop widths', () => {
  const dom = setupDom(1024); // above 768px
  const doc = dom.window.document;
  const toggle = doc.querySelector('.nav-menu-toggle');

  assert.ok(toggle, 'toggle exists');
  assert.strictEqual(dom.window.getComputedStyle(toggle).display, 'none', 'toggle hidden');
  assert.strictEqual(toggle.getAttribute('aria-expanded'), 'false');
});

test('nav-menu-toggle CSS visibility rules', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  // hidden by default
  assert.match(css, /\.nav-menu-toggle\s*{\s*display:\s*none;\s*}/);
  // visible within the max-width: 768px media query
  assert.match(css, /@media\s*\(max-width:\s*768px\)[^]*?\.nav-menu-toggle\s*{[^}]*display:\s*(block|flex);?/);
});
