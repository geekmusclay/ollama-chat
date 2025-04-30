<template>
  <div class="conversations-layout">
    <!-- Sidebar avec la liste des conversations -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <button class="new-chat-btn btn" @click="createNewConversation">
          <span class="icon">+</span> Nouvelle conversation
        </button>
      </div>
      
      <div class="sidebar-content">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <span>Chargement...</span>
        </div>
        
        <div v-else-if="error" class="error">
          <span class="error-icon">⚠️</span>
          {{ error }}
        </div>
        
        <div v-else-if="conversations.length === 0" class="empty-state">
          <p>Aucune conversation</p>
          <p class="empty-subtitle">Commencez une nouvelle conversation pour discuter avec Ollama.</p>
        </div>
        
        <ul v-else class="conversation-list">
          <li v-for="conversation in conversations" :key="conversation.id" class="conversation-item">
            <router-link :to="{ name: 'chat', params: { id: conversation.id } }" class="conversation-link" active-class="active">
              <div class="conversation-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div class="conversation-info">
                <h3 class="conversation-title">{{ conversation.title }}</h3>
                <p class="conversation-meta">
                  {{ formatDate(conversation.updated_at) }}
                </p>
              </div>
              <button class="delete-btn" @click.prevent="deleteConversation(conversation.id)" title="Supprimer cette conversation">
                <span class="icon">×</span>
              </button>
            </router-link>
          </li>
        </ul>
      </div>
      
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="user-name">Utilisateur</div>
        </div>
      </div>
    </aside>

    <!-- Contenu principal -->
    <main class="main-content">
      <div class="welcome-screen">
        <div class="welcome-logo">
          <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="var(--primary-color)" />
            <path d="M28 65V35L50 50L72 35V65L50 80L28 65Z" fill="white" />
          </svg>
        </div>
        <h1 class="welcome-title">Bienvenue sur Ollama Chat</h1>
        <p class="welcome-description">Sélectionnez une conversation existante ou commencez-en une nouvelle pour discuter avec les modèles Ollama.</p>
        
        <div class="welcome-actions">
          <button class="btn" @click="createNewConversation">
            Nouvelle conversation
          </button>
        </div>
        
        <div class="welcome-features">
          <div class="feature">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div class="feature-text">
              <h3>Conversations</h3>
              <p>Créez et gérez plusieurs conversations</p>
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </div>
            <div class="feature-text">
              <h3>Modèles</h3>
              <p>Choisissez parmi différents modèles Ollama</p>
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <div class="feature-text">
              <h3>Historique</h3>
              <p>Accédez à l'historique de vos conversations</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ConversationsView',
  data() {
    return {
      conversations: [],
      loading: true,
      error: null
    };
  },
  created() {
    this.fetchConversations();
  },
  methods: {
    async fetchConversations() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get('http://localhost:8000/back/conversations');
        if (response.data.success) {
          this.conversations = response.data.data;
        } else {
          this.error = 'Erreur lors du chargement des conversations';
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des conversations:', error);
        this.error = 'Impossible de charger les conversations. Veuillez réessayer plus tard.';
      } finally {
        this.loading = false;
      }
    },
    
    async createNewConversation() {
      try {
        const response = await axios.post('http://localhost:8000/back/conversations', {
          title: 'Nouvelle conversation'
        });
        
        if (response.data.success) {
          const conversationId = response.data.data.id;
          this.$router.push({ name: 'chat', params: { id: conversationId } });
        } else {
          this.error = 'Erreur lors de la création de la conversation';
        }
      } catch (error) {
        console.error('Erreur lors de la création de la conversation:', error);
        this.error = 'Impossible de créer une nouvelle conversation. Veuillez réessayer plus tard.';
      }
    },
    
    async deleteConversation(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
        return;
      }
      
      try {
        const response = await axios.delete(`http://localhost:8000/back/conversations/${id}`);
        
        if (response.data.success) {
          this.conversations = this.conversations.filter(conv => conv.id !== id);
        } else {
          this.error = 'Erreur lors de la suppression de la conversation';
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la conversation:', error);
        this.error = 'Impossible de supprimer la conversation. Veuillez réessayer plus tard.';
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
  }
};
</script>

<style scoped>
/* Layout principal */
.conversations-layout {
  display: flex;
  /*height: calc(100vh - 110px);*/ /* Hauteur totale moins header et footer */
  height: 90vh;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text);
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid var(--border-color);
}

.sidebar-header {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
}

.new-chat-btn {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

/* Liste des conversations */
.conversation-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.conversation-item {
  margin: 2px 8px;
}

.conversation-link {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  text-decoration: none;
  color: var(--sidebar-text);
  border-radius: 6px;
  transition: background-color 0.2s;
  position: relative;
}

.conversation-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.conversation-link.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.conversation-icon {
  margin-right: 10px;
  opacity: 0.7;
}

.conversation-info {
  flex: 1;
  min-width: 0; /* Pour permettre le texte tronqué */
}

.conversation-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-meta {
  margin: 0;
  font-size: 12px;
  opacity: 0.7;
}

.delete-btn {
  background-color: transparent;
  border: none;
  color: var(--sidebar-text);
  opacity: 0;
  cursor: pointer;
  font-size: 18px;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, background-color 0.2s;
}

.conversation-link:hover .delete-btn {
  opacity: 0.7;
}

.delete-btn:hover {
  opacity: 1 !important;
  background-color: rgba(255, 255, 255, 0.1);
}

/* États de chargement et d'erreur */
.loading, .error, .empty-state {
  padding: 20px;
  text-align: center;
  color: var(--sidebar-text);
  opacity: 0.7;
  font-size: 14px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: var(--error-color);
}

.error-icon {
  margin-right: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-subtitle {
  font-size: 12px;
  opacity: 0.7;
}

/* Contenu principal */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--chat-background);
  overflow-y: auto;
}

/* Écran de bienvenue */
.welcome-screen {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.welcome-logo {
  margin-bottom: 24px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-color);
}

.welcome-description {
  font-size: 16px;
  color: var(--secondary-color);
  max-width: 600px;
  margin-bottom: 32px;
  line-height: 1.5;
}

.welcome-actions {
  margin-bottom: 48px;
}

.welcome-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  max-width: 800px;
  width: 100%;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background-color: var(--background-color);
  box-shadow: 0 2px 8px var(--shadow-color);
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.feature-text h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-color);
}

.feature-text p {
  font-size: 14px;
  color: var(--secondary-color);
  line-height: 1.4;
}
</style>
