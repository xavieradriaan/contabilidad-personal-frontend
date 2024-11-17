<template>
  <div class="container mt-5" style="position: relative;">
    <navigation-bar :showBack="true" :showHome="false" :showLogout="false"></navigation-bar>
    <h1 class="text-center mb-4">Iniciar Sesión</h1>
    <form @submit.prevent="login" class="card p-4 shadow-sm">
      <div class="mb-3">
        <label for="username" class="form-label">Nombre de usuario</label>
        <input v-model="username" id="username" type="text" class="form-control" required>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Contraseña</label>
        <input v-model="password" id="password" type="password" class="form-control" required>
      </div>
      <button type="submit" class="btn btn-primary w-100" :disabled="isFormInvalid">Iniciar Sesión</button>
    </form>
    <button class="btn btn-secondary back-button" @click="goBack">Regresar</button>
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
      isLoading: false
    }
  },
  computed: {
    isFormInvalid() {
      return !this.username || !this.password || this.isLoading
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    async login() {
      if (this.isFormInvalid) {
        return
      }
      this.isLoading = true
      try {
        const response = await axios.post('/login', {
          username: this.username,
          password: this.password
        })
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('username', this.username)
        Swal.fire({
          icon: 'success',
          title: 'Inicio de Sesión Exitoso',
          text: 'Bienvenido de nuevo',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.$router.push('/dashboard')
        })
      } catch (error) {
        console.error('Error al iniciar sesión:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Nombre de usuario o contraseña incorrectos',
          showConfirmButton: true
        })
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>