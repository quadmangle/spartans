const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

for (const page of htmlFiles) {
  test(`assets referenced in ${page} exist and images have alt text`, () => {
    const htmlPath = path.join(root, page);
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const dir = path.dirname(htmlPath);

    const imgRegex = /<img\b([^>]*)>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(html))) {
      const attrs = imgMatch[1];
      const srcMatch = attrs.match(/src\s*=\s*"([^"]+)"/i);
      if (srcMatch) {
        const src = srcMatch[1];
        if (!/^https?:\/\//i.test(src)) {
          const filePath = path.resolve(dir, src);
          assert.ok(fs.existsSync(filePath), `Image file not found: ${src}`);
        }
      }
      const altMatch = attrs.match(/alt\s*=\s*"([^"]*)"/i);
      assert.ok(altMatch && altMatch[1].trim().length > 0, 'Image tag missing alt text');
    }

    const scriptRegex = /<script\b[^>]*src="([^"]+)"[^>]*>/gi;
    let scriptMatch;
    while ((scriptMatch = scriptRegex.exec(html))) {
      const src = scriptMatch[1];
      if (!/^https?:\/\//i.test(src)) {
        const filePath = path.resolve(dir, src);
        assert.ok(fs.existsSync(filePath), `Script file not found: ${src}`);
      }
    }
  });
}

function createDocumentStub() {
  const events = {};
  return {
    createElement() {
      let text = '';
      return {
        style: {},
        set textContent(v) { text = v.replace(/<[^>]*>/g, ''); },
        get textContent() { return text; },
        appendChild() {},
        querySelector() { return null; }
      };
    },
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener(type, handler) { events[type] = handler; },
    removeEventListener(type, handler) {
      if (events[type] === handler) delete events[type];
    },
    _events: events
  };
}

const code = fs.readFileSync(path.join(root, 'js/main.js'), 'utf-8');
const documentStub = createDocumentStub();
const sandbox = { window: { innerWidth: 1024 }, document: documentStub, console };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const { sanitizeInput, makeDraggable } = sandbox;

test('sanitizeInput strips markup', () => {
  assert.strictEqual(sanitizeInput('<b>hi</b>'), 'hi');
});

test('makeDraggable updates modal position on drag', () => {
  const header = { events: {}, addEventListener(type, handler) { this.events[type] = handler; } };
  const modal = {
    offsetLeft: 0,
    offsetTop: 0,
    style: {},
    querySelector(sel) { return sel === '.modal-header' ? header : null; }
  };

  makeDraggable(modal);
  assert.strictEqual(typeof header.events.mousedown, 'function');

  header.events.mousedown({ clientX: 10, clientY: 10, target: { closest: () => null } });
  documentStub._events.mousemove({ clientX: 30, clientY: 40, preventDefault() {} });
  assert.strictEqual(modal.style.transform, 'none');
  assert.strictEqual(modal.style.left, '20px');
  assert.strictEqual(modal.style.top, '30px');

  documentStub._events.mouseup();
  assert.ok(!documentStub._events.mousemove);
});

test('makeDraggable ignores mousedown on interactive elements', () => {
  // Reset event registry
  for (const k in documentStub._events) {
    delete documentStub._events[k];
  }

  const header = { events: {}, addEventListener(type, handler) { this.events[type] = handler; } };
  const modal = {
    offsetLeft: 0,
    offsetTop: 0,
    style: {},
    querySelector(sel) { return sel === '.modal-header' ? header : null; }
  };

  makeDraggable(modal);
  const btn = { closest: sel => (sel.includes('button') ? btn : null) };
  header.events.mousedown({ clientX: 10, clientY: 10, target: btn });

  assert.ok(!documentStub._events.mousemove, 'mousemove listener should not be registered');
});
