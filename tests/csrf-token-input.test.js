const test = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const crypto = require('crypto');

test('forms receive csrfToken hidden input', async () => {
  const dom = new JSDOM('<form id="contact"></form>', { url: 'https://example.com' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.crypto = crypto.webcrypto;
  dom.window.crypto = crypto.webcrypto;
  const originalFetch = global.fetch;
  global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'test-token' }) });
  global.translations = { services: {} };
  global.currentLanguage = 'en';
  global.alert = () => {};

  require('../js/main.js');
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  await new Promise(resolve => setTimeout(resolve, 10));
  const hidden = dom.window.document.querySelector('input[name="csrfToken"]');
  assert.ok(hidden);
  assert.strictEqual(hidden.value, 'test-token');

  delete global.window;
  delete global.document;
  delete global.crypto;
  global.fetch = originalFetch;
  delete global.translations;
  delete global.currentLanguage;
  delete global.alert;
});
