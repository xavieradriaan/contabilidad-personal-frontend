<template>
  <div id="app">
    <router-view/>
    <NavigationBar 
      v-if="shouldShowNavigationBar"
      :showLogout="true"
      :showHome="false"
      @logout-clicked="logout"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import axios from 'axios'
import inactivityLogout from './mixins/inactivityLogout.js'
import sessionValidation from './mixins/sessionValidation.js'
import NavigationBar from './components/NavigationBar.vue'

export default {
  name: 'App',
  components: {
    NavigationBar
  },
  mixins: [inactivityLogout, sessionValidation],
  data() {
    return {
      isLoggedIn: !!localStorage.getItem('token')
    }
  },
  computed: {
    shouldShowNavigationBar() {
      // Rutas donde NO debe aparecer la navegación
      const excludedRoutes = ['/', '/login', '/register', '/password_reset'];
      const isExcludedRoute = excludedRoutes.includes(this.$route.path);
      
      // Solo mostrar si está logueado Y no está en ruta excluida
      return this.isLoggedIn && !isExcludedRoute;
    }
  },
  watch: {
    $route: {
      handler() {
        // Verificar estado de autenticación cuando cambie la ruta
        this.checkAuthStatus();
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions(['applyTheme']),
    checkAuthStatus() {
      this.isLoggedIn = !!localStorage.getItem('token');
    },
    async logout() {
      try {
        await axios.post('/logout', {}, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.clearSession();
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        this.clearSession();
      }
    },
    clearSession() {
      localStorage.clear();
      this.isLoggedIn = false;
      this.$router.push('/login');
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

/* Fix global para la franja blanca SOLO en móviles */
@media screen and (max-width: 768px) and (hover: none) and (pointer: coarse) {
  html {
    height: -webkit-fill-available;
  }
  
  body {
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }
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

/* Sobreescribir estilos de SweetAlert2 para coincidir con tu tema */
.swal2-confirm.swal2-styled.tarjetas-modal-btn-primary {
  background: var(--primary-blue) !important;
  color: white !important;
  padding: 0.6rem 1.2rem !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.swal2-confirm.swal2-styled.tarjetas-modal-btn-primary:hover {
  background: #2D4A5E !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15) !important;
}

.swal2-cancel.swal2-styled.tarjetas-modal-btn-secondary {
  background: var(--secondary-blue) !important;
  color: white !important;
  padding: 0.6rem 1.2rem !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.swal2-cancel.swal2-styled.tarjetas-modal-btn-secondary:hover {
  background: #3a5f76 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15) !important;
}

/* Styles for SweetAlert2 buttons */
.tarjetas-modal-btn-primary {
  background: var(--primary-blue) !important; /* Matches "Agregar Tarjeta" */
  color: white !important;
  padding: 0.6rem 1.2rem !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.tarjetas-modal-btn-primary:hover {
  background: #2D4A5E !important; /* Hover effect for primary button */
  transform: translateY(-2px) !important;
}

.tarjetas-modal-btn-secondary {
  background: var(--secondary-blue) !important; /* Matches "Cerrar" */
  color: white !important;
  padding: 0.6rem 1.2rem !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.tarjetas-modal-btn-secondary:hover {
  background: #3a5f76 !important; /* Hover effect for secondary button */
  transform: translateY(-2px) !important;
}

/* Posición para la barra de navegación global */
.navigation-bar {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

@media (max-width: 768px) {
  .navigation-bar {
    top: 10px;
    right: 10px;
  }
}
</style>