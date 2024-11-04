<template>
  <div class="container mt-5">
    <navigation-bar :showBack="true" :showHome="true"></navigation-bar>
    <h1 class="text-center mb-4">Registrar</h1>
    <form @submit.prevent="register" class="card p-4 shadow-sm">
      <div class="mb-3">
        <label for="username" class="form-label">Nombre de usuario</label>
        <input v-model="username" id="username" type="text" class="form-control" required>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Contraseña</label>
        <input v-model="password" id="password" type="password" class="form-control" required>
      </div>
      <button type="submit" class="btn btn-primary w-100">Registrar</button>
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
      password: ''
    }
  },
  methods: {
    async register() {
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
  }
}
</script>