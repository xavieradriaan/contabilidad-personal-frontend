<template>
  <div class="informes-container">
    <!-- Animación de monedas -->
    <div class="informes-animated-coins">
      <div v-for="index in 25" :key="index" class="informes-coin" :class="`informes-coin-${index}`">
        <img src="/monedas.png" alt="Moneda animada" class="informes-coin-img">
      </div>
    </div>

    <!-- Botón de regreso -->
    <button class="informes-back-btn" @click="safeGoBack('/dashboard')">
      <i class="fas fa-chevron-left"></i>
    </button>

    <main class="informes-main-content">
      <h1 class="informes-main-title">
        <span class="informes-brand-text">CONTABILÍZATE</span>
        <p class="informes-main-subtitle">Informes Gráficos</p>
      </h1>

      <div class="informes-content-card">
        <!-- Formulario -->
        <form @submit.prevent="fetchData" class="informes-form">
          <div class="informes-input-group-row">
            <div class="informes-input-group">
              <label for="year" class="informes-input-label">
                <i class="fas fa-calendar-alt informes-icon"></i>
                <span>Año</span>
              </label>
              <input
                v-model="year"
                id="year"
                type="number"
                class="informes-auth-input"
                min="2000"
                max="2100"
                required
              >
            </div>
            
            <div class="informes-input-group">
              <label for="month" class="informes-input-label">
                <i class="fas fa-calendar informes-icon"></i>
                <span>Mes</span>
              </label>
              <input
                v-model="month"
                id="month"
                type="number"
                class="informes-auth-input"
                min="1"
                max="12"
                required
              >
            </div>
          </div>

          <button type="submit" class="informes-auth-btn">
            Consultar Datos
          </button>
        </form>

        <!-- Secciones de gráficos -->
        <div class="informes-graficos-section">
          <div class="informes-chart-group">
            <h2 class="informes-chart-title">Ingreso (SALARIO)</h2>
            <div class="informes-chart-container">
              <apexchart v-if="ingresosBarChartData.series.length" 
                type="bar" 
                :options="ingresosBarChartOptions" 
                :series="ingresosBarChartData.series"
                class="informes-chart">
              </apexchart>
            </div>
          </div>

          <div class="informes-chart-group">
            <h2 class="informes-chart-title">Ingresos Extras</h2>
            <div class="informes-chart-container">
              <apexchart v-if="ingresosExtrasBarChartData.series.length" 
                type="bar" 
                :options="ingresosExtrasBarChartOptions" 
                :series="ingresosExtrasBarChartData.series"
                class="informes-chart">
              </apexchart>
            </div>
          </div>

          <div class="informes-chart-group">
            <h2 class="informes-chart-title">Egresos</h2>
            <div class="informes-chart-container">
              <apexchart v-if="egresosPieChartData.series.length" 
                type="pie" 
                :options="egresosPieChartOptions" 
                :series="egresosPieChartData.series"
                class="informes-chart">
              </apexchart>
            </div>
          </div>

          <div class="informes-chart-group">
            <h2 class="informes-chart-title">Totales</h2>
            <div class="informes-chart-container">
              <apexchart v-if="totalesBarChartData.series.length" 
                type="bar" 
                :options="totalesBarChartOptions" 
                :series="totalesBarChartData.series"
                class="informes-chart">
              </apexchart>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import VueApexCharts from 'vue3-apexcharts'
import navigationMixin from '../mixins/navigationMixin.js'
import sessionValidation from '../mixins/sessionValidation.js'

export default {
  name: 'InformesGraficosComponent',
  mixins: [navigationMixin, sessionValidation],
  components: {
    apexchart: VueApexCharts
  },
  data() {
    return {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      ingresosBarChartData: { series: [] },
      ingresosExtrasBarChartData: { series: [] },
      egresosPieChartData: { series: [] },
      totalesBarChartData: { series: [] },
      ingresosBarChartOptions: { 
        chart: { type: 'bar' }, 
        xaxis: { categories: [] },
        colors: ['#00E396', '#FEB019'], // Quincena, Fin de Mes
        plotOptions: {
          bar: {
            distributed: true
          }
        }
      },
      ingresosExtrasBarChartOptions: { 
        chart: { type: 'bar' }, 
        xaxis: { categories: [] },
        plotOptions: {
          bar: {
            distributed: true
          }
        }
      },
      egresosPieChartOptions: { chart: { type: 'pie' }, labels: [] },
      totalesBarChartOptions: { 
        chart: { type: 'bar' }, 
        xaxis: { categories: [] },
        yaxis: {
          labels: {
            formatter: function (value) {
              return value.toFixed(2);
            }
          }
        }
      }
    }
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get('/total', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          params: {
            year: this.year,
            month: this.month
          }
        })
        const data = response.data
        console.log('Data fetched:', data) // Añadir log para verificar los datos

        // Verificar que los datos existen antes de asignarlos
        if (data.detalles_ingresos && data.detalles_egresos && data.detalles_otros_ingresos) {
          // Ingresos
          const ingresos = data.detalles_ingresos.map(item => ({
            x: this.formatDate(item.fecha),
            y: parseFloat(item.monto),
            fillColor: item.descripcion === 'Quincena' ? '#00E396' : '#FEB019'
          }))

          this.ingresosBarChartData = {
            series: [{
              name: 'Ingresos',
              data: ingresos
            }]
          }
          this.ingresosBarChartOptions = {
            ...this.ingresosBarChartOptions,
            xaxis: {
              ...this.ingresosBarChartOptions.xaxis,
              categories: data.detalles_ingresos.map(item => this.formatDate(item.fecha))
            }
          }

          // Ingresos Extras
          const ingresosExtras = data.detalles_otros_ingresos.map((item, index) => ({
            x: this.formatDate(item.fecha),
            y: parseFloat(item.monto),
            fillColor: this.getColor(index)
          }))

          this.ingresosExtrasBarChartData = {
            series: [{
              name: 'Ingresos Extras',
              data: ingresosExtras
            }]
          }
          this.ingresosExtrasBarChartOptions = {
            ...this.ingresosExtrasBarChartOptions,
            xaxis: {
              ...this.ingresosExtrasBarChartOptions.xaxis,
              categories: data.detalles_otros_ingresos.map(item => this.formatDate(item.fecha))
            }
          }

          // Egresos
          this.egresosPieChartData = {
            series: data.detalles_egresos.map(item => parseFloat(item.monto))
          }
          this.egresosPieChartOptions.labels = data.detalles_egresos.map(item => item.categoria)

          // Totales
          const totalIngresos = data.detalles_ingresos.reduce((sum, item) => sum + parseFloat(item.monto), 0)
          const totalOtrosIngresos = data.detalles_otros_ingresos.reduce((sum, item) => sum + parseFloat(item.monto), 0)
          const totalEgresos = data.detalles_egresos.reduce((sum, item) => sum + parseFloat(item.monto), 0)
          const totalNeto = (totalIngresos + totalOtrosIngresos - totalEgresos).toFixed(2)

          this.totalesBarChartData = {
            series: [
              { name: 'Ingresos', data: [totalIngresos] },
              { name: 'Otros Ingresos', data: [totalOtrosIngresos] },
              { name: 'Egresos', data: [totalEgresos] },
              { name: 'Total Neto', data: [parseFloat(totalNeto)] }
            ]
          }
          this.totalesBarChartOptions.xaxis.categories = ['Totales']
        } else {
          console.error('Datos incompletos:', data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },
    formatDate(date) {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
      return new Date(date).toLocaleDateString('es-ES', options)
    },
    getColor(index) {
      const colors = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26A69A', '#D10CE8']
      return colors[index % colors.length]
    }
  },
  created() {
    this.fetchData()
  }
}
</script>

<style scoped>
@import './InformesGraficosComponent.css';
</style>