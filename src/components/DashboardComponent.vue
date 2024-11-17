<template>
  <div class="container mt-5" style="position: relative;">
    <navigation-bar :showHome="false" :showLogout="true" @logout-clicked="logout"></navigation-bar>
    <h1 class="text-center mb-4">Dashboard</h1>
    <nav class="nav nav-pills justify-content-center mb-4">
      <router-link class="nav-link" to="/ingresos">Registrar Ingresos</router-link>
      <router-link class="nav-link" to="/egresos">Registrar Egresos</router-link>
      <router-link class="nav-link" to="/total">Balance Detalles</router-link>
      <router-link class="nav-link" to="/informes_graficos">Informes Gráficos</router-link>
      <router-link class="nav-link" to="/pagos_recurrentes">Pagos Recurrentes</router-link>
      <router-link class="nav-link" to="/depositos_bancos">Depósitos en Bancos</router-link>
    </nav>
  </div>
</template>

<script>
import NavigationBar from './NavigationBar.vue'

export default {
  name: 'DashboardComponent',
  components: {
    NavigationBar
  },
  methods: {
    logout() {
      console.log('Logout confirmed'); // Log
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      this.$router.push('/login');
    }
  }
}
</script>