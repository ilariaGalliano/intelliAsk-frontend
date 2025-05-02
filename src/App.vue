<template>
  <div class="container">
    <nav class="p-absolute">
      <select class="language-selector" @change="changeLanguage($event.target.value)">
        <option value="it">🇮🇹</option>
        <option value="en">🇬🇧</option>
        <option value="fr">🇫🇷</option>
        <option value="es">🇪🇸</option>
        <option value="de">🇩🇪</option>
      </select>
    </nav>

    <!-- Header con logo -->
    <header class="header">
      <img src="/logo.png" alt="Logo IntelliAsk" class="logo" />
    </header>

    <h1>IntelliAsk</h1>
    <p>{{ $t('title') }}</p>
    <input v-model="question" type="text" maxlength="200" :placeholder="$t('ask_something')" />
    <button :disabled="isLoading" @click="askQuestion">{{ $t('ask') }}</button>

    <p v-if="isLoading">{{ $t('thinking') }}</p>

    <div v-if="answer" class="recipe">
      <h2 class="recipe-title">{{ $t('result') }}</h2>
      <p id="answerText" class="formatted-answer" v-html="formattedAnswer"></p>
      <button class="copy-button" @click="copyToClipboard" aria-label="Copia risposta">
        <i class="fas fa-copy"></i>
      </button>

    </div>

    <div v-if="slug">
      <a :href="'/question/' + encodeURIComponent(slug)" target="_blank" rel="noopener noreferrer"
        class="response-link">
        {{ $t('link') }}
      </a>
      <p style="font-size:10px; margin-top: 20px; margin-bottom: 10px;">
        {{ $t('footer_p') }}
      </p>
    </div>

    <div v-if="error" class="error-container">
      <p class="error-text">Errore: {{ error }}</p>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <p class="p-footer">© 2025 IntelliAsk - {{ $t('created_by') }} ❤️ da <a href="https://ilariagalliano.netlify.app/"
          target="_blank">Ilaria</a></p>
      <a href="https://www.paypal.com/donate/?hosted_button_id=VM7YKBPDUMJMQ" target="_blank" style="
        background-color: #0078d7;
        color: white;
        padding: 10px 15px;
        font-size: 14px;
        border: none;
        border-radius: 8px;
        text-decoration: none;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transition: background-color 0.3s ease;
        display: inline-block;
     ">☕ {{ $t('offer_coffee') }}</a>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const question = ref('')
const answer = ref('')
const slug = ref('')
const error = ref('')
const isLoading = ref(false)

import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const prodUrl = 'https://intelliask-backend.onrender.com/ask'

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function formatAnswerText(rawAnswer) {
  if (!rawAnswer) return "";

  const lines = rawAnswer.split('\n');

  const processedLines = lines.map(line => {
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    if (/^\s*\*\s+/.test(line)) {
      const content = line.replace(/^\s*\*\s+/, '');
      return `<li>${content}</li>`;
    }

    return line;
  });

  const hasListItems = processedLines.some(line => line.startsWith('<li>'));

  const html = hasListItems
    ? processedLines.map(line => line.startsWith('<li>') ? line : `<p>${line}</p>`).join('')
    : processedLines.map(line => `<p>${line}</p>`).join('');

  return hasListItems
    ? `<ul>${html}</ul>`
    : html;
}

const formattedAnswer = computed(() => formatAnswerText(answer.value));

async function askQuestion() {
  error.value = ''
  answer.value = ''
  slug.value = ''

  const rawInput = question.value.trim()
  if (!rawInput || rawInput.length > 200) {
    alert("Inserisci una domanda valida (massimo 200 caratteri).")
    return
  }

  isLoading.value = true

  try {
    const response = await fetch(prodUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: escapeHtml(rawInput) })
    })
    const data = await response.json()
    if (!data.answer || !data.slug) {
      throw new Error("Risposta o slug non validi dal server.")
    }
    answer.value = data.answer
    slug.value = data.slug
  } catch (err) {
    console.error("Errore:", err)
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

function copyToClipboard() {
  const plainTextAnswer = answer.value.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags for plain text
  navigator.clipboard.writeText(plainTextAnswer).then(() => {
    alert("Risposta copiata!")
  }).catch(err => {
    console.error("Errore durante la copia:", err)
    alert("Errore durante la copia della risposta.")
  })
}

function changeLanguage(lang) {
  locale.value = lang;
}
</script>

<style>
/* Variabili di stile */
:root {
  --primary-color: #0078d7;
  --primary-gradient: linear-gradient(135deg, #0078d7, #00aaff);
  --secondary-color: #f4f9fc;
  --text-color: #333;
  --card-bg: #ffffff;
  --radius: 16px;
  --shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease-in-out;
}

/* Impostazioni base */
html,
body {
  height: 100%;
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: var(--secondary-color);
  color: var(--text-color);
}

body {
  display: flex;
  flex-direction: column;
}

/* Container principale */
.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: var(--transition);
}

/* Header */
.header {
  position: sticky;
  top: 0;
  background-color: var(--card-bg);
  text-align: center;
  padding: 1rem 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.logo {
  max-width: 80px;
  height: auto;
  border-radius: 50%;
  box-shadow: var(--shadow);
  transition: var(--transition);
}

.logo:hover {
  transform: scale(1.1);
}

/* Titoli e testo */
h1 {
  text-align: center;
  font-size: 2.5rem;
  background: var(--primary-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

p {
  text-align: center;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

/* Input */
input {
  width: 90%;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: var(--radius);
  border: 1px solid #ccc;
  font-size: 1rem;
  transition: var(--transition);
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(0, 120, 215, 0.2);
}

/* Bottoni */
button {
  width: 100%;
  max-width: 320px;
  margin: 25px auto 35px;
  display: block;
  padding: 1rem;
  font-size: 1.2rem;
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
}

button:hover {
  opacity: 0.9;
}

.p-absolute {
  position: absolute;
  right: 26%;
  z-index: 1000;
}

.copy-button {
  margin-top: 1rem;
  width: auto;
  background-color: #00aaff;
}

/* Risultato */
.recipe-title {
  margin-top: 1rem;
  font-weight: bold;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.response-link {
  display: inline-block;
  margin-top: 1rem;
  color: var(--primary-color);
  text-decoration: underline;
  font-size: 1rem;
}

/* Errori */
.error-container {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #ffe6e6;
  color: #b00020;
  border-radius: var(--radius);
  border: 1px solid #f5c2c7;
}

/* Stile per il contenuto formattato */
.formatted-answer {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-color);
  margin-top: 1rem;
}

.formatted-answer ul {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.formatted-answer li {
  margin-bottom: 0.5rem;
  list-style-type: disc;
}

.formatted-answer strong {
  color: var(--primary-color);
  font-weight: bold;
}

/* Footer */
.footer {
  margin-top: auto;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  padding: 1rem 0;
  border-top: 1px solid #ddd;
  background-color: var(--secondary-color);
}

.p-footer {
  font-size: 0.7rem;
}

.copy-button {
  margin-top: 1rem;
  width: auto;
  background-color: #00aaff;
  padding: 0.8rem 1rem;
  border-radius: var(--radius);
  color: white;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: var(--transition);
}

.copy-button i {
  pointer-events: none;
}

/* Stile moderno per il selettore di lingua */
.language-selector {
  appearance: none;
  background-color: var(--card-bg);
  border: 1px solid var(--primary-color);
  border-radius: var(--radius);
  padding: 0.4rem 1rem;
  font-size: 1rem;
  color: var(--text-color);
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow);
  outline: none;
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
  display: block;
}

.language-selector:hover {
  background-color: var(--primary-color);
  color: white;
}

.language-selector:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(0, 120, 215, 0.2);
}

.language-selector option {
  background-color: white;
  color: var(--text-color);
  padding: 0.5rem;
}


/* Responsive - Tablet */
@media (max-width: 830px) {
  .container {
    margin: 1rem;
    padding: 1.5rem;
  }

  h1 {
    font-size: 2rem;
  }

  input,
  button {
    font-size: 1rem;
    padding: 0.8rem;
  }

  .p-absolute {
    position: absolute;
    right: 53px;
    top: 68px;
    z-index: 1000;
  }

  .recipe-title {
    font-size: 1.3rem;
  }

  .logo {
    max-width: 70px;
  }
}

/* Responsive - Mobile */
@media (max-width: 480px) {
  h1 {
    font-size: 1.6rem;
  }

  input,
  button {
    font-size: 0.9rem;
    padding: 0.7rem;
  }

  button {
    width: 50%;
  }

  .p-absolute {
    position: absolute;
    right: 36px;
    top: 40px;
    z-index: 1000;
  }

  .logo {
    max-width: 60px;
  }
}
</style>
