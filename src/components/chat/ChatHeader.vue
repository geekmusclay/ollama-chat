<template>
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
      <!-- Mode affichage du titre -->
      <div v-if="!isEditingTitle" class="title-display">
        <h1 v-if="conversation" class="chat-title">{{ conversation.title }}</h1>
        <h1 v-else class="chat-title">Nouvelle conversation</h1>
        <button v-if="conversation" @click="startEditingTitle" class="edit-title-btn" title="Modifier le titre">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </div>
      
      <!-- Mode édition du titre -->
      <div v-else class="title-edit-form">
        <input 
          type="text" 
          v-model="newTitle" 
          class="title-input"
          placeholder="Titre de la conversation"
          @keydown.enter="saveTitle"
          @keydown.esc="cancelEditingTitle"
          ref="titleInput"
        >
        <div class="title-edit-actions">
          <button @click="saveTitle" class="save-title-btn" title="Enregistrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
          <button @click="cancelEditingTitle" class="cancel-title-btn" title="Annuler">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="header-right">
      <select v-model="selectedModel" class="model-selector" title="Sélectionner un modèle" @change="$emit('model-change', selectedModel)">
        <option v-for="model in availableModels" :key="model" :value="model">{{ model }}</option>
      </select>
    </div>
  </header>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ChatHeader',
  props: {
    conversation: {
      type: Object,
      default: null
    },
    availableModels: {
      type: Array,
      default: () => ['llama3']
    },
    modelValue: {
      type: String,
      default: 'llama3'
    }
  },
  emits: ['model-change', 'update:modelValue'],
  data() {
    return {
      isEditingTitle: false,
      newTitle: '',
      selectedModel: this.modelValue
    };
  },
  watch: {
    modelValue(newVal) {
      this.selectedModel = newVal;
    }
  },
  methods: {
    startEditingTitle() {
      this.isEditingTitle = true;
      this.newTitle = this.conversation.title;
      // Focus sur l'input après le rendu du DOM
      this.$nextTick(() => {
        this.$refs.titleInput.focus();
      });
    },
    
    cancelEditingTitle() {
      this.isEditingTitle = false;
      this.newTitle = '';
    },
    
    async saveTitle() {
      if (!this.newTitle.trim() || this.newTitle === this.conversation.title) {
        this.cancelEditingTitle();
        return;
      }
      
      try {
        const response = await axios.put(`http://localhost:8000/conversations/${this.conversation.id}`, {
          title: this.newTitle
        });
        
        if (response.data.success) {
          this.$emit('title-updated', this.newTitle);
          this.isEditingTitle = false;
        } else {
          this.$emit('error', 'Erreur lors de la modification du titre');
        }
      } catch (error) {
        console.error('Erreur lors de la modification du titre:', error);
        this.$emit('error', 'Impossible de modifier le titre. Veuillez réessayer plus tard.');
      }
    }
  }
};
</script>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  padding: 12px 250px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--header-bg);
  color: var(--header-color);
  justify-content: space-between;
}

.header-left, .header-right {
  flex: 1;
}

.header-left {
  display: flex;
  justify-content: flex-start;
}

.header-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.header-right {
  display: flex;
  justify-content: flex-end;
}

.back-btn {
  color: var(--header-color);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

/* Styles pour le titre et son édition */
.title-display {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-direction: row;
  justify-content: center;
}

.chat-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--header-color);
}

.edit-title-btn {
  background: transparent;
  border: none;
  color: var(--header-color);
  opacity: 0.6;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.edit-title-btn:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.1);
}

.title-edit-form {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 400px;
}

.title-input {
  flex: 1;
  background-color: var(--input-bg);
  color: var(--input-text);
  border: 1px solid var(--input-border);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.title-input:focus {
  border-color: var(--input-focus-border);
}

.title-edit-actions {
  display: flex;
  gap: 5px;
}

.save-title-btn,
.cancel-title-btn {
  background: transparent;
  border: none;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-title-btn {
  color: var(--success-color);
}

.cancel-title-btn {
  color: var(--error-color);
}

.save-title-btn:hover,
.cancel-title-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.model-selector {
  background-color: var(--input-bg);
  color: var(--input-text);
  border: 1px solid var(--input-border);
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
}

.model-selector:focus {
  border-color: var(--input-focus-border);
}
</style>
