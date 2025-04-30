<template>
  <div class="chat-messages" ref="messagesContainer">
    <!-- État de chargement -->
    <div v-if="loading" class="chat-loading">
      <div class="loading-spinner"></div>
      <p>Chargement de la conversation...</p>
    </div>
    
    <!-- Message d'erreur -->
    <div v-else-if="error" class="chat-error">
      <p>{{ error }}</p>
      <button @click="$emit('retry')" class="retry-btn">Réessayer</button>
    </div>
    
    <!-- Aucun message -->
    <div v-else-if="messages.length === 0" class="chat-empty">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <h2>Commencez une nouvelle conversation</h2>
      <p>Envoyez un message pour démarrer la conversation avec le modèle {{ selectedModel }}</p>
    </div>
    
    <!-- Liste des messages -->
    <div v-else class="messages-list">
      <div v-for="(message, index) in messages" :key="message.id" class="message" :class="message.role">
        <!-- En-tête du message -->
        <div class="message-header">
          <div class="message-avatar" :class="message.role">
            <span v-if="message.role === 'user'">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <span v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </span>
          </div>
          <div class="message-info">
            <span class="message-role">{{ message.role === 'user' ? 'Vous' : 'Assistant' }}</span>
          </div>
        </div>
        
        <!-- Contenu du message -->
        <div class="message-body" :class="message.role">
          <div class="message-content" v-html="formatMessage(message.content)"></div>
          <!-- Indicateur de streaming -->
          <div v-if="message.isStreaming" class="streaming-indicator">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="message-actions">
            <span class="message-time">{{ formatDate(message.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import hljs from 'highlight.js';

export default {
  name: 'MessageList',
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    selectedModel: {
      type: String,
      default: 'llama3'
    }
  },
  emits: ['retry'],
  mounted() {
    this.scrollToBottom();
    
    // Configuration de marked pour la coloration syntaxique
    marked.setOptions({
      highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
      langPrefix: 'hljs language-', // Préfixe pour les classes CSS
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convertir les retours à la ligne en <br>
      sanitize: false, // Ne pas sanitizer le HTML (attention aux risques XSS)
      smartLists: true, // Listes intelligentes
      smartypants: true // Guillemets intelligents, tirets, etc.
    });
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      deep: true
    }
  },
  methods: {
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
      }
    },
    
    formatMessage(content) {
      if (!content) return '';
      
      try {
        // Utiliser marked pour convertir le Markdown en HTML
        let html = marked.parse(content);
        
        // Ajouter des classes CSS pour les tableaux
        html = html
          .replace(/<table>/g, '<table class="markdown-table">')
          .replace(/<thead>/g, '<thead class="markdown-thead">')
          .replace(/<tbody>/g, '<tbody class="markdown-tbody">');
        
        // Ajouter des classes CSS pour les blocs de code
        html = html
          .replace(/<pre>/g, '<pre class="markdown-pre">')
          .replace(/<code>/g, '<code class="markdown-code">');

        return html;
      } catch (error) {
        console.error('Erreur lors du formatage du message:', error);
        return content;
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
  }
};
</script>

<style scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 250px;
  background-color: var(--chat-background);
}

.chat-loading, .chat-error, .chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-color);
  text-align: center;
  padding: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: var(--button-hover);
}

.empty-icon {
  margin-bottom: 16px;
  color: var(--text-color);
  opacity: 0.6;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.message-avatar {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.message-avatar.user {
  background-color: var(--primary-color);
  color: white;
}

.message-avatar.assistant {
  background-color: var(--secondary-color);
  color: white;
}

.message-info {
  display: flex;
  flex-direction: column;
}

.message-role {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color);
}

.message-body {
  padding: 12px 16px;
  border-radius: 8px;
  margin-left: 42px;
}

.message-body.user {
  background-color: var(--message-user-bg);
}

.message-body.assistant {
  background-color: var(--message-assistant-bg);
}

.message-content {
  color: var(--text-color);
  white-space: pre-wrap;
  word-break: break-word;
  text-align: left;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.7;
}

.streaming-indicator {
  display: flex;
  margin-top: 8px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: var(--text-color);
  border-radius: 50%;
  opacity: 0.6;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
}

/* Styles pour les éléments Markdown */
:deep(.markdown-pre) {
  background: #212121;
  border: 1px solid #1c1c1c;
  border-left: 3px solid #f36d33;
  color: #dddddd;
  page-break-inside: avoid;
  font-family: monospace;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 1.6em;
  max-width: 100%;
  overflow: auto;
  padding: 1em 1.5em;
  display: block;
  word-wrap: break-word;
}

:deep(.markdown-code) {
  background-color: var(--inline-code-background);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

:deep(.markdown-pre .markdown-code) {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  display: block;
  overflow-x: auto;
  color: var(--code-text-color);
  font-size: 0.9em;
  line-height: 1.5;
}

:deep(.markdown-table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  overflow: auto;
  display: block;
  max-width: 100%;
}

:deep(.markdown-table th),
:deep(.markdown-table td) {
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  text-align: left;
}

:deep(.markdown-table th) {
  background-color: var(--table-header-bg);
  font-weight: 600;
}

:deep(.markdown-table tr:nth-child(even)) {
  background-color: var(--table-row-alt-bg);
}

:deep(ul),
:deep(ol) {
  padding-left: 20px;
  margin: 10px 0;
}

:deep(li) {
  margin-bottom: 5px;
}

:deep(blockquote) {
  border-left: 4px solid var(--blockquote-border);
  padding-left: 16px;
  margin: 16px 0;
  color: var(--blockquote-text);
  font-style: italic;
}

:deep(h1),
:deep(h2),
:deep(h3),
:deep(h4),
:deep(h5),
:deep(h6) {
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: 600;
  line-height: 1.25;
}

:deep(h1) { font-size: 1.8em; }
:deep(h2) { font-size: 1.5em; }
:deep(h3) { font-size: 1.3em; }
:deep(h4) { font-size: 1.1em; }
:deep(h5) { font-size: 1em; }
:deep(h6) { font-size: 0.9em; }
</style>
