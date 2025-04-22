<template>
  <div class="depositos-container">
    <!-- Agregar el componente NavigationBar -->
    <NavigationBar />
    <!-- Animación de monedas -->
    <div class="depositos-animated-coins">
      <div v-for="index in 25" :key="index" class="depositos-coin" :class="`depositos-coin-${index}`">
        <img src="/monedas.png" alt="Moneda animada" class="depositos-coin-img">
      </div>
    </div>

    <!-- Botón de regreso -->
    <button class="depositos-back-btn" @click="$router.go(-1)">
      <i class="fas fa-chevron-left"></i>
    </button>

    <main class="depositos-main-content">
      <h1 class="depositos-main-title">
        <span class="depositos-brand-text">CONTABILÍZATE</span>
        <p class="depositos-main-subtitle">Gestión de Depósitos Bancarios</p>
      </h1>

      <div class="depositos-content-card">
        <form @submit.prevent="fetchDepositos" class="depositos-form">
          <div class="depositos-input-group-row">
            <div class="depositos-input-group">
              <label for="year" class="depositos-input-label">
                <i class="fas fa-calendar-alt depositos-icon"></i>
                <span>Año</span>
              </label>
              <input
                v-model="year"
                id="year"
                type="number"
                class="depositos-auth-input"
                min="2000"
                max="2100"
                required
              >
            </div>
            
            <div class="depositos-input-group">
              <label for="month" class="depositos-input-label">
                <i class="fas fa-calendar depositos-icon"></i>
                <span>Mes</span>
              </label>
              <input
                v-model="month"
                id="month"
                type="number"
                class="depositos-auth-input"
                min="1"
                max="12"
                required
              >
            </div>
          </div>

          <button type="submit" class="depositos-auth-btn">
            Consultar Depósitos
          </button>
        </form>

        <div class="depositos-total-card">
          <p class="depositos-total-text">
            <strong>Total a Depositar:</strong> 
            <span>${{ totalDepositos.toFixed(2) }}</span>
          </p>
        </div>

        <div class="depositos-detalles">
          <h2 class="depositos-detalles-title">Detalles por Banco</h2>
          
          <div v-for="(egresos, banco) in depositosPorBanco" :key="banco" class="depositos-banco-group">
            <h3 class="depositos-banco-title">{{ banco }}</h3>
            
            <div class="depositos-table-container">
              <table class="depositos-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Categoría</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="egreso in egresos" :key="egreso.fecha + egreso.categoria">
                    <td>{{ egreso.fecha }}</td>
                    <td>{{ egreso.categoria }}</td>
                    <td>${{ egreso.monto.toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import NavigationBar from './NavigationBar.vue' // Reintegrado porque ahora se usa

export default {
  name: 'DepositosBancosComponent',
  components: {
    NavigationBar // Mantener porque ahora se usa
  },
  data() {
    return {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      depositosPorBanco: {},
      totalDepositos: 0
    }
  },
  async created() {
    await this.fetchDepositos()
  },
  methods: {
    async fetchDepositos() {
      try {
        const response = await axios.get('/depositos_bancos', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          params: {
            year: this.year,
            month: this.month
          }
        })
        this.depositosPorBanco = response.data.depositosPorBanco
        this.totalDepositos = response.data.totalDepositos
      } catch (error) {
        console.error('Error al obtener los depósitos en bancos:', error)
      }
    }
  }
}
</script>

<style scoped>
@import './DepositosBancosComponent.css';
</style>