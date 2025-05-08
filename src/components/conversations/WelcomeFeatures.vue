<template>
    <div class="welcome-features">
        <FeatureBlock>
        <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        </template>
        <template #title>
            <h3>Conversations</h3>
        </template>
        <template #description>Créez et gérez plusieurs conversations</template>
        </FeatureBlock>
        
        <FeatureBlock>
        <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
            </svg>
        </template>
        <template #title>
            <h3>Modèles</h3>
        </template>
        <template #description>Choisissez parmi différents modèles Ollama</template>
        </FeatureBlock>

        <FeatureBlock>
        <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
        </template>
        <template #title>
            <h3>Historique</h3>
        </template>
        <template #description>Accédez à l'historique de vos conversations</template>
        </FeatureBlock>

        <FeatureBlock>
        <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        </template>
        <template #title>
            <h3>Assistant</h3>
        </template>
        <template #description>Créez vos propres assistants personnalisés</template>
        </FeatureBlock>
    </div>
</template>

<script>
import FeatureBlock from './FeatureBlock.vue';

export default {
    name: 'WelcomeFeatures',
    components: {
        FeatureBlock
    }
};
</script>

<style scoped>
.welcome-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
    max-width: 800px;
    width: 100%;
}
</style>