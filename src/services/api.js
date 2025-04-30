import axios from 'axios';

// Configuration de base d'axios
const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default {
  // Endpoints pour les conversations
  conversations: {
    // Récupérer toutes les conversations
    getAll() {
      return api.get('/back/conversations');
    },
    
    // Récupérer une conversation spécifique avec ses messages
    get(id) {
      return api.get(`/back/conversations/${id}`);
    },
    
    // Créer une nouvelle conversation
    create(title) {
      return api.post('/back/conversations', { title });
    },
    
    // Mettre à jour une conversation
    update(id, data) {
      return api.put(`/back/conversations/${id}`, data);
    },
    
    // Supprimer une conversation
    delete(id) {
      return api.delete(`/back/conversations/${id}`);
    },
    
    // Récupérer les messages d'une conversation
    getMessages(id) {
      return api.get(`/back/conversations/${id}/messages`);
    },
    
    // Ajouter un message à une conversation
    addMessage(id, content, model = 'llama3') {
      return api.post(`/back/conversations/${id}/messages`, { content, model });
    }
  },
  
  // Endpoints pour Ollama
  ollama: {
    // Récupérer la liste des modèles disponibles
    getModels() {
      return api.get('/back/models');
    },
    
    // Envoyer un message directement à Ollama (sans enregistrement)
    sendMessage(message, model = 'llama3') {
      return api.post('/back/chat', { message, model });
    }
  }
};
