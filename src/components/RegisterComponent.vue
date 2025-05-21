<template>
  <div class="register-container">
    <div class="register-animated-coins">
      <div v-for="index in 25" :key="index" class="register-coin" :class="`register-coin-${index}`">
        <img src="/monedas.png" alt="Moneda animada" class="register-coin-img">
      </div>
    </div>

    <button class="register-back-btn" @click="$router.go(-1)">
      <i class="fas fa-chevron-left"></i>
    </button>

    <main class="register-auth-content">
      <h1 class="register-auth-title">
        <span class="register-brand-text">CONTABILÍZATE</span>
        <p class="register-auth-subtitle">Registro de Usuario</p>
      </h1>

      <div class="register-auth-card">
        <form @submit.prevent="register" class="register-auth-form" v-if="!otpSent">
          <!-- Usuario -->
          <div class="register-input-group">
            <label for="username" class="register-input-label">
              <i class="fas fa-user register-icon"></i>
              <span>Nombre de usuario</span>
            </label>
            <input
              v-model="username"
              id="username"
              type="text"
              class="register-auth-input"
              :class="{'register-input-error': usernameError}"
              required
              @input="validateUsername"
            >
            <div v-if="usernameError" class="register-error-message">
              <i class="fas fa-exclamation-circle"></i>
              <span>{{ usernameError }}</span>
            </div>
            <div 
              v-if="usernameAvailable !== null && !usernameError" 
              :class="usernameAvailable ? 'register-success-message' : 'register-error-message'"
            >
              <i :class="usernameAvailable ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
              <span>{{ usernameMessage }}</span>
            </div>
          </div>

          <!-- Email -->
          <div class="register-input-group">
            <label for="email" class="register-input-label">
              <i class="fas fa-envelope register-icon"></i>
              <span>Correo electrónico</span>
            </label>
            <input
              v-model="email"
              id="email"
              type="email"
              class="register-auth-input"
              :class="{'register-input-error': emailError}"
              required
              @input="validateEmail"
              @keydown="preventSpace"
              maxlength="40"
            >
            <div v-if="emailError" class="register-error-message">
              <i class="fas fa-exclamation-circle"></i>
              <span>{{ emailError }}</span>
            </div>
            <div v-if="emailAvailable !== null && !emailError" :class="emailAvailable ? 'register-success-message' : 'register-error-message'">
              <i :class="emailAvailable ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
              <span>{{ emailMessage }}</span>
            </div>
          </div>

          <!-- Confirmar Email -->
          <div class="register-input-group">
            <label for="confirmEmail" class="register-input-label">
              <i class="fas fa-envelope register-icon"></i>
              <span>Confirmar correo</span>
            </label>
            <input
              v-model="confirmEmail"
              id="confirmEmail"
              type="email"
              class="register-auth-input"
              :class="{'register-input-error': confirmEmailError}"
              required
              @input="validateConfirmEmail"
              @keydown="preventSpace"
              @focus="confirmEmailTouched = true"
              maxlength="40"
            >
            <div v-if="confirmEmailTouched && confirmEmailError" class="register-error-message">
              <i class="fas fa-exclamation-circle"></i>
              <span>{{ confirmEmailError }}</span>
            </div>
            <div v-if="confirmEmailTouched && !confirmEmailError && email && confirmEmail" class="register-success-message">
              <i class="fas fa-check-circle"></i>
              <span>Los correos coinciden</span>
            </div>
          </div>

          <!-- Contraseña -->
          <div class="register-input-group">
            <label for="password" class="register-input-label">
              <i class="fas fa-lock register-icon"></i>
              <span>Contraseña</span>
            </label>
            <input
              v-model="password"
              id="password"
              type="password"
              class="register-auth-input"
              :class="{'register-input-error': passwordError}"
              required
              @input="validatePassword"
            >
            <div v-if="passwordError" class="register-error-message">
              <i class="fas fa-exclamation-circle"></i>
              <span>{{ passwordError }}</span>
            </div>
            <div v-if="passwordValid" class="register-success-message">
              <i class="fas fa-check-circle"></i>
              <span>Contraseña segura</span>
            </div>
          </div>

          <!-- Confirmar Contraseña -->
          <div class="register-input-group">
            <label for="confirmPassword" class="register-input-label">
              <i class="fas fa-lock register-icon"></i>
              <span>Confirmar contraseña</span>
            </label>
            <input
              v-model="confirmPassword"
              id="confirmPassword"
              type="password"
              class="register-auth-input"
              :class="{'register-input-error': confirmPasswordError}"
              required
              @input="validateConfirmPassword"
              @focus="confirmPasswordTouched = true"
            >
            <div v-if="confirmPasswordTouched && confirmPasswordError" class="register-error-message">
              <i class="fas fa-exclamation-circle"></i>
              <span>{{ confirmPasswordError }}</span>
            </div>
            <div v-if="!confirmPasswordError && confirmPasswordTouched && confirmPassword" class="register-success-message">
              <i class="fas fa-check-circle"></i>
              <span>Las contraseñas coinciden</span>
            </div>
          </div>

          <button
            type="submit"
            class="register-auth-btn register-primary-btn"
            :disabled="isFormInvalid || isSubmitting"
          >
            <span v-if="!isSubmitting">Registrarse</span>
            <span v-else>
              <i class="fas fa-spinner fa-spin"></i> Enviando...
            </span>
          </button>
        </form>

        <form @submit.prevent="confirmOTP" class="register-auth-form" v-else>
          <div class="register-input-group">
            <label for="otp" class="register-input-label">
              <i class="fas fa-shield-alt register-icon"></i>
              <span>Código de verificación</span>
            </label>
            <input
              v-model="otp"
              id="otp"
              type="text"
              class="register-auth-input"
              :class="{'register-input-error': otpError}"
              required
              @input="validateOTP"
            >
            <div v-if="otpError" class="register-error-message">
              <i class="fas fa-exclamation-circle"></i>
              <span>{{ otpError }}</span>
            </div>
          </div>

          <div class="register-otp-footer">
            <div v-if="timeLeft > 0" class="register-timer">
              <i class="fas fa-clock"></i>
              <span>Tiempo restante: {{ formattedTime }}</span>
            </div>
            <button
              v-else
              type="button"
              class="register-resend-btn"
              @click="resendOTP"
            >
              Reenviar código
            </button>
          </div>

          <button
            v-if="timeLeft > 0"
            type="submit"
            class="register-auth-btn register-primary-btn"
          >
            <span>Verificar código</span>
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  name: 'RegisterComponent',
  data() {
    return {
      username: '',
      email: '',
      confirmEmail: '',
      password: '',
      confirmPassword: '',
      otp: '',
      usernameError: '',
      emailError: '',
      confirmEmailError: '',
      passwordError: '',
      confirmPasswordError: '',
      otpError: '',
      confirmPasswordTouched: false,
      confirmEmailTouched: false,
      passwordValid: false,
      usernameAvailable: null,
      usernameMessage: '',
      emailAvailable: null,
      emailMessage: '',
      otpSent: false,
      timeLeft: 300,
      timer: null,
      isSubmitting: false
    }
  },
  computed: {
    isFormInvalid() {
      return this.usernameError || 
             this.emailError || 
             this.confirmEmailError || 
             this.passwordError || 
             this.confirmPasswordError || 
             !this.username || 
             !this.email || 
             !this.confirmEmail || 
             !this.password || 
             !this.confirmPassword || 
             !this.passwordValid || 
             !this.usernameAvailable || 
             !this.emailAvailable
    },
    formattedTime() {
      const minutes = Math.floor(this.timeLeft / 60)
      const seconds = this.timeLeft % 60
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }
  },
  methods: {
    preventSpace(event) {
      if (event.key === ' ') {
        event.preventDefault()
      }
    },
    async validateUsername() {
      if (this.username.includes(' ')) {
        this.usernameError = 'No se permiten espacios en este campo.'
        this.usernameAvailable = null
        this.usernameMessage = ''
      } else if (this.username.length < 5) {
        this.usernameError = 'El nombre de usuario debe tener al menos 5 caracteres.'
        this.usernameAvailable = null
        this.usernameMessage = ''
      } else {
        this.usernameError = ''
        try {
          const response = await axios.get('/check_username', {
            params: { username: this.username }
          })
          this.usernameAvailable = response.data.available
          this.usernameMessage = response.data.message
        } catch (error) {
          console.error('Error al verificar el nombre de usuario:', error)
          this.usernameAvailable = false
          this.usernameMessage = 'Error al verificar el nombre de usuario.'
        }
      }
    },
    async validateEmail() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.(com|ec|edu|gov|org|ae|ar|cl|ca|bo|de|es|hn|ar|br|do|mx|ni|pa|py|pe|uy|ve|co)$/i
      const invalidChars = /[!#$%^&*()=+{}[\]|\\:;"'<>,?/]/g
      
      this.email = this.email.replace(/\s/g, '')
      
      this.emailError = ''
      this.emailAvailable = null
      this.emailMessage = ''

      if (this.email.length > 40) {
        this.emailError = 'El correo no debe exceder los 40 caracteres.'
      } else if (invalidChars.test(this.email)) {
        this.emailError = 'El correo contiene caracteres no permitidos.'
      } else if (!emailPattern.test(this.email)) {
        this.emailError = 'El correo debe contener un "@" y un dominio válido.'
      } else {
        try {
          const response = await axios.get('/check_email', {
            params: { email: this.email }
          })
          
          this.emailAvailable = !response.data.exists
          this.emailMessage = response.data.message
          
          if (!this.emailAvailable) {
            this.emailError = this.emailMessage
          }
        } catch (error) {
          console.error('Error al verificar el correo:', error)
          this.emailError = 'Error al verificar la disponibilidad del correo'
        }
      }
      this.validateConfirmEmail()
    },
    validateConfirmEmail() {
      this.confirmEmail = this.confirmEmail.replace(/\s/g, '')
      this.confirmEmailError = ''
      const invalidChars = /[!#$%^&*()=+{}[\]|\\:;"'<>,?/]/g
      
      if (this.confirmEmail.length > 40) {
        this.confirmEmailError = 'El correo no debe exceder los 40 caracteres.'
      } else if (invalidChars.test(this.confirmEmail)) {
        this.confirmEmailError = 'El correo contiene caracteres no permitidos.'
      } else if (this.email || this.confirmEmail) {
        if (this.email.toLowerCase() !== this.confirmEmail.toLowerCase()) {
          this.confirmEmailError = 'Los correos electrónicos no coinciden.'
        }
      }
    },
    validatePassword() {
      this.password = this.password.replace(/\s/g, '')
      const hasDigit = /\d/.test(this.password)
      const hasMinLength = this.password.length >= 5
      this.passwordValid = hasDigit && hasMinLength
      this.passwordError = !this.passwordValid ? 'La contraseña no cumple con los requisitos.' : ''
      this.validateConfirmPassword()
    },
    validateConfirmPassword() {
      this.confirmPassword = this.confirmPassword.replace(/\s/g, '')
      this.confirmPasswordError = this.confirmPasswordTouched && 
                                  this.password !== this.confirmPassword 
                                  ? 'Las contraseñas no coinciden.' : ''
    },
    validateOTP() {
      this.otp = this.otp.replace(/\D/g, '')
      this.otpError = this.otp.length !== 6 ? 'El código de confirmación debe tener 6 dígitos.' : ''
    },
    async register() {
      if (this.isFormInvalid || this.isSubmitting) return

      this.isSubmitting = true;

      try {
        const response = await axios.post('/register', {
          username: this.username,
          email: this.email,
          password: this.password
        });

        Swal.fire({
          icon: 'success',
          title: 'Código Enviado',
          text: response.data.message,
          showConfirmButton: false,
          timer: 15000
        });

        this.otpSent = true;
        this.startTimer();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Hubo un problema al registrar el usuario.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          showConfirmButton: true
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    async confirmOTP() {
      if (this.otpError) return
      
      try {
        const response = await axios.post('/confirm_otp', {
          email: this.email,
          otp: this.otp
        })
        
        await Swal.fire({
          icon: 'success',
          title: 'Registro Exitoso',
          text: response.data.message,
          showConfirmButton: false,
          timer: 1500
        })
        
        this.$router.push('/login')
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Código de confirmación inválido o expirado.',
          showConfirmButton: true
        })
      }
    },
    startTimer() {
      this.timeLeft = 60; // Set timer to 1 minute
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) this.timeLeft--;
        else clearInterval(this.timer);
      }, 1000);
    },
    async resendOTP() {
      try {
        await axios.post('/password_reset_request', {
          email: this.email
        })
        
        Swal.fire({
          icon: 'success',
          title: 'Código Enviado',
          text: 'Se ha reenviado el código de verificación',
          showConfirmButton: false,
          timer: 1500
        })
        
        this.startTimer()
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al enviar el código nuevamente.',
          showConfirmButton: true
        })
      }
    }
  },
  created() {
    this.username = ''
    this.email = ''
    this.confirmEmail = ''
    this.password = ''
    this.confirmPassword = ''
    this.otp = ''
  }
}
</script>

<style scoped>
@import './RegisterComponent.css';
</style>