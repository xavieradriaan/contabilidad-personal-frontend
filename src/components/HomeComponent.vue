<template>
  <div class="container text-center">
    <h1 class="my-4 welcome-message">Bienvenido a Contabilízate, tu aplicación de Contabilidad Personal</h1>
    <div class="link-buttons mt-5">
      <router-link class="btn btn-primary mb-2" to="/login">Login</router-link>
      <router-link class="btn btn-secondary mb-2" to="/register">Register</router-link>
    </div>
    <router-link class="forgot-password-link" to="/password_reset">¿Olvidó su Contraseña/Usuario?</router-link>
  </div>
</template>

<script>
export default {
  name: 'HomeComponent'
}
</script>