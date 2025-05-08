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
      return api.get('/conversations');
    },
    
    // Récupérer une conversation spécifique avec ses messages
    get(id) {
      return api.get(`/conversations/${id}`);
    },
    
    // Créer une nouvelle conversation
    create(title) {
      return api.post('/conversations', { title });
    },
    
    // Mettre à jour une conversation
    update(id, data) {
      return api.put(`/conversations/${id}`, data);
    },
    
    // Supprimer une conversation
    delete(id) {
      return api.delete(`/conversations/${id}`);
    },
    
    // Récupérer les messages d'une conversation
    getMessages(id) {
      return api.get(`/conversations/${id}/messages`);
    },
    
    // Ajouter un message à une conversation
    addMessage(id, content, model = 'llama3') {
      return api.post(`/conversations/${id}/messages`, { content, model });
    }
  },
  
  // Endpoints pour Ollama
  ollama: {
    // Récupérer la liste des modèles disponibles
    getModels() {
      return api.get('/models');
    },
    
    // Envoyer un message directement à Ollama (sans enregistrement)
    sendMessage(message, model = 'llama3') {
      return api.post('/chat', { message, model });
    }
  }
};
