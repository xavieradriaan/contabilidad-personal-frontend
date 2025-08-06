export default {
  data() {
    return {
      inactivityTimeout: null,
      logoutTime: 50 * 8 * 1000, // 5 minutos (PRE)
      isInactivitySetup: false
    };
  },
  methods: {
    resetInactivityTimeout() {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = setTimeout(this.logoutUser, this.logoutTime);
      console.log('Inactivity timeout reset');
    },
    logoutUser() {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      this.$router.push('/login');
      this.$swal.fire({
        icon: 'info',
        title: 'Sesión Expirada',
        text: 'Has sido desconectado por inactividad. Por favor, inicia sesión nuevamente.',
        showConfirmButton: true,
        confirmButtonText: 'Iniciar Sesión',
        customClass: {
          popup: 'inactivity-popup',
          title: 'inactivity-title',
          content: 'inactivity-content',
          confirmButton: 'inactivity-confirm-btn'
        }
      });
    },
    setupInactivityListeners() {
      // Evitar configurar múltiples veces
      if (window.inactivityListenersActive) return;
      
      // Crear funciones bound para poder removerlas después
      this.boundResetInactivityTimeout = this.resetInactivityTimeout.bind(this);
      
      window.addEventListener('mousemove', this.boundResetInactivityTimeout, { passive: true });
      window.addEventListener('keydown', this.boundResetInactivityTimeout, { passive: true });
      window.addEventListener('click', this.boundResetInactivityTimeout, { passive: true, capture: false });
      window.addEventListener('scroll', this.boundResetInactivityTimeout, { passive: true });
      
      window.inactivityListenersActive = true;
    },
    cleanupInactivityListeners() {
      if (window.inactivityListenersActive && this.boundResetInactivityTimeout) {
        window.removeEventListener('mousemove', this.boundResetInactivityTimeout);
        window.removeEventListener('keydown', this.boundResetInactivityTimeout);
        window.removeEventListener('click', this.boundResetInactivityTimeout);
        window.removeEventListener('scroll', this.boundResetInactivityTimeout);
        
        window.inactivityListenersActive = false;
      }
      
      clearTimeout(this.inactivityTimeout);
      this.isInactivitySetup = false;
      this.boundResetInactivityTimeout = null;
    }
  },
  mounted() {
    // Solo configurar si estamos autenticados y no está ya configurado
    if (localStorage.getItem('token') && !this.isInactivitySetup) {
      this.setupInactivityListeners();
      this.resetInactivityTimeout();
      this.isInactivitySetup = true;
      console.log('Inactivity timeout initialized');
    }
  },
  beforeDestroy() {
    this.cleanupInactivityListeners();
  },
  beforeUnmount() { // Vue 3 compatibility
    this.cleanupInactivityListeners();
  }
};