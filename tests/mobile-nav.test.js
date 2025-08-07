const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

// Helper to extract a CSS block given a selector within a media query
function getMediaBlock(css, query) {
  const start = css.indexOf(query);
  if (start === -1) return '';
  const open = css.indexOf('{', start);
  let depth = 1;
  let i = open + 1;
  for (; i < css.length && depth > 0; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
  }
  return css.slice(open + 1, i - 1);
}

// Verify CSS rules for mobile navigation

test('mobile nav links hidden by default and scrollable when opened', () => {
  const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf-8');
  const block = getMediaBlock(css, '@media (max-width: 768px)');
  assert.notStrictEqual(block, '', 'mobile media query missing');

  const navLinksMatch = block.match(/\.nav-links\s*{[^}]*}/);
  assert.ok(navLinksMatch, '.nav-links rule missing');
  const navLinks = navLinksMatch[0];
  assert.ok(navLinks.includes('display: none'), 'nav links should be hidden by default');
  assert.ok(navLinks.includes('flex-direction: row'), 'nav links should arrange items horizontally');
  assert.ok(navLinks.includes('overflow-x: auto'), 'nav links should allow horizontal scrolling');
  assert.ok(navLinks.includes('white-space: nowrap'), 'nav links should prevent wrapping');
  assert.ok(navLinks.includes('-webkit-overflow-scrolling: touch'), 'nav links should support touch momentum scrolling');

  const openMatch = block.match(/\.nav-links\.open\s*{[^}]*}/);
  assert.ok(openMatch, '.nav-links.open rule missing');
  const navOpen = openMatch[0];
  assert.ok(navOpen.includes('display: flex'), 'nav links should be visible when open');
});

// Verify HTML structure defaults (nav links closed)
const pages = ['index.html', 'contact-center.html', 'it-support.html', 'professional-services.html'];
for (const page of pages) {
  test(`nav links closed by default on ${page}`, () => {
    const html = fs.readFileSync(path.join(root, page), 'utf-8');
    // allow additional attributes (e.g., id="primary-nav") after the class
    assert.match(html, /<div class="nav-links"[^>]*>/);
    assert.ok(!/<div class="nav-links open"/.test(html), 'nav links should not be open by default');
  });
}

