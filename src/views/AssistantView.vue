<template>
    <div class="assistant-view">
        <router-link to="/" class="back-btn" title="Retour aux conversations">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"></path>
          <path d="M12 19l-7-7 7-7"></path>
        </svg>
      </router-link>
        <div class="content">
            <h3 v-if="id === 'new'">Création d'un assistant</h3>
            <h3 v-else>Assistant {{ id }}</h3>
            <input type="text" placeholder="Nom de l'assistant">
            <p>Pour créer un assistant, rédigez un prompt spécifique qui donnera au modèle un rôle ainsi que le comportement et le retour attendu.</p>
            <textarea name="" id="" cols="150" rows="25" placeholder="Tu es un assistant chef de projet, ton rôle est de..."></textarea>
            <button class="btn">Créer l'assistant</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'AssistantView',
    data() {
        return {
            id: this.$route.params.id,
            assistant: null,
            loading: false,
            error: null
        };
    },
    created() {
        if (this.id !== 'new') {
            this.fetchAssistant();
        }
    },
    methods: {
        async fetchAssistant() {
            this.loading = true;
            this.error = null;
            
            try {
                const response = await axios.get(`http://localhost:8000/assistants/${this.id}`);
                if (response.data.success) {
                    this.assistant = response.data.data;
                } else {
                    this.error = 'Erreur lors du chargement de l\'assistant';
                }
            } catch (error) {
                console.error('Erreur lors du chargement de l\'assistant:', error);
                this.error = 'Impossible de charger l\'assistant. Veuillez réessayer plus tard.';
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>

<style scoped>
.assistant-view {
    padding-top: 75px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 1280px;
}

.content h3 {
    margin-bottom: 20px;
}

.content p {
    margin-bottom: 20px;
}

.content textarea {
    margin-bottom: 20px;
}
</style>