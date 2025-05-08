<template>
  <div class="app-container" :class="{ 'dark-theme': isDarkTheme }">
    <header class="app-header">
      <h1 class="app-title">Ollama Chat</h1>
      <button @click="toggleTheme" class="theme-toggle" :title="isDarkTheme ? 'Passer au thème clair' : 'Passer au thème sombre'">
        <span v-if="isDarkTheme">☀️</span>
        <span v-else>🌙</span>
      </button>
    </header>
    
    <main class="app-content">
      <router-view />
    </main>
    
    <footer class="app-footer">
      <p>Propulsé par <strong>Ollama</strong> &copy; 2025</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isDarkTheme: localStorage.getItem('darkTheme') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches
    };
  },
  created() {
    // Appliquer le thème au chargement
    this.applyTheme();
  },
  methods: {
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme;
      localStorage.setItem('darkTheme', this.isDarkTheme);
      this.applyTheme();
    },
    applyTheme() {
      // Appliquer la classe au document pour permettre des styles globaux
      if (this.isDarkTheme) {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    }
  }
}
</script>

<style>
:root {
  /* Thème clair (par défaut) */
  --primary-color: #10a37f; /* Couleur principale de ChatGPT */
  --primary-hover: #0d8c6d;
  --secondary-color: #6e6e80;
  --text-color: #353740;
  --background-color: #ffffff;
  --chat-background: #f7f7f8;
  --message-user-bg: #10a37f;
  --message-user-color: #ffffff;
  --message-assistant-bg: #f7f7f8;
  --message-assistant-color: #353740;
  --border-color: #e5e5e5;
  --sidebar-bg: #202123;
  --sidebar-text: #ffffff;
  --error-color: #ef4146;
  --header-bg: #ffffff;
  --header-color: #353740;
  --footer-bg: #f7f7f8;
  --footer-color: #6e6e80;
  --input-bg: #ffffff;
  --input-border: #e5e5e5;
  --input-text: #353740;
  --button-bg: #10a37f;
  --button-color: #ffffff;
  --button-hover: #0d8c6d;
  --shadow-color: rgba(0, 0, 0, 0.05);
}

:root.dark-theme {
  /* Thème sombre */
  --primary-color: #10a37f;
  --primary-hover: #0d8c6d;
  --secondary-color: #c5c5d2;
  --text-color: #ececf1;
  --background-color: #343541;
  --chat-background: #444654;
  --message-user-bg: #10a37f;
  --message-user-color: #ffffff;
  --message-assistant-bg: #444654;
  --message-assistant-color: #ececf1;
  --border-color: #565869;
  --sidebar-bg: #202123;
  --sidebar-text: #ffffff;
  --error-color: #ef4146;
  --header-bg: #343541;
  --header-color: #ececf1;
  --footer-bg: #343541;
  --footer-color: #c5c5d2;
  --input-bg: #40414f;
  --input-border: #565869;
  --input-text: #ececf1;
  --button-bg: #10a37f;
  --button-color: #ffffff;
  --button-hover: #0d8c6d;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --code-background: #1e1e2e;
  --inline-code-background: #2d2d3a;
  --code-text-color: #e4e4e7;
  --table-header-bg: #2d2d3a;
  --table-row-alt-bg: #3a3a48;
  --blockquote-border: #4d4d4f;
  --blockquote-text: #a1a1aa;
}
</style>
