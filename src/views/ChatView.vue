<template>
  <div class="chat-view">
    <!-- Header avec titre et actions -->
    <header class="chat-header">
      <div class="header-left">
        <router-link to="/" class="back-btn" title="Retour aux conversations">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
        </router-link>
      </div>
      
      <div class="header-center">
        <h1 v-if="conversation" class="chat-title">{{ conversation.title }}</h1>
        <h1 v-else class="chat-title">Nouvelle conversation</h1>
      </div>
      
      <div class="header-right">
        <select v-model="selectedModel" class="model-selector" title="Sélectionner un modèle">
          <option v-for="model in availableModels" :key="model" :value="model">{{ model }}</option>
        </select>
        <button v-if="conversation" @click="editTitle" class="edit-btn" title="Modifier le titre">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
      </div>
    </header>
    
    <!-- Zone des messages -->
    <div class="chat-messages" ref="messagesContainer">
      <!-- État de chargement -->
      <div v-if="loading" class="chat-loading">
        <div class="loading-spinner"></div>
        <p>Chargement de la conversation...</p>
      </div>
      
      <!-- Affichage d'erreur -->
      <div v-else-if="error" class="chat-error">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button @click="fetchConversation" class="btn-secondary retry-btn">Réessayer</button>
      </div>
      
      <!-- Conversation vide -->
      <div v-else-if="messages.length === 0" class="chat-empty">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 12h8"></path>
            <path d="M12 8v8"></path>
          </svg>
        </div>
        <h2>Commencez une nouvelle conversation</h2>
        <p>Envoyez un message pour démarrer une conversation avec le modèle {{ selectedModel }}</p>
      </div>
      
      <!-- Liste des messages -->
      <div v-else class="messages-container">
        <div v-for="(message, index) in messages" :key="message.id" class="message-wrapper">
          <!-- En-tête du message avec l'avatar et le rôle -->
          <div class="message-header" :class="message.role">
            <div class="avatar" :class="message.role">
              <template v-if="message.role === 'user'">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </template>
              <template v-else>
                <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="50" fill="var(--primary-color)" />
                  <path d="M28 65V35L50 50L72 35V65L50 80L28 65Z" fill="white" />
                </svg>
              </template>
            </div>
            <div class="role-name">{{ message.role === 'user' ? 'Vous' : 'Ollama' }}</div>
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
      
      <!-- Indicateur de génération en cours -->
      <div v-if="isGenerating" class="message-wrapper generating">
        <div class="message-header assistant">
          <div class="avatar assistant">
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="50" fill="var(--primary-color)" />
              <path d="M28 65V35L50 50L72 35V65L50 80L28 65Z" fill="white" />
            </svg>
          </div>
          <div class="role-name">Ollama</div>
        </div>
        <div class="message-body assistant">
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Zone de saisie du message -->
    <div class="chat-input-container">
      <div class="input-wrapper">
        <textarea 
          v-model="userInput" 
          @keydown.enter.prevent="sendMessage" 
          placeholder="Envoyez un message..." 
          :disabled="isGenerating"
          ref="inputField"
          rows="1"
          @input="autoResizeTextarea"
        ></textarea>
        <button 
          @click="sendMessage" 
          :disabled="!userInput.trim() || isGenerating" 
          class="send-btn"
          title="Envoyer le message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <p class="input-info">Ollama peut produire des informations incorrectes. Modèle : {{ selectedModel }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ChatView',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      conversation: null,
      messages: [],
      userInput: '',
      loading: false,
      error: null,
      isGenerating: false,
      selectedModel: 'llama3',
      availableModels: ['llama3'],
      editingTitle: false
    };
  },
  created() {
    this.fetchModels();
    if (this.id && this.id !== 'new') {
      this.fetchConversation();
    }
  },
  mounted() {
    // Ajouter un écouteur d'événement pour redimensionner le textarea au chargement initial
    this.$nextTick(() => {
      if (this.$refs.inputField) {
        this.autoResizeTextarea();
      }
    });
  },
  methods: {
    // Fonction pour redimensionner automatiquement le textarea en fonction du contenu
    autoResizeTextarea() {
      const textarea = this.$refs.inputField;
      if (!textarea) return;
      
      // Réinitialiser la hauteur pour obtenir la hauteur correcte
      textarea.style.height = 'auto';
      
      // Définir la nouvelle hauteur en fonction du contenu
      const newHeight = Math.min(textarea.scrollHeight, 150); // Hauteur maximale de 150px
      textarea.style.height = `${newHeight}px`;
    },
    
    async fetchModels() {
      try {
        const response = await axios.get('http://localhost:8000/back/models');
        if (response.data.success && response.data.data.models) {
          this.availableModels = response.data.data.models.map(model => model.name);
          this.selectedModel = this.availableModels[0] || 'llama3';
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des modèles:', error);
        // Garder les modèles par défaut
      }
    },
    
    async fetchConversation() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`http://localhost:8000/back/conversations/${this.id}`);
        if (response.data.success) {
          this.conversation = response.data.data;
          this.messages = this.conversation.messages || [];
          this.scrollToBottom();
        } else {
          this.error = 'Erreur lors du chargement de la conversation';
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la conversation:', error);
        this.error = 'Impossible de charger la conversation. Veuillez réessayer plus tard.';
      } finally {
        this.loading = false;
      }
    },
    
    async sendMessage() {
      if (!this.userInput.trim() || this.isGenerating) return;
      
      const messageContent = this.userInput.trim();
      this.userInput = '';
      this.isGenerating = true;
      
      // Si c'est une nouvelle conversation, on la crée d'abord
      if (!this.conversation) {
        try {
          const createResponse = await axios.post('http://localhost:8000/back/conversations', {
            title: messageContent.substring(0, 30) + (messageContent.length > 30 ? '...' : '')
          });
          
          if (createResponse.data.success) {
            this.conversation = {
              id: createResponse.data.data.id,
              title: messageContent.substring(0, 30) + (messageContent.length > 30 ? '...' : '')
            };
            this.$router.replace({ name: 'chat', params: { id: this.conversation.id } });
          } else {
            this.error = 'Erreur lors de la création de la conversation';
            this.isGenerating = false;
            return;
          }
        } catch (error) {
          console.error('Erreur lors de la création de la conversation:', error);
          this.error = 'Impossible de créer la conversation. Veuillez réessayer plus tard.';
          this.isGenerating = false;
          return;
        }
      }
      
      // Ajouter le message de l'utilisateur localement
      const userMessage = {
        id: 'temp-' + Date.now(),
        conversation_id: this.conversation.id,
        role: 'user',
        content: messageContent,
        created_at: new Date().toISOString()
      };
      
      this.messages.push(userMessage);
      this.scrollToBottom();
      
      // Ajouter un message vide pour l'assistant (sera rempli par le streaming)
      const assistantMessage = {
        id: 'temp-assistant-' + Date.now(),
        conversation_id: this.conversation.id,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
        isStreaming: true // Indicateur que ce message est en cours de streaming
      };
      
      this.messages.push(assistantMessage);
      this.scrollToBottom();
      
      // Utiliser EventSource pour recevoir les données en streaming
      try {
        // D'abord enregistrer le message de l'utilisateur
        const userResponse = await axios.post(`http://localhost:8000/back/conversations/${this.conversation.id}/messages/user`, {
          content: messageContent
        });
        
        if (!userResponse.data.success) {
          throw new Error(userResponse.data.error || 'Erreur lors de l\'enregistrement du message utilisateur');
        }
        
        // Remplacer l'ID temporaire du message utilisateur
        const userIndex = this.messages.findIndex(m => m.id === userMessage.id);
        if (userIndex !== -1) {
          this.messages[userIndex].id = userResponse.data.data.messageId;
        }
        
        // Créer l'URL pour le streaming
        const streamUrl = `http://localhost:8000/back/conversations/${this.conversation.id}/messages/stream?model=${this.selectedModel}`;
        
        // Créer une nouvelle connexion EventSource
        const eventSource = new EventSource(streamUrl);
        
        // Trouver l'index du message assistant temporaire
        const assistantIndex = this.messages.findIndex(m => m.id === assistantMessage.id);
        
        // Gérer les événements de données
        eventSource.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.content) {
              // Ajouter le contenu au message existant
              if (assistantIndex !== -1) {
                this.messages[assistantIndex].content += data.content;
                this.scrollToBottom();
              }
            }
          } catch (e) {
            console.error('Erreur lors du parsing des données de streaming:', e);
          }
        });
        
        // Gérer l'événement de fin
        eventSource.addEventListener('done', async () => {
          // Fermer la connexion
          eventSource.close();
          
          // Enregistrer le message complet dans la base de données
          if (assistantIndex !== -1) {
            try {
              const saveResponse = await axios.post(`http://localhost:8000/back/conversations/${this.conversation.id}/messages/assistant`, {
                content: this.messages[assistantIndex].content
              });
              
              if (saveResponse.data.success) {
                // Mettre à jour l'ID du message avec celui retourné par l'API
                this.messages[assistantIndex].id = saveResponse.data.data.messageId;
                this.messages[assistantIndex].isStreaming = false;
              }
            } catch (saveError) {
              console.error('Erreur lors de l\'enregistrement du message assistant:', saveError);
            }
          }
          
          this.isGenerating = false;
        });
        
        // Gérer les erreurs
        eventSource.addEventListener('error', (error) => {
          console.error('Erreur de streaming:', error);
          eventSource.close();
          
          if (assistantIndex !== -1) {
            if (!this.messages[assistantIndex].content) {
              this.messages[assistantIndex].content = 'Erreur lors de la génération de la réponse.';
            }
            this.messages[assistantIndex].isStreaming = false;
          }
          
          this.error = 'Erreur lors de la réception de la réponse';
          this.isGenerating = false;
        });
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        this.error = 'Impossible d\'envoyer le message. Veuillez réessayer plus tard.';
        
        // Supprimer le message assistant vide en cas d'erreur
        const assistantIndex = this.messages.findIndex(m => m.id === assistantMessage.id);
        if (assistantIndex !== -1) {
          this.messages.splice(assistantIndex, 1);
        }
      } finally {
        this.isGenerating = false;
        this.$nextTick(() => {
          this.$refs.inputField.focus();
        });
      }
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.messagesContainer) {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
        }
      });
    },
    
    formatMessage(content) {
      // Convertir les sauts de ligne en balises <br>
      let formatted = content.replace(/\n/g, '<br>');
      
      // Convertir les blocs de code
      formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
      
      // Convertir les lignes de code inline
      formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
      
      return formatted;
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },
    
    async editTitle() {
      const newTitle = prompt('Modifier le titre de la conversation', this.conversation.title);
      if (newTitle && newTitle.trim() && newTitle !== this.conversation.title) {
        try {
          const response = await axios.put(`/back/conversations/${this.conversation.id}`, {
            title: newTitle
          });
          
          if (response.data.success) {
            this.conversation.title = newTitle;
          } else {
            this.error = 'Erreur lors de la modification du titre';
          }
        } catch (error) {
          console.error('Erreur lors de la modification du titre:', error);
          this.error = 'Impossible de modifier le titre. Veuillez réessayer plus tard.';
        }
      }
    }
  }
};
</script>

<style scoped>
/* Layout principal */
.chat-view {
  display: flex;
  flex-direction: column;
  height: 90vh; /* Hauteur totale moins header et footer */
  background-color: var(--chat-background);
}

/* En-tête du chat */
.chat-header {
  display: flex;
  align-items: center;
  padding: 12px 250px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--header-bg);
  color: var(--header-color);
}

.header-left, .header-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}

.header-center {
  flex: 1;
  text-align: center;
  margin: 0 15px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  color: var(--text-color);
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: var(--border-color);
  text-decoration: none;
}

.chat-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-selector {
  margin-right: 10px;
  padding: 5px 8px;
  border-radius: 4px;
  background-color: var(--input-bg);
  color: var(--input-text);
  border: 1px solid var(--input-border);
  font-size: 14px;
}

.edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-btn:hover {
  background-color: var(--border-color);
}

/* Zone des messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* États de chargement, erreur et vide */
.chat-loading, .chat-error, .chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--secondary-color);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.chat-error {
  color: var(--error-color);
}

.error-icon {
  font-size: 36px;
  margin-bottom: 16px;
}

.retry-btn {
  margin-top: 16px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: var(--secondary-color);
}

.chat-empty h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-color);
}

.chat-empty p {
  font-size: 16px;
  max-width: 400px;
  line-height: 1.5;
}

/* Messages */
.messages-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 0;
}

.message-wrapper {
  margin-bottom: 24px;
  width: 100%;
}

.message-header {
  display: flex;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 8px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar.user {
  background-color: var(--secondary-color);
  color: white;
}

.avatar.assistant {
  background-color: var(--primary-color);
  color: white;
}

.role-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.message-body {
  padding: 0 16px 0 54px; /* Aligner avec l'avatar */
}

.message-content {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-color);
  white-space: pre-wrap;
  word-break: break-word;
  text-align: left;
}

.message-content pre {
  background-color: var(--input-bg);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 12px 0;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  color: var(--input-text);
  border: 1px solid var(--border-color);
}

.message-content code {
  background-color: var(--input-bg);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: var(--input-text);
  border: 1px solid var(--border-color);
}

.message-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.message-time {
  font-size: 12px;
  color: var(--secondary-color);
}

/* Indicateur de génération */
.generating .typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 8px;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: inline-block;
  opacity: 0.6;
  animation: bounce 1.5s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}

/* Zone de saisie */
.chat-input-container {
  padding: 16px 250px;
  border-top: 1px solid var(--border-color);
  background-color: var(--background-color);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
  box-shadow: 0 2px 6px var(--shadow-color);
}

textarea {
  flex: 1;
  background: none;
  border: none;
  padding: 8px 0;
  resize: none;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.5;
  color: var(--input-text);
  min-height: 24px;
  max-height: 150px;
  overflow-y: auto;
}

textarea:focus {
  outline: none;
}

.send-btn {
  margin-left: 8px;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: var(--button-bg);
  color: var(--button-color);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.send-btn:hover:not(:disabled) {
  background-color: var(--button-hover);
}

.send-btn:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
  opacity: 0.7;
}

.input-info {
  font-size: 12px;
  color: var(--secondary-color);
  text-align: center;
}
</style>
