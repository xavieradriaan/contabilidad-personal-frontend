<template>
  <div id="app">
    <navigation-bar 
      :showHome="isLoggedIn" 
      :showLogout="isLoggedIn" 
      @logout-clicked="logout"
    />
    <router-view/>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
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
      isLoggedIn: !!localStorage.getItem('token')
    }
  },
  methods: {
    ...mapActions(['applyTheme']),
    async logout() {
      try {
        await axios.post('/logout', {}, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`
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
      this.$router.push('/login')
    }
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  width: 100%;
  height: 100%;
}

#app {
  overflow-y: auto;
  width: 100%;
  height: 100%;
  position: relative;
}

:root {
  --welcome-bg: var(--primary-color);
  --welcome-text: var(--accent-color);
}

.welcome-message {
  display: none; /* Removed functionality */
}
</style>