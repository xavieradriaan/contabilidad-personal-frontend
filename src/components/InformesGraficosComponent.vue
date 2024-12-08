<template>
  <div class="container mt-5">
    <navigation-bar :showBack="true" :showHome="false" :showLogout="false"></navigation-bar>
    <h1 class="text-center mb-4">Informes Gráficos</h1>

    <!-- Formulario para seleccionar el año y el mes -->
    <form @submit.prevent="fetchData" class="mb-4">
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

    <!-- Sección de Ingresos -->
    <div class="row">
      <div class="col-12">
        <h2 class="text-center mb-4">Ingreso (SALARIO)</h2>
      </div>
      <div class="col-md-12">
        <h3>Gráfico de Barras</h3>
        <apexchart v-if="ingresosBarChartData.series.length" type="bar" :options="ingresosBarChartOptions" :series="ingresosBarChartData.series" width="100%" height="250"></apexchart>
      </div>
    </div>

    <!-- Sección de Ingresos Extras -->
    <div class="row mt-5">
      <div class="col-12">
        <h2 class="text-center mb-4">Ingresos Extras</h2>
      </div>
      <div class="col-md-12">
        <h3>Gráfico de Barras</h3>
        <apexchart v-if="ingresosExtrasBarChartData.series.length" type="bar" :options="ingresosExtrasBarChartOptions" :series="ingresosExtrasBarChartData.series" width="100%" height="250"></apexchart>
      </div>
    </div>

    <!-- Sección de Egresos -->
    <div class="row mt-5 justify-content-center">
      <div class="col-12">
        <h2 class="text-center mb-4">Egresos</h2>
      </div>
      <div class="col-md-10 mt-5">
        <h3 class="text-center">Gráfico de Pastel</h3>
        <apexchart v-if="egresosPieChartData.series.length" type="pie" :options="egresosPieChartOptions" :series="egresosPieChartData.series" width="100%" height="430"></apexchart>
      </div>
    </div>

    <!-- Sección de Totales -->
    <div class="row mt-5 justify-content-center">
      <div class="col-12">
        <h2 class="text-center mb-4">Totales</h2>
      </div>
      <div class="col-md-10">
        <h3 class="text-center">Gráfico de Barras</h3>
        <apexchart v-if="totalesBarChartData.series.length" type="bar" :options="totalesBarChartOptions" :series="totalesBarChartData.series" width="100%" height="420"></apexchart>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import NavigationBar from './NavigationBar.vue'
import VueApexCharts from 'vue3-apexcharts'

export default {
  name: 'InformesGraficosComponent',
  components: {
    NavigationBar,
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