import { translations, services } from '../app-data.js';

export let currentLanguage = 'en';
export let isDarkTheme = false;

/**
 * Applies the current language translations to all elements with a `data-key` attribute.
 */
export function applyTranslations() {
  const elements = document.querySelectorAll('[data-key]');
  elements.forEach(el => {
    const key = el.getAttribute('data-key');
    if (translations[currentLanguage][key]) {
      el.textContent = translations[currentLanguage][key];
    } else if (el.placeholder) {
      el.placeholder = translations[currentLanguage][key] || el.placeholder;
    }
  });

  // Specifically handle the title for the main page
  const titleEl = document.querySelector('title');
  if (titleEl) {
    const key = titleEl.getAttribute('data-key');
    titleEl.textContent = translations[currentLanguage][key] || 'OPS Online Support';
  }
}

/**
 * Handles the language toggle functionality.
 */
function handleLanguageToggle() {
  currentLanguage = currentLanguage === 'en' ? 'es' : 'en';
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll('#lang-toggle, #lang-btn').forEach(btn => {
    btn.textContent = currentLanguage === 'en' ? 'ES' : 'EN';
  });
  applyTranslations();
}

/**
 * Handles the theme toggle functionality.
 */
function handleThemeToggle() {
  isDarkTheme = !isDarkTheme;
  document.body.classList.toggle('dark', isDarkTheme);
  document.querySelectorAll('#theme-toggle, #theme-btn').forEach(btn => {
    btn.textContent = isDarkTheme ? 'Light' : 'Dark';
  });
  localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
}

document.addEventListener('DOMContentLoaded', () => {
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    handleThemeToggle(); // This will toggle it to dark mode
  }

  // Set up event listeners for both header and mobile nav buttons
  document.querySelectorAll('#lang-toggle, #lang-btn').forEach(btn => {
    btn.addEventListener('click', handleLanguageToggle);
  });
  document.querySelectorAll('#theme-toggle, #theme-btn').forEach(btn => {
    btn.addEventListener('click', handleThemeToggle);
  });
});
