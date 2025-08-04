import { translations } from '../app-data.js';

export let currentLanguage = 'en';
export let isDarkTheme = false;

export function applyTranslations() {
  const elements = document.querySelectorAll('[data-key]');
  elements.forEach(el => {
    const key = el.getAttribute('data-key');
    if (translations[currentLanguage][key]) {
      if (el.tagName === 'TITLE') {
        document.title = translations[currentLanguage][key];
      } else {
        el.textContent = translations[currentLanguage][key];
      }
    }
  });
  // Update card content (dynamic translation)
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    const serviceKey = card.getAttribute('data-service-key');
    const serviceData = translations.services[serviceKey];
    if (serviceData) {
      card.querySelector('.title').textContent = serviceData[currentLanguage].title;
      card.querySelector('.content').textContent = serviceData[currentLanguage].desc;
    }
  });
}

function handleLanguageToggle(btn) {
  currentLanguage = currentLanguage === 'en' ? 'es' : 'en';
  btn.textContent = currentLanguage === 'en' ? 'ES' : 'EN';
  document.documentElement.lang = currentLanguage;
  applyTranslations();
}

function handleThemeToggle(btn) {
  isDarkTheme = !isDarkTheme;
  document.body.classList.toggle('dark', isDarkTheme);
  btn.textContent = isDarkTheme ? 'Light' : 'Dark';
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#lang-toggle, #lang-btn').forEach(btn => {
    btn.addEventListener('click', () => handleLanguageToggle(btn));
  });
  document.querySelectorAll('#theme-toggle, #theme-btn').forEach(btn => {
    btn.addEventListener('click', () => handleThemeToggle(btn));
  });
});
