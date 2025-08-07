/**
 * fabs/js/chattia.js
 *
 * This script contains the core logic for the Chattia chatbot.
 * It handles language toggles, theme changes, and chat interactions.
 */

function initChatbot() {
  const qs = s => document.querySelector(s),
        qsa = s => [...document.querySelectorAll(s)];

  const chatbotContainer = qs('#chatbot-container');
  if (!chatbotContainer) return;

  /* === Language toggle === */
  const langCtrl = qs('#langCtrl'),
        transNodes = qsa('[data-en]'),
        phNodes = qsa('[data-en-ph]'),
        humanLab = qs('#human-label');

  langCtrl.onclick = () => {
    const toES = langCtrl.textContent === 'ES';
    document.documentElement.lang = toES ? 'es' : 'en';
    langCtrl.textContent = toES ? 'EN' : 'ES';

    // Update text content
    transNodes.forEach(node => node.textContent = toES ? node.dataset.es : node.dataset.en);

    // Update placeholders
    phNodes.forEach(node => node.placeholder = toES ? node.dataset.esPh : node.dataset.enPh);
    if (humanLab) {
      humanLab.textContent = toES ? humanLab.dataset.es : humanLab.dataset.en;
    }
  };

  /* === Theme toggle === */
  const themeCtrl = qs('#themeCtrl');
  themeCtrl.onclick = () => {
    const dark = themeCtrl.textContent === 'Dark';
    document.body.classList.toggle('dark', dark);
    themeCtrl.textContent = dark ? 'Light' : 'Dark';
  };

  /* === Chatbot core === */
  const log = qs('#chat-log'),
        form = qs('#chatbot-input-row'),
        input = qs('#chatbot-input'),
        send = qs('#chatbot-send'),
        guard = qs('#human-check');

  if (guard) {
    guard.onchange = () => send.disabled = !guard.checked;
  }

  function addMsg(txt, cls) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + cls;
    div.textContent = txt;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  if (form) {
    form.onsubmit = async e => {
      e.preventDefault();
      if (!guard || !guard.checked) return;

      const msg = input.value.trim();
      if (!msg) return;
      addMsg(msg, 'user');
      input.value = '';
      send.disabled = true;
      addMsg('…', 'bot');

      try {
        const r = await fetch('https://your-cloudflare-worker.example.com/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: msg
          })
        });
        const d = await r.json();
        log.lastChild.textContent = d.reply || 'No reply.';
      } catch {
        log.lastChild.textContent = 'Error: Can’t reach AI.';
      }
      send.disabled = false;
      if (window.hideActiveFabModal) {
        window.hideActiveFabModal();
      }
    };
  }
}

window.initChatbot = initChatbot;
