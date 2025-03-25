<template>
  <div class="login-container">
    <div class="login-animated-coins">
      <div v-for="index in 25" :key="index" class="login-coin" :class="`login-coin-${index}`">
        <img src="/monedas.png" alt="Moneda animada" class="login-coin-img">
      </div>
    </div>

    <!-- Botón de regreso minimalista -->
    <button class="login-back-btn" @click="$router.go(-1)">
      <i class="fas fa-chevron-left"></i>
    </button>

    <main class="login-auth-content">
      <h1 class="login-auth-title">
        <span class="login-brand-text">CONTABILÍZATE</span>
        <p class="login-auth-subtitle">Inicio de Sesión Seguro</p>
      </h1>

      <div class="login-auth-card">
        <form @submit.prevent="login" class="login-auth-form">
          <div class="login-input-group">
            <label for="username" class="login-input-label">
              <i class="fas fa-user login-icon"></i>
              <span>Nombre de usuario</span>
            </label>
            <input
              v-model="username"
              id="username"
              type="text"
              class="login-auth-input"
              :class="{'login-input-error': errorMessage}"
              required
            >
          </div>

          <div class="login-input-group">
            <label for="password" class="login-input-label">
              <i class="fas fa-lock login-icon"></i>
              <span>Contraseña</span>
            </label>
            <input
              v-model="password"
              id="password"
              type="password"
              class="login-auth-input"
              :class="{'login-input-error': errorMessage}"
              required
            >
          </div>

          <div v-if="errorMessage" class="login-error-message">
            <i class="fas fa-exclamation-circle login-error-icon"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <button
            type="submit"
            class="login-auth-btn login-login-btn"
            :disabled="isFormInvalid"
            :class="{'login-loading': isLoading}"
          >
            <span v-if="!isLoading">Acceder al Sistema</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
        </form>

        <div class="login-auth-footer">
          <router-link to="/password_reset" class="login-password-reset-link">
            ¿Olvidaste tu contraseña?
          </router-link>
          <span class="login-footer-separator">|</span>
          <router-link to="/register" class="login-password-reset-link">
            Crear nueva cuenta
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  name: 'LoginComponent',
  data() {
    return {
      username: '',
      password: '',
      isLoading: false,
      remainingAttempts: null,
      errorMessage: ''
    }
  },
  computed: {
    isFormInvalid() {
      return !this.username || !this.password || this.isLoading
    }
  },
  methods: {
    async login() {
      if (this.isFormInvalid) return
      
      this.isLoading = true
      try {
        const response = await axios.post('/login', {
          username: this.username,
          password: this.password
        })
        
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('username', this.username)
        
        await Swal.fire({
          icon: 'success',
          title: 'Inicio de Sesión Exitoso',
          text: 'Bienvenido de nuevo',
          showConfirmButton: false,
          timer: 1500
        })
        
        this.$router.push('/dashboard')
      } catch (error) {
        this.handleLoginError(error)
      } finally {
        this.isLoading = false
      }
    },
    handleLoginError(error) {
      console.error('Error al iniciar sesión:', error)
      this.password = ''
      
      const errorMessage = error.response?.data?.remaining_attempts !== undefined 
        ? `Credenciales Incorrectas. Intentos restantes: ${error.response.data.remaining_attempts}`
        : error.response ? 'Credenciales Incorrectas.' : 'Error al conectar con el servidor.'
      
      this.errorMessage = errorMessage
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        showConfirmButton: true
      })
    }
  }
}
</script>

<style scoped>
@import './LoginComponent.css';
</style>