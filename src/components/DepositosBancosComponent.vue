<template>
  <div class="container mt-5">
    <navigation-bar :showBack="true" :showHome="true" :showLogout="true"></navigation-bar>
    <h1 class="text-center mb-4">Depósitos en Bancos</h1>
    <form @submit.prevent="fetchDepositos" class="mb-4">
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="year" class="form-label">Año:</label>
          <input v-model="year" type="number" id="year" class="form-control" min="2000" max="2100" required>
        </div>
        <div class="col-md-6">
          <label for="month" class="form-label">Mes:</label>
          <input v-model="month" type="number" id="month" class="form-control" min="1" max="12" required>
        </div>
      </div>
      <button type="submit" class="btn btn-primary w-100 mb-3">Consultar</button>
    </form>
    <div class="card mb-4">
      <div class="card-body">
        <p><strong>Total a Depositar:</strong> ${{ totalDepositos.toFixed(2) }}</p>
      </div>
    </div>
    <div class="detalles">
      <h2 class="text-center mb-4">Detalles de Depósitos en Bancos</h2>
      <div v-for="(egresos, banco) in depositosPorBanco" :key="banco" class="mb-4">
        <h3>{{ banco }}</h3>
        <table class="table table-striped table-hover">
          <thead class="table-dark">
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
</template>

<script>
import axios from 'axios'
import NavigationBar from './NavigationBar.vue'

export default {
  name: 'DepositosBancosComponent',
  components: {
    NavigationBar
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