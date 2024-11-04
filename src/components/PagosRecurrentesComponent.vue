<template>
  <div class="container mt-5">
    <navigation-bar :showBack="true" :showHome="true" :showLogout="true"></navigation-bar>
    <h1 class="text-center mb-4">Pagos Recurrentes</h1>
    <div class="card p-4 shadow-sm">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Pagado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pago in pagosRecurrentes" :key="pago.categoria">
            <td>{{ pago.categoria }}</td>
            <td>{{ formatDate(pago.fecha) }}</td>
            <td>{{ parseFloat(pago.monto).toFixed(2) }}</td>
            <td>
              <input type="checkbox" v-model="pago.pagado" disabled>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="text-end mt-3">
        <strong>Total Pagos Recurrentes: {{ totalPagosRecurrentes }}</strong>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import NavigationBar from './NavigationBar.vue'

export default {
  name: 'PagosRecurrentesComponent',
  components: {
    NavigationBar
  },
  data() {
    return {
      pagosRecurrentes: []
    }
  },
  computed: {
    totalPagosRecurrentes() {
      return this.pagosRecurrentes.reduce((total, pago) => total + parseFloat(pago.monto), 0).toFixed(2)
    }
  },
  async created() {
    await this.fetchPagosRecurrentes()
  },
  methods: {
    async fetchPagosRecurrentes() {
      try {
        const response = await axios.get('/pagos_recurrentes', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        this.pagosRecurrentes = response.data.map(pago => ({
          ...pago,
          fecha: pago.fecha ? new Date(pago.fecha) : new Date()
        }))
      } catch (error) {
        console.error('Error al obtener pagos recurrentes:', error)
      }
    },
    formatDate(date) {
      if (!date) return ''
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
      return new Date(date).toLocaleDateString('es-ES', options)
    }
  }
}
</script>