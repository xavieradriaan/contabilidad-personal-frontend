<template>
  <div class="container mt-5">
    <navigation-bar :showBack="true" :showHome="false" :showLogout="false"></navigation-bar>
    <h1 class="text-center mb-4">Registrar</h1>
    <form @submit.prevent="register" class="card p-4 shadow-sm">
      <div class="mb-3">
        <label for="username" class="form-label">Nombre de usuario</label>
        <input v-model="username" id="username" type="text" class="form-control" required autocapitalize="none" @input="validateUsername">
        <div v-if="usernameError" class="text-danger">{{ usernameError }}</div>
        <div v-if="usernameAvailable !== null" :class="{'text-success': usernameAvailable, 'text-danger': !usernameAvailable}">
          {{ usernameMessage }}
        </div>
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
      password: '',
      confirmPassword: '',
      usernameError: '',
      passwordError: '',
      confirmPasswordError: '',
      confirmPasswordTouched: false,
      passwordValid: false,
      usernameAvailable: null,
      usernameMessage: ''
    }
  },
  computed: {
    isFormInvalid() {
      return this.usernameError || this.passwordError || this.confirmPasswordError || !this.username || !this.password || !this.confirmPassword || !this.passwordValid || !this.usernameAvailable
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
    async register() {
      if (this.isFormInvalid) {
        return
      }
      try {
        const response = await axios.post('/register', {
          username: this.username,
          password: this.password
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
        this.username = ''
        this.password = ''
        this.confirmPassword = ''
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
    }
  },
  created() {
    this.username = ''
    this.password = ''
    this.confirmPassword = ''
  }
}
</script>