<template>
  <div class="pagos-container">
    <!-- Usa el componente NavigationBar aquí si es necesario -->
    <NavigationBar />
    <!-- Animación de monedas -->
    <div class="pagos-animated-coins">
      <div v-for="index in 25" :key="index" class="pagos-coin" :class="`pagos-coin-${index}`">
        <img src="/monedas.png" alt="Moneda animada" class="pagos-coin-img">
      </div>
    </div>

    <!-- Botón de regreso -->
    <button class="pagos-back-btn" @click="$router.go(-1)">
      <i class="fas fa-chevron-left"></i>
    </button>

    <main class="pagos-main-content">
      <h1 class="pagos-main-title">
        <span class="pagos-brand-text">CONTABILÍZATE</span>
        <p class="pagos-main-subtitle">Gestión de Pagos Recurrentes</p>
      </h1>
      <h3 
        class="pagos-mes-subtitle" 
        :class="{ 'mes-blanco': true }"
      >
        {{ nombreMesActual }}
      </h3>

      <div class="pagos-content-card">
        <div class="pagos-tabla-container">
          <table class="pagos-table">
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
                <td>${{ parseFloat(pago.monto || 0).toFixed(2) }}</td>
                <td>
                  <input type="checkbox" v-model="pago.pagado" disabled class="pagos-checkbox">
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagos-total-card">
          <p class="pagos-total-text">
            <strong>Total Pagos Recurrentes:</strong> 
            <span>${{ totalPagosRecurrentes }}</span>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PagosRecurrentesComponent',
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
    },
    nombreMesActual() {
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ]
      return meses[this.month - 1]
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

<style scoped>
@import './PagosRecurrentesComponent.css';

.mes-blanco {
  color: var(--text-white);
}
</style>