// src/mixins/inactivityLogout.js
export default {
  data() {
    return {
      inactivityTimeout: null,
      logoutTime: 5 * 60 * 1000 // 5 minutos en milisegundos
    };
  },
  methods: {
    resetInactivityTimeout() {
      if (localStorage.getItem('token')) {
        clearTimeout(this.inactivityTimeout);
        this.inactivityTimeout = setTimeout(this.logoutUser, this.logoutTime);
        console.log('Inactivity timeout reset');
      }
    },
    logoutUser() {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        this.$router.push('/login');
        this.$swal.fire({
          icon: 'info',
          title: 'Sesión Expirada',
          text: 'Has sido desconectado por inactividad. Por favor, inicia sesión nuevamente.',
          showConfirmButton: true
        });
      }
    }
  },
  mounted() {
    if (localStorage.getItem('token')) {
      this.resetInactivityTimeout();
      window.addEventListener('mousemove', this.resetInactivityTimeout);
      window.addEventListener('keydown', this.resetInactivityTimeout);
      window.addEventListener('touchstart', this.resetInactivityTimeout);
      window.addEventListener('touchmove', this.resetInactivityTimeout);
      console.log('Inactivity timeout initialized');
    }
  },
  beforeDestroy() {
    clearTimeout(this.inactivityTimeout);
    window.removeEventListener('mousemove', this.resetInactivityTimeout);
    window.removeEventListener('keydown', this.resetInactivityTimeout);
    window.removeEventListener('touchstart', this.resetInactivityTimeout);
    window.removeEventListener('touchmove', this.resetInactivityTimeout);
  }
};