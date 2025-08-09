const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

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

test('mobile menu closes on resize beyond 1024px', async () => {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>
    <button class="nav-menu-toggle"></button>
    <div class="nav-links"><a href="#">Item</a></div>
    <div class="nav-backdrop" hidden></div>
  </body></html>`, { runScripts: 'dangerously', url: 'http://localhost' });
  const { window } = dom;

  Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
  window.translations = { en: {}, services: {} };
  window.currentLanguage = 'en';
  window.crypto = { getRandomValues: arr => arr.fill(0) };
  window.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 't' }) });

  const script = fs.readFileSync(path.join(root, 'js', 'main.js'), 'utf8');
  window.eval(script);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

  const navToggle = window.document.querySelector('.nav-menu-toggle');
  const navLinks = window.document.querySelector('.nav-links');
  const navBackdrop = window.document.querySelector('.nav-backdrop');

  navToggle.focus();
  navToggle.click();
  assert.ok(navLinks.classList.contains('open'), 'menu should be open after toggle');

  Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
  window.dispatchEvent(new window.Event('resize'));

  assert.ok(!navLinks.classList.contains('open'), 'menu should close on resize');
  assert.ok(!navBackdrop.classList.contains('open'), 'backdrop should be hidden on resize');
  assert.ok(navBackdrop.hasAttribute('hidden'), 'backdrop should have hidden attribute');
  assert.strictEqual(window.document.activeElement, navToggle, 'focus should return to toggle');
});

  test('ops-nav enables horizontal scrolling when cramped', () => {
    const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf-8');
    const navMatch = css.match(/\.ops-nav\s*{[\s\S]*?}/);
    assert.ok(navMatch, '.ops-nav rules for mobile not found');
    const navBlock = navMatch[0];
    assert.ok(navBlock.includes('overflow-x: auto'), '.ops-nav should allow horizontal scrolling');
  });

  test('menu toggle hidden on wide screens', () => {
    const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf-8');
    const pattern = /@media\s*\(min-width:\s*1025px\)[\s\S]*?\.nav-menu-toggle\s*{[^}]*display:\s*none/;
    assert.ok(pattern.test(css), 'nav menu toggle should be hidden on wide screens');
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

