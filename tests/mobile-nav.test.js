const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

// Verify CSS rules for mobile navigation

test('mobile nav links use off-canvas layout', () => {
  const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf-8');
  const navLinksMatch = css.match(/\.nav-links\s*{[\s\S]*?}/);
  assert.ok(navLinksMatch, 'nav links styles not found');
  const navLinks = navLinksMatch[0];
  assert.ok(navLinks.includes('position: fixed'), 'nav links should be positioned off-canvas');
  assert.ok(navLinks.includes('right: 0'), 'nav links should align to the right');
  assert.ok(navLinks.includes('transform: translateX(100%)'), 'nav links should be translated off screen');
  assert.ok(navLinks.includes('transition: transform 0.3s'), 'nav links should animate when toggled');

  const openMatch = css.match(/\.nav-links\.open\s*{[\s\S]*?transform: translateX\(0\)[^}]*}/);
  assert.ok(openMatch, 'nav links should slide in when open');
});

  test('ops-nav enables horizontal scrolling when cramped', () => {
    const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf-8');
    const navMatch = css.match(/\.ops-nav\s*{[\s\S]*?}/);
    assert.ok(navMatch, '.ops-nav rules for mobile not found');
    const navBlock = navMatch[0];
    assert.ok(navBlock.includes('overflow-x: auto'), '.ops-nav should allow horizontal scrolling');
  });

  test('menu toggle not forcibly hidden on wide screens', () => {
    const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf-8');
    assert.ok(!/\.nav-menu-toggle\s*{[^}]*display:\s*none/.test(css), 'nav menu toggle should remain visible');
  });

// Verify HTML structure defaults (nav links closed)
const pages = ['index.html', 'contact-center.html', 'it-support.html', 'professional-services.html'];
for (const page of pages) {
  test(`nav links closed by default on ${page}`, () => {
    const html = fs.readFileSync(path.join(root, page), 'utf-8');
    assert.match(html, /<div class="nav-links" id="primary-nav">/);
    assert.ok(!/<div class="nav-links open"/.test(html), 'nav links should not be open by default');
  });
  test(`mobile nav contains required controls on ${page}`, () => {
    const html = fs.readFileSync(path.join(root, page), 'utf-8');
    assert.match(html, /<a[^>]*class="[^"]*ops-logo[^"]*"/i, 'OPS logo missing');
    assert.match(html, /<button[^>]*class="[^"]*lang-toggle[^"]*"/i, 'language toggle missing');
    assert.match(html, /<button[^>]*class="[^"]*theme-toggle[^"]*"/i, 'theme toggle missing');
    assert.match(html, /<button[^>]*class="[^"]*nav-menu-toggle[^"]*"/i, 'menu toggle missing');
  });
}

