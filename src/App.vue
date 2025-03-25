<template>
  <div id="app" :class="{'dark-mode': isDarkMode}">
    <div v-if="isLoggedIn" class="welcome-message">
      <span class="cyber-greeting">Hola, {{ username }}</span>
    </div>
    
    <navigation-bar 
      :showHome="isLoggedIn" 
      :showLogout="isLoggedIn" 
      @logout-clicked="logout"
      :theme="currentTheme"
    />
    
    <router-view/>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import axios from 'axios'
import NavigationBar from './components/NavigationBar.vue'
import inactivityLogout from './mixins/inactivityLogout.js'

export default {
  name: 'App',
  components: {
    NavigationBar
  },
  mixins: [inactivityLogout],
  data() {
    return {
      isLoggedIn: !!localStorage.getItem('token'),
      username: localStorage.getItem('username')
    }
  },
  computed: {
    ...mapGetters(['isDarkMode', 'themeColors']),
    currentTheme() {
      return this.isDarkMode ? 'dark' : 'light'
    }
  },
  watch: {
    isDarkMode(newVal) {
      this.applyTheme()
      document.documentElement.style.setProperty('--theme-mode', newVal ? 'dark' : 'light')
    },
    isLoggedIn(newVal) {
      if (!newVal) this.$router.push('/login')
    }
  },
  mounted() {
    this.applyTheme()
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark-mode')
    }
  },
  methods: {
    ...mapActions(['applyTheme']),
    async logout() {
      try {
        await axios.post('/logout', {}, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'X-Theme-Mode': this.currentTheme
          }
        })
        this.clearSession()
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
        this.clearSession()
      }
    },
    clearSession() {
      localStorage.clear()
      this.isLoggedIn = false
      this.username = null
      this.$router.push('/login')
      document.documentElement.style = ''
    }
  }
}
</script>

<style>
:root {
  --theme-mode: light;
  --welcome-bg: var(--primary-color);
  --welcome-text: var(--accent-color);
}

.welcome-message {
  text-align: center;
  padding: 1.5rem;
  background: var(--welcome-bg);
  color: var(--welcome-text);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.cyber-greeting {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.4rem;
  letter-spacing: 0.1rem;
  position: relative;
  z-index: 2;
}

.welcome-message::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 25%,
    rgba(var(--accent-rgb), 0.1) 50%,
    transparent 75%
  );
  animation: laserFlow 3s infinite linear;
}

@keyframes laserFlow {
  from { transform: translateX(0); }
  to { transform: translateX(50%); }
}

.dark-mode .welcome-message {
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.1);
}
</style>