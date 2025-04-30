<template>
  <div class="chat-input-container">
    <div class="input-wrapper">
      <textarea 
        v-model="inputValue" 
        @keydown.enter.prevent="sendMessage" 
        @input="autoResizeTextarea"
        ref="textarea"
        placeholder="Envoyez un message..."
        :disabled="isGenerating"
        class="message-input"
      ></textarea>
      <button 
        @click="sendMessage" 
        class="send-button" 
        :disabled="!inputValue.trim() || isGenerating"
        :class="{ 'generating': isGenerating }"
      >
        <span v-if="isGenerating" class="generating-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </span>
        <span v-else class="send-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </span>
      </button>
    </div>
    <div class="input-info">
      <span class="model-info">Modèle: {{ selectedModel }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageInput',
  props: {
    isGenerating: {
      type: Boolean,
      default: false
    },
    selectedModel: {
      type: String,
      default: 'llama3'
    }
  },
  emits: ['send-message'],
  data() {
    return {
      inputValue: ''
    };
  },
  methods: {
    sendMessage() {
      if (!this.inputValue.trim() || this.isGenerating) return;
      
      this.$emit('send-message', this.inputValue.trim());
      this.inputValue = '';
      this.$nextTick(() => {
        this.autoResizeTextarea();
      });
    },
    
    autoResizeTextarea() {
      const textarea = this.$refs.textarea;
      if (!textarea) return;
      
      // Réinitialiser la hauteur
      textarea.style.height = 'auto';
      
      // Calculer la nouvelle hauteur
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  },
  mounted() {
    this.autoResizeTextarea();
  }
};
</script>

<style scoped>
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
  padding: 10px 16px;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: var(--input-focus-border);
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--input-text);
  font-size: 16px;
  line-height: 1.5;
  min-height: 24px;
  max-height: 200px;
  resize: none;
  outline: none;
  padding: 0;
  margin-right: 12px;
  font-family: inherit;
}

.message-input::placeholder {
  color: var(--input-text);
  opacity: 0.6;
}

.send-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background-color: var(--button-hover);
}

.send-button:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
  opacity: 0.7;
}

.send-button.generating {
  background-color: var(--secondary-color);
}

.generating-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.input-info {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.7;
}
</style>
