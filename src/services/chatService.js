import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default {
  /**
   * Récupère une conversation spécifique avec ses messages
   * @param {number} conversationId - ID de la conversation
   * @returns {Promise} - Promesse contenant les données de la conversation
   */
  getConversation(conversationId) {
    return axios.get(`${API_URL}/conversations/${conversationId}`);
  },
  
  /**
   * Crée une nouvelle conversation
   * @param {string} title - Titre de la conversation
   * @returns {Promise} - Promesse contenant l'ID de la nouvelle conversation
   */
  createConversation(title) {
    return axios.post(`${API_URL}/conversations`, { title });
  },
  
  /**
   * Met à jour le titre d'une conversation
   * @param {number} conversationId - ID de la conversation
   * @param {string} title - Nouveau titre de la conversation
   * @returns {Promise} - Promesse contenant le statut de la mise à jour
   */
  updateConversationTitle(conversationId, title) {
    return axios.put(`${API_URL}/conversations/${conversationId}`, { title });
  },
  
  /**
   * Enregistre un message utilisateur dans une conversation
   * @param {number} conversationId - ID de la conversation
   * @param {string} content - Contenu du message
   * @returns {Promise} - Promesse contenant l'ID du message enregistré
   */
  saveUserMessage(conversationId, content) {
    return axios.post(`${API_URL}/conversations/${conversationId}/messages/user`, { content });
  },
  
  /**
   * Enregistre un message assistant dans une conversation
   * @param {number} conversationId - ID de la conversation
   * @param {string} content - Contenu du message
   * @returns {Promise} - Promesse contenant l'ID du message enregistré
   */
  saveAssistantMessage(conversationId, content) {
    return axios.post(`${API_URL}/conversations/${conversationId}/messages/assistant`, { content });
  },
  
  /**
   * Récupère la liste des modèles disponibles
   * @returns {Promise} - Promesse contenant la liste des modèles
   */
  getAvailableModels() {
    return axios.get(`${API_URL}/models`);
  },
  
  /**
   * Crée une URL pour le streaming des réponses
   * @param {number} conversationId - ID de la conversation
   * @param {string} model - Nom du modèle à utiliser
   * @returns {string} - URL pour le streaming
   */
  getStreamUrl(conversationId, model) {
    return `${API_URL}/conversations/${conversationId}/messages/stream?model=${model}`;
  }
};
