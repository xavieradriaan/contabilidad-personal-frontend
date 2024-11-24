<template>
  <div class="container mt-5" style="position: relative;">
    <navigation-bar :showBack="true" :showHome="false" :showLogout="false"></navigation-bar>
    <h1 class="text-center mb-4">Recuperar Contraseña/Usuario</h1>
    <form @submit.prevent="requestPasswordReset" class="card p-4 shadow-sm" v-if="!otpSent">
      <div class="mb-3">
        <label for="email" class="form-label">Correo</label>
        <div class="input-group">
          <input v-model="email" id="email" type="email" class="form-control" required @input="validateEmail" @keydown="preventSpace">
          <div v-if="isLoading" class="input-group-append">
            <span class="input-group-text">
              <div class="spinner-border spinner-border-sm" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </span>
          </div>
        </div>
        <div v-if="emailError" class="text-danger">{{ emailError }}</div>
      </div>
      <button type="submit" class="btn btn-primary w-100" :disabled="isEmailInvalid || isLoading">
        <span v-if="isLoading">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="sr-only">Loading...</span>
          </div> Enviando...
        </span>
        <span v-else>
          Enviar Código de Recuperación
        </span>
      </button>
    </form>
    <form @submit.prevent="resetPassword" class="card p-4 shadow-sm" v-else>
      <div class="mb-3">
        <label for="otp" class="form-label">Código de Recuperación</label>
        <input v-model="otp" id="otp" type="text" class="form-control" required @input="validateOTP">
        <div v-if="otpError" class="text-danger">{{ otpError }}</div>
      </div>
      <div class="mb-3">
        <label for="newPassword" class="form-label">Nueva Contraseña</label>
        <input v-model="newPassword" id="newPassword" type="password" class="form-control" required @input="validatePassword">
        <div v-if="passwordError" class="text-danger">{{ passwordError }}</div>
        <small v-if="newPassword && !passwordValid" class="text-muted">
          La contraseña debe tener al menos 5 caracteres y contener al menos 1 dígito.
        </small>
        <small v-if="passwordValid" class="text-success">
          Contraseña segura
        </small>
      </div>
      <div class="mb-3">
        <label for="confirmNewPassword" class="form-label">Confirmar Nueva Contraseña</label>
        <input v-model="confirmNewPassword" id="confirmNewPassword" type="password" class="form-control" required @input="validateConfirmPassword" @focus="confirmPasswordTouched = true">
        <div v-if="confirmPasswordTouched && confirmPasswordError" class="text-danger">{{ confirmPasswordError }}</div>
        <small v-if="confirmPasswordTouched && !confirmPasswordError && confirmNewPassword" class="text-success">
          Contraseñas coinciden
        </small>
      </div>
      <button type="submit" class="btn btn-primary w-100" :disabled="isFormInvalid">Restablecer Contraseña</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import NavigationBar from './NavigationBar.vue'

export default {
  name: 'PasswordResetComponent',
  components: {
    NavigationBar
  },
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
      this.otp = this.otp.replace(/[^0-9]/g, '') // Eliminar cualquier carácter no numérico
      if (this.otp.length !== 6) {
        this.otpError = 'El código de confirmación debe tener 6 dígitos.'
      } else {
        this.otpError = ''
      }
    },
    validatePassword() {
      // Eliminar espacios en blanco
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
      // Eliminar espacios en blanco
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