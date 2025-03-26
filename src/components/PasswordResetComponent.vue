<template>
  <div class="password-reset-container">
    <div class="password-reset-animated-coins">
      <div v-for="index in 25" :key="index" class="password-reset-coin" :class="`password-reset-coin-${index}`">
        <img src="/monedas.png" alt="Moneda animada" class="password-reset-coin-img">
      </div>
    </div>

    <button class="password-reset-back-btn" @click="$router.go(-1)">
      <i class="fas fa-chevron-left"></i>
    </button>

    <main class="password-reset-auth-content">
      <h1 class="password-reset-auth-title">
        <span class="password-reset-brand-text">CONTABILÍZATE</span>
        <p class="password-reset-auth-subtitle">Recuperación de Acceso</p>
      </h1>

      <div class="password-reset-auth-card">
        <form @submit.prevent="requestPasswordReset" class="password-reset-auth-form" v-if="!otpSent">
          <div class="password-reset-input-group">
            <label for="email" class="password-reset-input-label">
              <i class="fas fa-envelope password-reset-icon"></i>
              <span>Correo Electrónico</span>
            </label>
            <input
              v-model="email"
              id="email"
              type="email"
              class="password-reset-auth-input"
              :class="{'password-reset-input-error': emailError}"
              required
              @input="validateEmail"
              @keydown="preventSpace"
            >
            <div v-if="isLoading" class="password-reset-loading">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
          </div>
          <div v-if="emailError" class="password-reset-error-message">
            <i class="fas fa-exclamation-circle password-reset-error-icon"></i>
            <span>{{ emailError }}</span>
          </div>

          <button
            type="submit"
            class="password-reset-auth-btn password-reset-submit-btn"
            :disabled="isEmailInvalid || isLoading"
            :class="{'password-reset-loading': isLoading}"
          >
            <span v-if="!isLoading">Enviar Código de Recuperación</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
        </form>

        <form @submit.prevent="resetPassword" class="password-reset-auth-form" v-else>
          <div class="password-reset-input-group">
            <label for="otp" class="password-reset-input-label">
              <i class="fas fa-key password-reset-icon"></i>
              <span>Código de Recuperación</span>
            </label>
            <input
              v-model="otp"
              id="otp"
              type="text"
              class="password-reset-auth-input"
              :class="{'password-reset-input-error': otpError}"
              required
              @input="validateOTP"
            >
            <div v-if="otpError" class="password-reset-error-message">
              <i class="fas fa-exclamation-circle password-reset-error-icon"></i>
              <span>{{ otpError }}</span>
            </div>
          </div>

          <div class="password-reset-input-group">
            <label for="newPassword" class="password-reset-input-label">
              <i class="fas fa-lock password-reset-icon"></i>
              <span>Nueva Contraseña</span>
            </label>
            <input
              v-model="newPassword"
              id="newPassword"
              type="password"
              class="password-reset-auth-input"
              :class="{'password-reset-input-error': passwordError}"
              required
              @input="validatePassword"
            >
            <div v-if="passwordError" class="password-reset-error-message">
              <i class="fas fa-exclamation-circle password-reset-error-icon"></i>
              <span>{{ passwordError }}</span>
            </div>
            <small v-if="newPassword && !passwordValid" class="password-reset-hint">
              La contraseña debe tener al menos 5 caracteres y contener al menos 1 dígito.
            </small>
            <small v-if="passwordValid" class="password-reset-success">
              <i class="fas fa-check-circle"></i> Contraseña segura
            </small>
          </div>

          <div class="password-reset-input-group">
            <label for="confirmNewPassword" class="password-reset-input-label">
              <i class="fas fa-lock password-reset-icon"></i>
              <span>Confirmar Nueva Contraseña</span>
            </label>
            <input
              v-model="confirmNewPassword"
              id="confirmNewPassword"
              type="password"
              class="password-reset-auth-input"
              :class="{'password-reset-input-error': confirmPasswordError}"
              required
              @input="validateConfirmPassword"
              @focus="confirmPasswordTouched = true"
            >
            <div v-if="confirmPasswordTouched && confirmPasswordError" class="password-reset-error-message">
              <i class="fas fa-exclamation-circle password-reset-error-icon"></i>
              <span>{{ confirmPasswordError }}</span>
            </div>
            <small v-if="confirmPasswordTouched && !confirmPasswordError && confirmNewPassword" class="password-reset-success">
              <i class="fas fa-check-circle"></i> Contraseñas coinciden
            </small>
          </div>

          <button
            type="submit"
            class="password-reset-auth-btn password-reset-submit-btn"
            :disabled="isFormInvalid"
          >
            Restablecer Contraseña
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
// Mantener el mismo script del componente original
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  name: 'PasswordResetComponent',
  data() {
    return {
      email: '',
      otp: '',
      newPassword: '',
      confirmNewPassword: '',
      otpSent: false,
      emailError: '',
      otpError: '',
      passwordError: '',
      confirmPasswordError: '',
      confirmPasswordTouched: false,
      passwordValid: false,
      isLoading: false
    }
  },
  computed: {
    isEmailInvalid() {
      return this.emailError !== '' || this.email === '' || this.isLoading
    },
    isFormInvalid() {
      return this.passwordError || this.confirmPasswordError || !this.newPassword || !this.confirmNewPassword || !this.passwordValid
    }
  },
  methods: {
    preventSpace(event) {
      if (event.key === ' ') {
        event.preventDefault()
      }
    },
    async validateEmail() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(this.email)) {
        this.emailError = 'El correo debe contener un "@" y un ".com".'
      } else if (!this.email.endsWith('.com')) {
        this.emailError = 'El correo debe terminar en ".com".'
      } else {
        this.isLoading = true
        try {
          const response = await axios.get('/check_email', {
            params: { email: this.email }
          })
          if (response.data.exists) {
            this.emailError = ''
          } else {
            this.emailError = 'Correo Electrónico no existe.'
          }
        } catch (error) {
          console.error('Error al verificar el correo:', error)
          this.emailError = 'Correo Electrónico no existe.'
        } finally {
          this.isLoading = false
        }
      }
    },
    validateOTP() {
      this.otp = this.otp.replace(/[^0-9]/g, '')
      if (this.otp.length !== 6) {
        this.otpError = 'El código de confirmación debe tener 6 dígitos.'
      } else {
        this.otpError = ''
      }
    },
    validatePassword() {
      this.newPassword = this.newPassword.replace(/\s/g, '')
      const hasDigit = /\d/.test(this.newPassword)
      const hasMinLength = this.newPassword.length >= 5
      this.passwordValid = hasDigit && hasMinLength
      if (!this.passwordValid) {
        this.passwordError = 'La contraseña no cumple con los requisitos.'
      } else {
        this.passwordError = ''
      }
      this.validateConfirmPassword()
    },
    validateConfirmPassword() {
      this.confirmNewPassword = this.confirmNewPassword.replace(/\s/g, '')
      if (this.confirmPasswordTouched && this.newPassword !== this.confirmNewPassword) {
        this.confirmPasswordError = 'Las contraseñas no coinciden.'
      } else {
        this.confirmPasswordError = ''
      }
    },
    async requestPasswordReset() {
      if (this.emailError || this.email === '') {
        return
      }
      this.isLoading = true
      try {
        const response = await axios.post('/password_reset_request', {
          email: this.email
        })
        Swal.fire({
          icon: 'success',
          title: 'Código Enviado',
          text: response.data.message,
          showConfirmButton: false,
          timer: 1500
        })
        this.otpSent = true
      } catch (error) {
        console.error('Error al solicitar restablecimiento de contraseña:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al solicitar el restablecimiento de contraseña.',
          showConfirmButton: true
        })
      } finally {
        this.isLoading = false
      }
    },
    async resetPassword() {
      if (this.isFormInvalid || this.otpError) {
        return
      }
      try {
        const response = await axios.post('/password_reset', {
          email: this.email,
          otp: this.otp,
          new_password: this.newPassword
        })
        Swal.fire({
          icon: 'success',
          title: 'Contraseña Restablecida',
          text: response.data.message,
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.$router.push('/login')
        })
        this.email = ''
        this.otp = ''
        this.newPassword = ''
        this.confirmNewPassword = ''
      } catch (error) {
        console.error('Error al restablecer la contraseña:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Código de confirmación incorrecto o expirado.',
          showConfirmButton: true
        })
      }
    }
  },
  created() {
    this.email = ''
    this.otp = ''
    this.newPassword = ''
    this.confirmNewPassword = ''
  }
}
</script>

<style scoped>
@import './PasswordResetComponent.css';
</style>