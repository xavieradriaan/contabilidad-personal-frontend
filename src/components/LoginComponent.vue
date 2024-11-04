<template>
  <div class="container">
    <navigation-bar :showHome="true"></navigation-bar>
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input v-model="username" id="username" class="form-control" placeholder="Username" required>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input v-model="password" id="password" type="password" class="form-control" placeholder="Password" required>
      </div>
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <button type="submit" class="btn btn-primary">Login</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import NavigationBar from './NavigationBar.vue'

export default {
  name: 'LoginComponent',
  components: {
    NavigationBar
  },
  data() {
    return {
      username: '',
      password: '',
      errorMessage: ''
    }
  },
  methods: {
    async login() {
      try {
        const response = await axios.post('/login', {
          username: this.username,
          password: this.password
        })
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('username', this.username)
        Swal.fire({
          icon: 'success',
          title: 'Ingreso Exitoso!',
          text: 'Has iniciado sesión correctamente.',
          showConfirmButton: false,
          timer: 1500
        })
        this.$router.push('/dashboard')
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          let errorMessage = error.response.data.message
          if (error.response.data.remaining_attempts !== undefined) {
            errorMessage = `Credenciales Incorrectas. Intentos restantes: ${error.response.data.remaining_attempts}`
          }
          this.errorMessage = errorMessage
          this.password = ''  // Vaciar el campo de contraseña
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage
          })
        } else {
          this.errorMessage = 'An error occurred. Please try again.'
          this.password = ''  // Vaciar el campo de contraseña
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred. Please try again.'
          })
        }
      }
    }
  }
}
</script>

<style scoped>
.alert {
  margin-top: 10px;
}
</style>