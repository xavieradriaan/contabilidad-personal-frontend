<template>
  <div class="container mt-5" style="position: relative;">
    <navigation-bar :showBack="true" :showHome="false" :showLogout="false"></navigation-bar>
    <h1 class="text-center mb-4">Registrar</h1>
    <form @submit.prevent="register" class="card p-4 shadow-sm" v-if="!otpSent">
      <div class="mb-3">
        <label for="username" class="form-label">Nombre de usuario</label>
        <input v-model="username" id="username" type="text" class="form-control" required autocapitalize="none" @input="validateUsername">
        <div v-if="usernameError" class="text-danger">{{ usernameError }}</div>
        <div v-if="usernameAvailable !== null" :class="{'text-success': usernameAvailable, 'text-danger': !usernameAvailable}">
          {{ usernameMessage }}
        </div>
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Correo</label>
        <div class="input-group">
          <input v-model="email" id="email" type="email" class="form-control" required @input="validateEmail" @keydown="preventSpace">
        </div>
        <div v-if="emailError" class="text-danger">{{ emailError }}</div>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Contraseña</label>
        <input v-model="password" id="password" type="password" class="form-control" required autocapitalize="none" @input="validatePassword">
        <div v-if="passwordError" class="text-danger">{{ passwordError }}</div>
        <small v-if="password && !passwordValid" class="text-muted">
          La contraseña debe tener al menos 5 caracteres y contener al menos 1 dígito.
        </small>
        <small v-if="passwordValid" class="text-success">
          Contraseña segura
        </small>
      </div>
      <div class="mb-3">
        <label for="confirmPassword" class="form-label">Confirmar Contraseña</label>
        <input v-model="confirmPassword" id="confirmPassword" type="password" class="form-control" required autocapitalize="none" @input="validateConfirmPassword" @focus="confirmPasswordTouched = true">
        <div v-if="confirmPasswordTouched && confirmPasswordError" class="text-danger">{{ confirmPasswordError }}</div>
        <small v-if="confirmPasswordTouched && !confirmPasswordError && confirmPassword" class="text-success">
          Contraseñas coinciden
        </small>
      </div>
      <button type="submit" class="btn btn-primary w-100" :disabled="isFormInvalid">Registrar</button>
    </form>
    <form @submit.prevent="confirmOTP" class="card p-4 shadow-sm" v-else>
      <div class="mb-3">
        <label for="otp" class="form-label">Código de Confirmación</label>
        <input v-model="otp" id="otp" type="text" class="form-control" required @input="validateOTP">
        <div v-if="otpError" class="text-danger">{{ otpError }}</div>
      </div>
      <div class="mb-3 text-center">
        <div v-if="timeLeft > 0" class="countdown-timer">
          <span class="countdown-text">Tiempo restante:</span>
          <span class="countdown-time">{{ formattedTime }}</span>
        </div>
        <button v-else type="button" class="btn w-100" @click="resendOTP">Enviar código nuevamente</button>
      </div>
      <button v-if="timeLeft > 0" type="submit" class="btn btn-primary w-100">Confirmar Código</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import NavigationBar from './NavigationBar.vue'

export default {
  name: 'RegisterComponent',
  components: {
    NavigationBar
  },
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      otp: '',
      usernameError: '',
      emailError: '',
      passwordError: '',
      confirmPasswordError: '',
      otpError: '',
      confirmPasswordTouched: false,
      passwordValid: false,
      usernameAvailable: null,
      usernameMessage: '',
      otpSent: false,
      timeLeft: 300, // 5 minutos en segundos
      timer: null
    }
  },
  computed: {
    isFormInvalid() {
      return this.usernameError || this.emailError || this.passwordError || this.confirmPasswordError || !this.username || !this.email || !this.password || !this.confirmPassword || !this.passwordValid || !this.usernameAvailable
    },
    formattedTime() {
      const minutes = Math.floor(this.timeLeft / 60)
      const seconds = this.timeLeft % 60
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }
  },
  methods: {
    async validateUsername() {
      if (this.username.includes(' ')) {
        this.usernameError = 'No se permiten espacios en este campo.'
        this.usernameAvailable = false
        this.usernameMessage = ''
      } else if (this.username.length < 5) {
        this.usernameError = 'El nombre de usuario debe tener al menos 5 caracteres.'
        this.usernameAvailable = false
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
        this.emailError = ''
      }
    },
    validatePassword() {
      // Eliminar espacios en blanco
      this.password = this.password.replace(/\s/g, '')

      const hasDigit = /\d/.test(this.password)
      const hasMinLength = this.password.length >= 5
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
      this.confirmPassword = this.confirmPassword.replace(/\s/g, '')

      if (this.confirmPasswordTouched && this.password !== this.confirmPassword) {
        this.confirmPasswordError = 'Las contraseñas no coinciden.'
      } else {
        this.confirmPasswordError = ''
      }
    },
    validateOTP() {
      this.otp = this.otp.replace(/\D/g, '') // Eliminar cualquier carácter no numérico
      if (this.otp.length !== 6) {
        this.otpError = 'El código de confirmación debe tener 6 dígitos.'
      } else {
        this.otpError = ''
      }
    },
    async register() {
      if (this.isFormInvalid) {
        return
      }
      try {
        const response = await axios.post('/register', {
          username: this.username,
          email: this.email,
          password: this.password
        })
        Swal.fire({
          icon: 'success',
          title: 'Código Enviado',
          text: response.data.message,
          showConfirmButton: false,
          timer: 15000 // Mostrar el mensaje durante 15 segundos
        })
        this.otpSent = true
        this.startTimer()
      } catch (error) {
        if (error.response && error.response.status === 400) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response.data.message,
            showConfirmButton: true
          })
        } else {
          console.error('Error al registrar usuario:', error)
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al registrar el usuario.',
            showConfirmButton: true
          })
        }
      }
    },
    async confirmOTP() {
      if (this.otpError) {
        return
      }
      try {
        const response = await axios.post('/confirm_otp', {
          email: this.email,
          otp: this.otp
        })
        Swal.fire({
          icon: 'success',
          title: 'Registro Exitoso',
          text: response.data.message,
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.$router.push('/login')
        })
      } catch (error) {
        console.error('Error al confirmar OTP:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Código de confirmación inválido o expirado.',
          showConfirmButton: true
        })
      }
    },
    startTimer() {
      this.timeLeft = 300 // 5 minutos en segundos
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--
        } else {
          clearInterval(this.timer)
        }
      }, 1000)
    },
    async resendOTP() {
      try {
        const response = await axios.post('/send_recovery_otp', {
          email: this.email
        })
        Swal.fire({
          icon: 'success',
          title: 'Código Enviado',
          text: response.data.message,
          showConfirmButton: false,
          timer: 1500
        })
        this.startTimer()
      } catch (error) {
        console.error('Error al enviar el código nuevamente:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al enviar el código nuevamente.',
          showConfirmButton: true
        })
      }
    },
    goBack() {
      this.$router.go(-1)
    },
    goHome() {
      this.$router.push('/')
    }
  },
  created() {
    this.username = ''
    this.email = ''
    this.password = ''
    this.confirmPassword = ''
    this.otp = ''
  }
}
</script>