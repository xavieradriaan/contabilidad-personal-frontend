export default {
  methods: {
    goBack() {
      // Verificar si hay historial para retroceder
      if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        // Si no hay historial, ir al dashboard o home según el estado de autenticación
        const token = localStorage.getItem('token');
        if (token) {
          this.$router.push('/dashboard');
        } else {
          this.$router.push('/');
        }
      }
    },
    
    // Método alternativo más robusto para navegación hacia atrás
    safeGoBack(fallbackRoute = '/dashboard') {
      try {
        // Verificar que el token siga siendo válido antes de navegar
        const token = localStorage.getItem('token');
        
        if (!token && this.$route.meta.requiresAuth) {
          // Si se perdió el token y la ruta requiere autenticación
          this.$router.push('/login');
          return;
        }
        
        // Intentar ir hacia atrás en el historial
        if (window.history.length > 1) {
          this.$router.go(-1);
        } else {
          // Fallback a la ruta especificada
          this.$router.push(fallbackRoute);
        }
      } catch (error) {
        console.error('Error en navegación:', error);
        // En caso de error, ir a la ruta de fallback
        this.$router.push(fallbackRoute);
      }
    }
  }
};