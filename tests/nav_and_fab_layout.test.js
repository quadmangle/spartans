const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');

// Ensure FAB container positioning
test('fab stack uses safe-area margins and button sizes', () => {
  const css = fs.readFileSync(path.join(root, 'fabs', 'css', 'cojoin.css'), 'utf-8');
  const stackMatch = css.match(/\.fab-stack\s*{[\s\S]*?}/);
  assert.ok(stackMatch, 'fab-stack styles not found');
  const stackBlock = stackMatch[0];
  assert.ok(/position:\s*fixed/.test(stackBlock), 'fab stack should be fixed');
  assert.ok(/bottom:\s*calc\(env\(safe-area-inset-bottom\) \+ 16px\)/.test(stackBlock), 'bottom margin should use safe-area inset');
  assert.ok(/right:\s*calc\(env\(safe-area-inset-right\) \+ 16px\)/.test(stackBlock), 'right margin should use safe-area inset');

  const btnMatch = css.match(/\.fab\s*{[\s\S]*?}/);
  assert.ok(btnMatch, 'fab styles not found');
  const btnBlock = btnMatch[0];
  const width = parseInt(btnBlock.match(/width:\s*(\d+)px/)[1], 10);
  const height = parseInt(btnBlock.match(/height:\s*(\d+)px/)[1], 10);
  assert.ok(width >= 48, 'fab width should be at least 48px');
  assert.ok(height >= 48, 'fab height should be at least 48px');
});

test('fab stack renders buttons in order', () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { runScripts: 'dangerously', url: 'http://localhost' });
  const { window } = dom;
  Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
  window.fetch = async () => ({ text: async () => '<div></div>' });
  const code = fs.readFileSync(path.join(root, 'cojoinlistener.js'), 'utf-8');
  window.eval(code);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  const ids = Array.from(window.document.querySelectorAll('.fab')).map(b => b.id);
  assert.deepStrictEqual(ids, ['fab-contact', 'fab-join', 'fab-chatbot', 'fab-menu']);
});

test('nav toggles remain visible without shrinking', () => {
  const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf-8');
  const toggles = css.match(/\.toggles\s*{[\s\S]*?}/);
  assert.ok(toggles, 'toggles styles not found');
  assert.ok(/flex-shrink:\s*0/.test(toggles[0]), 'toggles should not shrink');
  const btn = css.match(/\.toggle-btn\s*{[\s\S]*?}/);
  assert.ok(btn, 'toggle-btn styles not found');
  assert.ok(/white-space:\s*nowrap/.test(btn[0]), 'toggle buttons should not wrap');
});

// Ensure clicking outside or on backdrop closes mobile menu
test('mobile menu closes on backdrop or outside click', async () => {
  const html = `<!DOCTYPE html><html><body>
    <nav class="ops-nav">
      <a href="#" class="ops-logo">OPS</a>
      <div class="nav-links" id="primary-nav">
        <a href="#" class="nav-link">Home</a>
      </div>
      <div class="toggles">
        <button type="button" class="toggle-btn lang-toggle">EN</button>
        <button type="button" class="toggle-btn theme-toggle">Dark</button>
        <button type="button" class="toggle-btn nav-menu-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="" data-aria-label-key="aria-nav-menu">
          <i class="fa-solid fa-bars"></i><span class="sr-only">Menu</span>
        </button>
      </div>
    </nav>
    <div class="nav-backdrop" hidden></div>
  </body></html>`;

  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
  const { window } = dom;
  window.translations = { services: {} };
  window.currentLanguage = 'en';
  window.fetch = async () => ({ json: async () => ({ token: 'test' }) });
  Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
  const script = fs.readFileSync(path.join(root, 'js', 'main.js'), 'utf-8');
  window.eval(script);
  // The DOMContentLoaded handler in main.js executes immediately
  // in this test environment because the document is already loaded.
  await new Promise(r => setImmediate(r));
  const toggle = window.document.querySelector('.nav-menu-toggle');
  const navLinks = window.document.querySelector('.nav-links');
  const backdrop = window.document.querySelector('.nav-backdrop');

  // Trigger menu via non-bubbling click so the document-level
  // outside-click handler doesn't fire during the same event cycle.
  toggle.dispatchEvent(new window.MouseEvent('click'));
  assert.ok(navLinks.classList.contains('open'), 'menu should open');
  assert.ok(backdrop.classList.contains('open'), 'backdrop should be visible when menu opens');
  backdrop.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  assert.ok(!navLinks.classList.contains('open'), 'menu should close on backdrop click');
  toggle.dispatchEvent(new window.MouseEvent('click'));
  assert.ok(navLinks.classList.contains('open'), 'menu should reopen');
  window.document.body.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  assert.ok(!navLinks.classList.contains('open'), 'menu should close on outside click');
});
