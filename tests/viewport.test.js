const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');

test('viewport.js sets --vh on load and updates on resize', () => {
  const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
    runScripts: 'dangerously',
    url: 'http://localhost'
  });
  const { window } = dom;
  Object.defineProperty(window, 'innerHeight', { value: 650, configurable: true });
  const script = fs.readFileSync(path.join(root, 'js', 'viewport.js'), 'utf8');
  window.eval(script);
  const style = window.document.documentElement.style;
  assert.strictEqual(style.getPropertyValue('--vh'), '6.5px');

  Object.defineProperty(window, 'innerHeight', { value: 720, configurable: true });
  window.dispatchEvent(new window.Event('resize'));
  assert.strictEqual(style.getPropertyValue('--vh'), '7.2px');
});

  test('page and modal styles rely on --vh variable', () => {
  const globalCss = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf8');
  const bodyMatch = globalCss.match(/body\s*{[\s\S]*?}/);
  assert.ok(bodyMatch, 'body styles not found');
  assert.ok(/min-height:\s*calc\(var\(--vh, 1vh\) \* 100\)/.test(bodyMatch[0]), 'body should use --vh for min-height');
  const modalMatch = globalCss.match(/\.ops-modal\s*{[\s\S]*?}/);
  assert.ok(modalMatch, 'ops-modal styles not found');
  assert.ok(/max-height:\s*calc\(var\(--vh, 1vh\) \* 80\)/.test(modalMatch[0]), 'ops-modal should use --vh for max-height');
    const chatbotCss = fs.readFileSync(path.join(root, 'fabs', 'css', 'chatbot.css'), 'utf8');
    assert.ok(/height:\s*85dvh/.test(chatbotCss), 'chatbot modal should use dvh');
    assert.ok(/height:\s*100dvh/.test(chatbotCss), 'chatbot modal should expand using dvh on small viewports');
    assert.ok(/#modal-chatbot\.is-visible\s*{[\s\S]*display\s*:\s*flex/.test(chatbotCss), 'chatbot modal should display when visible');
    const cojoinCss = fs.readFileSync(path.join(root, 'fabs', 'css', 'cojoin.css'), 'utf8');
    assert.ok(/height:\s*calc\(var\(--vh, 1vh\) \* 80\)/.test(cojoinCss), 'cojoin modal should use --vh');
    assert.ok(/height:\s*calc\(var\(--vh, 1vh\) \* 100\)/.test(cojoinCss), 'cojoin modal should expand using --vh on mobile');
});
