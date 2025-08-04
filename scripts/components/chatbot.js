/**
 * @fileoverview Manages the OPS AI Chatbot functionality and interaction with the Gemini API.
 */
import { openModal } from '../interactions/modals.js';

const chatLog = document.getElementById('chat-log');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotForm = document.getElementById('chatbot-input-row');
const chatbotSendBtn = document.getElementById('chatbot-send');
const humanCheck = document.getElementById('human-check');

/**
 * Appends a new message to the chat log.
 * @param {string} text The message text.
 * @param {string} sender 'user' or 'bot'.
 */
function addMessageToChat(text, sender) {
  const messageEl = document.createElement('div');
  messageEl.className = `chat-msg ${sender}`;
  messageEl.textContent = text;
  chatLog.appendChild(messageEl);
  chatLog.scrollTop = chatLog.scrollHeight;
}

/**
 * Simulates a typing indicator.
 */
function showTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'chat-msg bot typing-indicator';
  indicator.textContent = '...';
  chatLog.appendChild(indicator);
  chatLog.scrollTop = chatLog.scrollHeight;
  return indicator;
}

/**
 * Makes an API call to the Gemini API with exponential backoff.
 * @param {Array} chatHistory The chat history to send to the model.
 * @param {number} retries The number of retries for the backoff.
 * @returns {Promise<string>} The generated text response.
 */
async function getGeminiResponse(chatHistory, retries = 3) {
  const apiKey = ""; // Canvas will automatically provide this key.
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  try {
    const payload = { contents: chatHistory };
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Invalid API response format');
    }
    return text;

  } catch (error) {
    if (retries > 0) {
      const delay = Math.pow(2, 3 - retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return getGeminiResponse(chatHistory, retries - 1);
    } else {
      console.error("API call failed after multiple retries:", error);
      return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
  }
}

/**
 * Handles the submission of the chatbot form.
 */
async function handleChatbotSubmit(event) {
  event.preventDefault();
  const userMessage = chatbotInput.value.trim();
  if (!userMessage) return;

  addMessageToChat(userMessage, 'user');
  chatbotInput.value = '';
  chatbotSendBtn.disabled = true;
  
  const typingIndicator = showTypingIndicator();

  try {
    // API call with Gemini
    const chatHistory = [{ role: 'user', parts: [{ text: userMessage }] }];
    const botResponse = await getGeminiResponse(chatHistory);
    
    // Remove typing indicator before adding the bot's response
    chatLog.removeChild(typingIndicator);
    addMessageToChat(botResponse, 'bot');

  } catch (error) {
    console.error("Chatbot response error:", error);
    chatLog.removeChild(typingIndicator);
    addMessageToChat("Sorry, I am having trouble processing that request.", 'bot');
  } finally {
    chatbotSendBtn.disabled = false;
  }
}

export function setupChatbot() {
  if (chatbotForm) {
    chatbotForm.addEventListener('submit', handleChatbotSubmit);
  }

  // Enable/disable the send button based on input and human check
  document.addEventListener('input', () => {
    if (chatbotInput && humanCheck && chatbotSendBtn) {
      chatbotSendBtn.disabled = !(chatbotInput.value.trim() && humanCheck.checked);
    }
  });

  // Open chatbot when a specific button is clicked
  document.getElementById('fab-chatbot-btn').addEventListener('click', () => {
    openModal('chatbot-modal');
  });
}
