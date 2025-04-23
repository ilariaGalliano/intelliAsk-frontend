<template>
  <div class="container">
    <!-- Header con logo -->
    <header class="header">
      <img src="/logo.png" alt="Logo IntelliAsk" class="logo" />
    </header>

    <h1>IntelliAsk</h1>
    <p>Il generatore di risposte intelligente</p>
    <input v-model="question" type="text" maxlength="200" placeholder="Come preparare la pasta?" />
    <button :disabled="isLoading" @click="askQuestion">Chiedi</button>

    <p v-if="isLoading">Sto pensando...</p>

    <div v-if="answer" class="recipe">
      <h2 class="recipe-title">Risultato:</h2>
      <p id="answerText" class="formatted-answer" v-html="formattedAnswer"></p>
      <button class="copy-button" @click="copyToClipboard" aria-label="Copia risposta">
           <i class="fas fa-copy"></i>
      </button>

    </div>

    <div v-if="slug">
      <a :href="'/question/' + encodeURIComponent(slug)" target="_blank" rel="noopener noreferrer"
        class="response-link">
        Link permanente alla risposta
      </a>
      <p style="font-size:10px; margin-top: 20px; margin-bottom: 10px;">
        *Le risposte potrebbero essere scorrette e/o non aggiornate.
      </p>
    </div>

    <div v-if="error" class="error-container">
      <p class="error-text">Errore: {{ error }}</p>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <p class="p-footer">© 2025 IntelliAsk - Creato con ❤️ da Ilaria</p>
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

const prodUrl = 'https://intelliask-backend.onrender.com/ask'

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

const formattedAnswer = computed(() => {
  if (!answer.value) return "";

  const lines = answer.value.split('\n');

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
});


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
  navigator.clipboard.writeText(answer.value).then(() => {
    alert("Risposta copiata!")
  }).catch(err => {
    console.error("Errore durante la copia:", err)
    alert("Errore durante la copia della risposta.")
  })
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
html, body {
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
  z-index: 1000;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
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


/* Responsive - Tablet */
@media (max-width: 768px) {
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

  .logo {
    max-width: 60px;
  }
}
</style>
