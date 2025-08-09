const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Minimal DOM implementation for tests
let currentDocument;

class Element {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.attributes = {};
    this.style = {};
    this.dataset = {};
    this.eventHandlers = {};
    this.textContent = '';
    this.scrollTop = 0;
    this.scrollHeight = 0;
    this.classList = {
      add: cls => {
        if (!this.className.split(/\s+/).includes(cls)) {
          this.className = (this.className ? this.className + ' ' : '') + cls;
        }
      },
      remove: cls => {
        this.className = this.className.split(/\s+/).filter(c => c && c !== cls).join(' ');
      },
      toggle: (cls, force) => {
        const has = this.className.split(/\s+/).includes(cls);
        const shouldAdd = force !== undefined ? force : !has;
        shouldAdd ? this.classList.add(cls) : this.classList.remove(cls);
        return shouldAdd;
      },
      contains: cls => this.className.split(/\s+/).includes(cls)
    };
  }
  focus() {
    currentDocument.activeElement = this;
  }
  get lastChild() {
    return this.children[this.children.length - 1] || null;
  }
  set id(v) { this.attributes.id = v; }
  get id() { return this.attributes.id; }
  set className(v) { this.attributes.class = v; }
  get className() { return this.attributes.class || ''; }
  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];
    if (html.includes('modal-chatbot')) {
      const modal = createChatbotModal();
      modal.parentNode = this;
      this.children.push(modal);
    }
  }
  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
  }
  getAttribute(name) {
    if (name === 'class') return this.className;
    if (name.startsWith('data-')) return this.dataset[toDatasetKey(name.slice(5))];
    return this.attributes[name];
  }
  setAttribute(name, value) {
    if (name === 'class') this.className = value;
    else if (name.startsWith('data-')) this.dataset[toDatasetKey(name.slice(5))] = value;
    else this.attributes[name] = value;
  }
  hasAttribute(name) {
    if (name === 'class') return !!this.className;
    if (name.startsWith('data-')) return this.dataset[toDatasetKey(name.slice(5))] !== undefined;
    return this.attributes[name] !== undefined;
  }
  addEventListener(event, handler) {
    (this.eventHandlers[event] ||= []).push(handler);
  }
  querySelector(selector) {
    return querySelectorFrom(this, selector, false);
  }
  querySelectorAll(selector) {
    return querySelectorFrom(this, selector, true);
  }
}

class Document {
  constructor() {
    this.documentElement = new Element('html');
    this.documentElement.lang = 'en';
    this.body = new Element('body');
    this.documentElement.appendChild(this.body);
    this.listeners = {};
    currentDocument = this;
    this.activeElement = this.body;
  }
  createElement(tag) { return new Element(tag); }
  getElementById(id) { return this.querySelector('#' + id); }
  querySelector(selector) { return this.documentElement.querySelector(selector); }
  querySelectorAll(selector) { return this.documentElement.querySelectorAll(selector); }
  addEventListener(event, handler) { (this.listeners[event] ||= []).push(handler); }
  dispatchEvent(evt) { (this.listeners[evt.type] || []).forEach(h => h(evt)); }
}

function toDatasetKey(attr) {
  return attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function createMatcher(selector) {
  if (selector.startsWith('#')) {
    const id = selector.slice(1);
    return el => el.id === id;
  }
  if (selector.startsWith('.')) {
    const cls = selector.slice(1);
    return el => el.className.split(/\s+/).includes(cls);
  }
  if (selector.startsWith('[') && selector.endsWith(']')) {
    const attr = selector.slice(1, -1);
    if (attr.startsWith('data-')) {
      const key = toDatasetKey(attr.slice(5));
      return el => el.dataset[key] !== undefined;
    }
  }
  return () => false;
}

function querySelectorFrom(root, selector, all) {
  const matcher = createMatcher(selector);
  const results = [];
  function traverse(node) {
    for (const child of node.children) {
      if (matcher(child)) {
        results.push(child);
        if (!all) return true;
      }
      if (traverse(child) && !all) return true;
    }
    return false;
  }
  traverse(root);
  return all ? results : results[0] || null;
}

function createChatbotModal() {
  const container = new Element('div');
  container.id = 'modal-chatbot';

  const header = new Element('div');
  header.id = 'chatbot-header';

  const top = new Element('div');
  top.className = 'chatbot-header-top';
  const title = new Element('span');
  title.id = 'title';
  title.dataset.en = 'OPS AI Chatbot';
  title.dataset.es = 'Chatbot OPS AI';
  title.textContent = 'OPS AI Chatbot';
  top.appendChild(title);

  const closeBtn = new Element('button');
  closeBtn.id = 'chatbot-close';
  closeBtn.className = 'modal-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = 'Close';
  top.appendChild(closeBtn);
  header.appendChild(top);

  const controls = new Element('div');
  controls.id = 'chatbot-controls';
  const langCtrl = new Element('span');
  langCtrl.id = 'langCtrl';
  langCtrl.className = 'ctrl';
  langCtrl.textContent = 'ES';
  controls.appendChild(langCtrl);

  const themeCtrl = new Element('span');
  themeCtrl.id = 'themeCtrl';
  themeCtrl.className = 'ctrl';
  themeCtrl.textContent = 'Dark';
  controls.appendChild(themeCtrl);

  header.appendChild(controls);
  container.appendChild(header);

  const log = new Element('div');
  log.id = 'chat-log';
  container.appendChild(log);

  const formContainer = new Element('div');
  formContainer.id = 'chatbot-form-container';
  const form = new Element('form');
  form.id = 'chatbot-input-row';
  const input = new Element('input');
  input.id = 'chatbot-input';
  input.setAttribute('data-en-ph', 'Type your message...');
  input.setAttribute('data-es-ph', 'Escriba su mensaje...');
  input.placeholder = 'Type your message...';
  form.appendChild(input);
  const send = new Element('button');
  send.id = 'chatbot-send';
  send.disabled = true;
  form.appendChild(send);
  formContainer.appendChild(form);

  const label = new Element('label');
  label.className = 'human-check';
  const guard = new Element('input');
  guard.id = 'human-check';
  guard.type = 'checkbox';
  label.appendChild(guard);
  const humanLabel = new Element('span');
  humanLabel.id = 'human-label';
  humanLabel.dataset.en = 'I am human';
  humanLabel.dataset.es = 'Soy humano';
  humanLabel.textContent = 'I am human';
  label.appendChild(humanLabel);

  formContainer.appendChild(label);
  container.appendChild(formContainer);
  return container;
}

function runScripts(context, files) {
  for (const file of files) {
    const code = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    vm.runInContext(code, context);
  }
}

test('chatbot modal initializes and handlers work', async () => {
  const document = new Document();
  const window = { document };
  window.innerWidth = 500;
  window.addEventListener = () => {};
  window.dispatchEvent = () => {};
  const context = vm.createContext({ window, document, console, setTimeout, fetch: null });
  context.window.initDraggableModal = () => {};

  // fetch stub for modal and chat responses
  const chatbotHtml = '<div id="modal-chatbot"></div>';
  const aLittleLater = (val, delay = 100) => new Promise(r => setTimeout(() => r(val), delay));

  context.fetch = async (url) => {
    if (url.endsWith('chatbot.html')) {
      return { text: async () => chatbotHtml };
    }
    // Simulate network latency for chat responses
    return aLittleLater({ json: async () => ({ reply: 'hello' }) });
  };

  // Load scripts
  runScripts(context, ['fabs/js/chattia.js', 'cojoinlistener.js']);

  // Spy on initChatbot
  let called = false;
  const realInit = context.window.initChatbot;
  context.window.initChatbot = () => { called = true; realInit(); };

  // Trigger DOMContentLoaded to build FABs
  document.dispatchEvent({ type: 'DOMContentLoaded' });

  // Invoke chatbot FAB handler
  const chatbotFab = document.getElementById('fab-chatbot');
  // Simulate keyboard activation so focus tracking works
  chatbotFab.focus();
  chatbotFab.eventHandlers.click[0]();
  await new Promise(r => setImmediate(r));

  assert.ok(called, 'initChatbot called after loading modal');

  const closeBtn = document.getElementById('chatbot-close');
  assert.ok(closeBtn, 'close button present');
  assert.strictEqual(closeBtn.getAttribute('aria-label'), 'Close');

  const input = document.getElementById('chatbot-input');
  assert.strictEqual(document.activeElement, input, 'focus moved to input');

  // Test language toggle
  const langCtrl = document.getElementById('langCtrl');
  langCtrl.onclick();
  assert.strictEqual(document.documentElement.lang, 'es');
  assert.strictEqual(langCtrl.textContent, 'EN');

  // Test theme toggle
  const themeCtrl = document.getElementById('themeCtrl');
  themeCtrl.onclick();
  assert.ok(document.body.classList.contains('dark'));

  // Test guard enabling send button
  const guard = document.getElementById('human-check');
  const send = document.getElementById('chatbot-send');
  assert.ok(send.disabled);
  guard.checked = true;
  guard.onchange();
  assert.ok(!send.disabled);

  // Test chat submit
  const form = document.getElementById('chatbot-input-row');
  const log = document.getElementById('chat-log');
  input.value = 'Hi';

  // Fire submission and check intermediate state
  const submitPromise = form.onsubmit({ preventDefault() {} });
  assert.strictEqual(log.children.length, 2, 'user and bot messages added');
  assert.strictEqual(log.children[1].textContent, '…', 'bot shows thinking indicator');
  assert.ok(send.disabled, 'send button disabled while waiting');

  // Wait for response and check final state
  await submitPromise;
  assert.strictEqual(log.children[1].textContent, 'hello', 'bot reply updated');
  assert.ok(!send.disabled, 'send button re-enabled');

  // Close the modal via the close button and ensure focus returns to the FAB
  closeBtn.eventHandlers.click[0]();
  assert.strictEqual(document.activeElement, chatbotFab, 'focus restored to FAB after close');
});

test('chatbot not initialized when HTML missing', async () => {
  const document = new Document();
  const window = { document };
  window.innerWidth = 500;
  window.addEventListener = () => {};
  window.dispatchEvent = () => {};
  const context = vm.createContext({ window, document, console, fetch: null, setTimeout });
  context.window.initDraggableModal = () => {};

  // fetch stub returning no chatbot container
  context.fetch = async () => ({ text: async () => '<div></div>' });

  // Load scripts
  runScripts(context, ['fabs/js/chattia.js', 'cojoinlistener.js']);

  let called = false;
  context.window.initChatbot = () => { called = true; };

  document.dispatchEvent({ type: 'DOMContentLoaded' });
  const chatbotFab = document.getElementById('fab-chatbot');
  await chatbotFab.eventHandlers.click[0]();

  assert.ok(!called, 'initChatbot not called when HTML missing');
});

test('chatbot FAB click is idempotent', async () => {
  const document = new Document();
  const window = { document };
  window.innerWidth = 500;
  window.addEventListener = () => {};
  window.dispatchEvent = () => {};
  const context = vm.createContext({ window, document, console, fetch: null, setTimeout });
  context.window.initDraggableModal = () => {};

  // fetch stub for modal and chat responses
  const chatbotHtml = '<div id="modal-chatbot"></div>';
  context.fetch = async (url) => ({ text: async () => chatbotHtml });

  // Load scripts
  runScripts(context, ['fabs/js/chattia.js', 'cojoinlistener.js']);

  // Spy on initChatbot to track invocation count
  let count = 0;
  const realInit = context.window.initChatbot;
  context.window.initChatbot = () => { count++; realInit(); };

  // Trigger DOMContentLoaded to build FABs
  document.dispatchEvent({ type: 'DOMContentLoaded' });

  // Invoke chatbot FAB handler twice
  const chatbotFab = document.getElementById('fab-chatbot');
  chatbotFab.eventHandlers.click[0]();
  await new Promise(r => setImmediate(r));
  chatbotFab.eventHandlers.click[0]();
  await new Promise(r => setImmediate(r));

  // Ensure initChatbot called only once
  assert.strictEqual(count, 1, 'initChatbot only called once');

  // Ensure only one chatbot container exists
  const containers = document.querySelectorAll('#modal-chatbot');
  assert.strictEqual(containers.length, 1, 'only one chatbot container appended');
});

