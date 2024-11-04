<template>
    <div class="container text-center">
      <h1 class="my-4">Bienvenido a la Aplicación de Contabilidad Personal</h1>
      <div class="link-buttons">
        <router-link class="btn btn-primary mb-2" to="/login">Login</router-link>
        <router-link class="btn btn-secondary" to="/register">Register</router-link>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HomeComponent'
  }
  </script>