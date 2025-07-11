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
      
      window.addEventListener('mousemove', this.resetInactivityTimeout, { passive: true });
      window.addEventListener('keydown', this.resetInactivityTimeout, { passive: true });
      window.addEventListener('click', this.resetInactivityTimeout, { passive: true });
      window.addEventListener('scroll', this.resetInactivityTimeout, { passive: true });
      
      window.inactivityListenersActive = true;
    },
    cleanupInactivityListeners() {
      if (window.inactivityListenersActive) {
        window.removeEventListener('mousemove', this.resetInactivityTimeout);
        window.removeEventListener('keydown', this.resetInactivityTimeout);
        window.removeEventListener('click', this.resetInactivityTimeout);
        window.removeEventListener('scroll', this.resetInactivityTimeout);
        
        window.inactivityListenersActive = false;
      }
      
      clearTimeout(this.inactivityTimeout);
      this.isInactivitySetup = false;
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