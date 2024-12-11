export default {
  data() {
    return {
      inactivityTimeout: null,
      logoutTime: 50 * 8 * 1000 // 8 segundos en milisegundos
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
        showConfirmButton: true
      });
    }
  },
  mounted() {
    this.resetInactivityTimeout();
    window.addEventListener('mousemove', this.resetInactivityTimeout);
    window.addEventListener('keydown', this.resetInactivityTimeout);
    console.log('Inactivity timeout initialized');
  },
  beforeDestroy() {
    clearTimeout(this.inactivityTimeout);
    window.removeEventListener('mousemove', this.resetInactivityTimeout);
    window.removeEventListener('keydown', this.resetInactivityTimeout);
  }
};