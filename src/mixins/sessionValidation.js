// sessionValidation.js - Mixin para validar sesiones únicas
import axios from 'axios'

export default {
  data() {
    return {
      sessionCheckInterval: null,
      sessionCheckFrequency: 30000, // Verificar cada 30 segundos
      isSessionValid: true
    }
  },
  
  mounted() {
    this.startSessionValidation()
  },
  
  beforeUnmount() {
    this.stopSessionValidation()
  },
  
  methods: {
    startSessionValidation() {
      // Solo iniciar verificación si hay token
      if (!localStorage.getItem('token')) {
        return
      }
      
      // Verificación inicial inmediata
      this.checkSessionValidity()
      
      // Configurar verificación periódica
      this.sessionCheckInterval = setInterval(() => {
        this.checkSessionValidity()
      }, this.sessionCheckFrequency)
    },
    
    stopSessionValidation() {
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval)
        this.sessionCheckInterval = null
      }
    },
    
    async checkSessionValidity() {
      try {
        // Solo verificar si tenemos token y la sesión está marcada como válida
        if (!localStorage.getItem('token') || !this.isSessionValid) {
          return
        }
        
        const response = await axios.get('/check_session')
        
        if (response.data.valid) {
          // Sesión válida - continuar normalmente
          this.isSessionValid = true
        } else {
          // Sesión inválida
          this.handleSessionExpired(response.data)
        }
        
      } catch (error) {
        // Manejar errores de red o del servidor
        if (error.response) {
          const { status, data } = error.response
          
          if (status === 401 && data.session_expired) {
            // Sesión expirada o reemplazada
            this.handleSessionExpired(data)
          } else if (status === 500) {
            // Error del servidor - mantener sesión pero reducir frecuencia
            console.warn('Error del servidor al verificar sesión')
            this.sessionCheckFrequency = 60000 // Verificar cada minuto
          }
        } else {
          // Error de red
          console.warn('Error de red al verificar sesión:', error.message)
          // No cerrar sesión por errores de red
        }
      }
    },
    
    handleSessionExpired(data) {
      // Marcar sesión como inválida para evitar verificaciones adicionales
      this.isSessionValid = false
      
      // Detener verificaciones
      this.stopSessionValidation()
      
      // Limpiar almacenamiento local
      localStorage.clear()
      
      // Determinar mensaje apropiado
      let message = 'Tu sesión ha expirado'
      let icon = 'warning'
      
      if (data.reason === 'session_replaced') {
        message = data.message || 'Tu sesión ha sido cerrada debido a un nuevo inicio de sesión desde otro dispositivo'
        icon = 'info'
      }
      
      // Mostrar notificación
      this.$swal.fire({
        icon: icon,
        title: 'Sesión Cerrada',
        text: message,
        confirmButtonText: 'Iniciar Sesión',
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: 'session-expired-popup'
        }
      }).then(() => {
        // Redirigir al login
        this.$router.push('/login')
      })
    },
    
    // Método para reiniciar la validación después del login
    restartSessionValidation() {
      this.isSessionValid = true
      this.sessionCheckFrequency = 30000 // Restablecer frecuencia normal
      this.startSessionValidation()
    },
    
    // Método para pausar temporalmente la validación
    pauseSessionValidation() {
      this.stopSessionValidation()
    }
  }
}