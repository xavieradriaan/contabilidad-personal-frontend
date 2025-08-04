<template>
  <div class="dashboard-container">
    <div class="dashboard-animated-coins">
      <div v-for="index in 25" :key="index" class="dashboard-coin" :class="`dashboard-coin-${index}`">
        <img src="/monedas.png" alt="Moneda animada" class="dashboard-coin-img">
      </div>
    </div>

    <navigation-bar :showHome="false" :showLogout="true" @logout-clicked="logout"></navigation-bar>

    <main class="dashboard-auth-content">
      <h1 class="dashboard-auth-title">
        <span class="dashboard-brand-text">CONTABILÍZATE</span>
        <p class="dashboard-auth-subtitle">Panel de Control</p>
      </h1>

      <div class="dashboard-auth-card">
        <nav class="dashboard-nav">
          <router-link 
            v-for="(link, index) in navLinks" 
            :key="index" 
            :to="link.path" 
            class="dashboard-auth-btn"
            active-class="dashboard-active-link"
          >
            <i :class="link.icon"></i>
            {{ link.text }}
          </router-link>
        </nav>
      </div>
    </main>
  </div>
</template>

<script>
import NavigationBar from './NavigationBar.vue'
import sessionValidation from '@/mixins/sessionValidation.js'
import axios from 'axios'

export default {
  name: 'DashboardComponent',
  mixins: [sessionValidation],
  components: {
    NavigationBar
  },
  data() {
    return {
      navLinks: [
        { path: '/ingresos', text: 'Registrar Ingresos', icon: 'fas fa-wallet' },
        { path: '/egresos', text: 'Registrar Egresos', icon: 'fas fa-receipt' },
        { path: '/total', text: 'Balance Detalles', icon: 'fas fa-chart-pie' },
        { path: '/informes_graficos', text: 'Informes Gráficos', icon: 'fas fa-chart-line' },
        { path: '/pagos_recurrentes', text: 'Pagos Recurrentes', icon: 'fas fa-sync-alt' },
        { path: '/depositos_bancos', text: 'Depósitos en Bancos', icon: 'fas fa-piggy-bank' },
        { path: '/credenciales', text: 'Credenciales', icon: 'fas fa-key' }
      ]
    }
  },
  async created() {
    await this.fetchRecordatorios();
  },
  methods: {
    async fetchRecordatorios() {
      try {
        const response = await axios.get('/recordatorios_pagos_recurrentes', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const recordatorios = response.data;
        if (recordatorios.length > 0) {
          const categorias = recordatorios.map(recordatorio => 
            `<span style="color: var(--primary-blue); font-weight: 500;">- ${recordatorio.categoria}</span>`
          ).join('<br>');
          this.$swal.fire({
            icon: 'info',
            title: '<span class="dashboard-brand-text">Recordatorio</span>',
            html: `
              <p class="dashboard-auth-subtitle">Recuerda realizar el pago de:</p>
              ${categorias}
            `,
            confirmButtonText: 'Entendido',
            customClass: {
              popup: 'dashboard-recordatorio-popup'
            }
          });
        }
      } catch (error) {
        console.error('Error al obtener recordatorios:', error);
      }
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
@import './DashboardComponent.css';
</style>