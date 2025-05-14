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

/* Estilos para el popup de recordatorios */
.dashboard-recordatorio-popup {
  background: #FFFFFF !important; /* Fondo completamente opaco */
  border: 2px solid var(--glass-border) !important;
  border-radius: 16px !important;
  color: var(--primary-blue) !important;
  font-family: 'Inter', sans-serif !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  opacity: 1 !important; /* Asegurar opacidad completa */
}

.dashboard-recordatorio-popup .swal2-popup {
  background: #FFFFFF !important; /* Forzar fondo blanco en contenedor interno */
}

.dashboard-recordatorio-popup .swal2-icon {
  color: var(--primary-blue) !important; /* Color del icono 'i' */
  border-color: var(--primary-blue) !important;
}

/* Ajustar posición del icono */
.dashboard-recordatorio-popup .swal2-icon {
  margin: 1rem auto 0.5rem;
}

/* Sobreescribir clase dashboard-brand-text en el popup */
.dashboard-recordatorio-popup .dashboard-brand-text {
  color: var(--primary-blue) !important;
  text-shadow: none !important;
}

/* Sobreescribir clase dashboard-auth-subtitle en el popup */
.dashboard-recordatorio-popup .dashboard-auth-subtitle {
  color: var(--primary-blue) !important;
  opacity: 0.9 !important;
  margin-bottom: 1rem !important;
}
</style>
