<template>
  <div class="container mt-5">
    <navigation-bar :showBack="true" :showHome="false" :showLogout="false"></navigation-bar>
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
            <td>{{ pago.fecha ? formatDate(pago.fecha) : '' }}</td>
            <td>{{ parseFloat(pago.monto || 0).toFixed(2) }}</td>
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
      pagosRecurrentes: [],
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      egresosRegistrados: false
    }
  },
  computed: {
    totalPagosRecurrentes() {
      return this.pagosRecurrentes.reduce((total, pago) => total + parseFloat(pago.monto || 0), 0).toFixed(2)
    }
  },
  async created() {
    await this.checkEgresos()
    if (this.egresosRegistrados) {
      await this.fetchPagosRecurrentes()
    }
  },
  methods: {
    async checkEgresos() {
      try {
        const response = await axios.get('/egresos', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        this.egresosRegistrados = response.data.length > 0
      } catch (error) {
        console.error('Error al verificar egresos:', error)
      }
    },
    async fetchPagosRecurrentes() {
      try {
        const response = await axios.get('/pagos_recurrentes', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          params: {
            year: this.year,
            month: this.month
          }
        })
        const currentDate = new Date()
        this.pagosRecurrentes = response.data.map(pago => {
          const pagoFecha = pago.fecha ? new Date(pago.fecha) : null
          const isCurrentMonth = pagoFecha && pagoFecha.getFullYear() === currentDate.getFullYear() && pagoFecha.getMonth() === currentDate.getMonth()
          return {
            ...pago,
            fecha: isCurrentMonth ? pagoFecha : null,
            monto: isCurrentMonth ? pago.monto : 0,
            pagado: isCurrentMonth ? pago.pagado : false
          }
        })
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