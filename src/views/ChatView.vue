<template>
  <div class="chat-view">
    <!-- En-tête du chat avec titre et sélection de modèle -->
    <ChatHeader 
      :conversation="conversation" 
      :available-models="availableModels" 
      :model-value="selectedModel"
      @title-updated="updateConversationTitle"
      @model-change="selectedModel = $event"
      @error="handleError"
    />

    <!-- Liste des messages -->
    <MessageList 
      :messages="messages" 
      :loading="loading" 
      :error="error" 
      :selected-model="selectedModel"
      @retry="fetchConversation"
    />

    <!-- Zone de saisie de message -->
    <MessageInput 
      :is-generating="isGenerating" 
      :selected-model="selectedModel"
      @send-message="handleSendMessage"
    />
  </div>
</template>

<script>
import ChatHeader from '../components/chat/ChatHeader.vue';
import MessageList from '../components/chat/MessageList.vue';
import MessageInput from '../components/chat/MessageInput.vue';
import chatService from '../services/chatService';

export default {
  name: 'ChatView',
  components: {
    ChatHeader,
    MessageList,
    MessageInput
  },
  data() {
    return {
      id: this.$route.params.id,
      conversation: null,
      messages: [],
      loading: false,
      error: null,
      isGenerating: false,
      availableModels: ['llama3'],
      selectedModel: 'llama3'
    };
  },
  created() {
    this.fetchModels();
    if (this.id && this.id !== 'new') {
      this.fetchConversation();
    }
  },
  methods: {
    async fetchModels() {
      try {
        const response = await chatService.getAvailableModels();
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
        const response = await chatService.getConversation(this.id);
        if (response.data.success) {
          this.conversation = response.data.data;
          this.messages = this.conversation.messages || [];
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
    
    async handleSendMessage(messageContent) {
      if (this.isGenerating) return;
      
      this.isGenerating = true;
      
      // Si c'est une nouvelle conversation, on la crée d'abord
      if (!this.conversation) {
        try {
          const createResponse = await chatService.createConversation(
            messageContent.substring(0, 30) + (messageContent.length > 30 ? '...' : '')
          );
          
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
      
      // Ajouter un message vide pour l'utilisateur (sera mis à jour après l'enregistrement)
      const userMessage = {
        id: 'temp-' + Date.now(),
        conversation_id: this.conversation.id,
        role: 'user',
        content: messageContent,
        created_at: new Date().toISOString()
      };
      
      this.messages.push(userMessage);
      
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
      
      // Utiliser EventSource pour recevoir les données en streaming
      try {
        // D'abord enregistrer le message de l'utilisateur
        const userResponse = await chatService.saveUserMessage(this.conversation.id, messageContent);
        
        if (!userResponse.data.success) {
          throw new Error(userResponse.data.error || 'Erreur lors de l\'enregistrement du message utilisateur');
        }
        
        // Remplacer l'ID temporaire du message utilisateur
        const userIndex = this.messages.findIndex(m => m.id === userMessage.id);
        if (userIndex !== -1) {
          this.messages[userIndex].id = userResponse.data.data.messageId;
        }
        
        // Créer l'URL pour le streaming
        const streamUrl = chatService.getStreamUrl(this.conversation.id, this.selectedModel);
        
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
              const saveResponse = await chatService.saveAssistantMessage(
                this.conversation.id, 
                this.messages[assistantIndex].content
              );
              
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
        
        this.isGenerating = false;
      }
    },
    
    updateConversationTitle(newTitle) {
      if (this.conversation) {
        this.conversation.title = newTitle;
      }
    },
    
    handleError(errorMessage) {
      this.error = errorMessage;
    }
  }
};
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 90vh;
  background-color: var(--chat-background);
}
</style>
