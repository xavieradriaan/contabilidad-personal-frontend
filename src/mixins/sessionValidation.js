// sessionValidation.js - Mixin para validar sesiones únicas
import axios from 'axios'

export default {
  data() {
    return {
      sessionCheckInterval: null,
      sessionCheckFrequency: this.getOptimalCheckFrequency(), // Frecuencia optimizada por dispositivo
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
    getOptimalCheckFrequency() {
      // Detectar si es dispositivo móvil para ajustar frecuencia
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isTablet = /iPad|Android.*(?!.*Mobile)/i.test(navigator.userAgent)
      
      // Frecuencias optimizadas:
      // Mobile: más frecuente para mejor respuesta
      // Desktop: estándar
      // Tablet: intermedio
      if (isMobile) {
        return 20000 // 20 segundos para móviles
      } else if (isTablet) {
        return 25000 // 25 segundos para tablets
      } else {
        return 30000 // 30 segundos para desktop
      }
    },
    
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
        
        // DEBUG: Log de la respuesta
        console.log('Session check response:', response.data)
        if (response.data.debug_info) {
          console.log('Session debug info:', response.data.debug_info)
        }
        
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
            // Error del servidor - mantener sesión pero aumentar frecuencia temporalmente
            console.warn('Error del servidor al verificar sesión')
            this.sessionCheckFrequency = Math.min(this.sessionCheckFrequency * 2, 60000) // Máximo 1 minuto
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
      this.sessionCheckFrequency = this.getOptimalCheckFrequency() // Restablecer frecuencia optimizada
      this.startSessionValidation()
    },
    
    // Método para pausar temporalmente la validación
    pauseSessionValidation() {
      this.stopSessionValidation()
    }
  }
}