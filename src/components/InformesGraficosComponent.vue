<template>
    <div class="container mt-5">
      <navigation-bar :showBack="true" :showHome="true" :showLogout="true"></navigation-bar>
      <h1 class="text-center mb-4">Informes Gráficos</h1>
  
      <!-- Sección de Ingresos -->
      <div class="row">
        <div class="col-12">
          <h2 class="text-center mb-4">Ingreso (SALARIO)</h2>
        </div>
        <div class="col-md-6">
          <h3>Gráfico de Barras</h3>
          <apexchart v-if="ingresosBarChartData.series.length" type="bar" :options="ingresosBarChartOptions" :series="ingresosBarChartData.series"></apexchart>
        </div>
        <div class="col-md-6">
          <h3>Gráfico de Líneas</h3>
          <apexchart v-if="ingresosLineChartData.series.length" type="line" :options="ingresosLineChartOptions" :series="ingresosLineChartData.series"></apexchart>
        </div>
        <div class="col-md-6 mt-5">
          <h3>Gráfico de Pastel</h3>
          <apexchart v-if="ingresosPieChartData.series.length" type="pie" :options="ingresosPieChartOptions" :series="ingresosPieChartData.series"></apexchart>
        </div>
      </div>
  
      <!-- Sección de Ingresos Extras -->
      <div class="row mt-5">
        <div class="col-12">
          <h2 class="text-center mb-4">Ingresos Extras</h2>
        </div>
        <div class="col-md-6">
          <h3>Gráfico de Barras</h3>
          <apexchart v-if="ingresosExtrasBarChartData.series.length" type="bar" :options="ingresosExtrasBarChartOptions" :series="ingresosExtrasBarChartData.series"></apexchart>
        </div>
        <div class="col-md-6">
          <h3>Gráfico de Líneas</h3>
          <apexchart v-if="ingresosExtrasLineChartData.series.length" type="line" :options="ingresosExtrasLineChartOptions" :series="ingresosExtrasLineChartData.series"></apexchart>
        </div>
        <div class="col-md-6 mt-5">
          <h3>Gráfico de Pastel</h3>
          <apexchart v-if="ingresosExtrasPieChartData.series.length" type="pie" :options="ingresosExtrasPieChartOptions" :series="ingresosExtrasPieChartData.series"></apexchart>
        </div>
      </div>
  
      <!-- Sección de Egresos -->
      <div class="row mt-5">
        <div class="col-12">
          <h2 class="text-center mb-4">Egresos</h2>
        </div>
        <div class="col-md-6">
          <h3>Gráfico de Barras</h3>
          <apexchart v-if="egresosBarChartData.series.length" type="bar" :options="egresosBarChartOptions" :series="egresosBarChartData.series"></apexchart>
        </div>
        <div class="col-md-6">
          <h3>Gráfico de Líneas</h3>
          <apexchart v-if="egresosLineChartData.series.length" type="line" :options="egresosLineChartOptions" :series="egresosLineChartData.series"></apexchart>
        </div>
        <div class="col-md-6 mt-5">
          <h3>Gráfico de Pastel</h3>
          <apexchart v-if="egresosPieChartData.series.length" type="pie" :options="egresosPieChartOptions" :series="egresosPieChartData.series"></apexchart>
        </div>
      </div>
  
      <!-- Sección de Totales -->
      <div class="row mt-5">
        <div class="col-12">
          <h2 class="text-center mb-4">Totales</h2>
        </div>
        <div class="col-md-6">
          <h3>Gráfico de Barras</h3>
          <apexchart v-if="totalesBarChartData.series.length" type="bar" :options="totalesBarChartOptions" :series="totalesBarChartData.series"></apexchart>
        </div>
        <div class="col-md-6">
          <h3>Gráfico de Líneas</h3>
          <apexchart v-if="totalesLineChartData.series.length" type="line" :options="totalesLineChartOptions" :series="totalesLineChartData.series"></apexchart>
        </div>
        <div class="col-md-6 mt-5">
          <h3>Gráfico de Pastel</h3>
          <apexchart v-if="totalesPieChartData.series.length" type="pie" :options="totalesPieChartOptions" :series="totalesPieChartData.series"></apexchart>
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
        ingresosBarChartData: { series: [] },
        ingresosLineChartData: { series: [] },
        ingresosPieChartData: { series: [] },
        ingresosExtrasBarChartData: { series: [] },
        ingresosExtrasLineChartData: { series: [] },
        ingresosExtrasPieChartData: { series: [] },
        egresosBarChartData: { series: [] },
        egresosLineChartData: { series: [] },
        egresosPieChartData: { series: [] },
        totalesBarChartData: { series: [] },
        totalesLineChartData: { series: [] },
        totalesPieChartData: { series: [] },
        ingresosBarChartOptions: { chart: { type: 'bar' }, xaxis: { categories: [] } },
        ingresosLineChartOptions: { chart: { type: 'line' }, xaxis: { categories: [] } },
        ingresosPieChartOptions: { chart: { type: 'pie' }, labels: [] },
        ingresosExtrasBarChartOptions: { chart: { type: 'bar' }, xaxis: { categories: [] } },
        ingresosExtrasLineChartOptions: { chart: { type: 'line' }, xaxis: { categories: [] } },
        ingresosExtrasPieChartOptions: { chart: { type: 'pie' }, labels: [] },
        egresosBarChartOptions: { chart: { type: 'bar' }, xaxis: { categories: [] } },
        egresosLineChartOptions: { chart: { type: 'line' }, xaxis: { categories: [] } },
        egresosPieChartOptions: { chart: { type: 'pie' }, labels: [] },
        totalesBarChartOptions: { chart: { type: 'bar' }, xaxis: { categories: [] } },
        totalesLineChartOptions: { chart: { type: 'line' }, xaxis: { categories: [] } },
        totalesPieChartOptions: { chart: { type: 'pie' }, labels: [] }
      }
    },
    methods: {
      async fetchData() {
        try {
          const response = await axios.get('/total', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
          const data = response.data
          console.log('Data fetched:', data) // Añadir log para verificar los datos
  
          // Verificar que los datos existen antes de asignarlos
          if (data.detalles_ingresos && data.detalles_egresos && data.detalles_otros_ingresos) {
            // Ingresos
            this.ingresosBarChartData = {
              series: [{ name: 'Ingresos', data: data.detalles_ingresos.map(item => parseFloat(item.monto)) }]
            }
            this.ingresosBarChartOptions.xaxis.categories = data.detalles_ingresos.map(item => this.formatDate(item.fecha))
  
            this.ingresosLineChartData = {
              series: [{ name: 'Ingresos', data: data.detalles_ingresos.map(item => parseFloat(item.monto)) }]
            }
            this.ingresosLineChartOptions.xaxis.categories = data.detalles_ingresos.map(item => this.formatDate(item.fecha))
  
            this.ingresosPieChartData = {
              series: data.detalles_ingresos.map(item => parseFloat(item.monto))
            }
            this.ingresosPieChartOptions.labels = data.detalles_ingresos.map(item => item.fuente)
  
            // Ingresos Extras
            this.ingresosExtrasBarChartData = {
              series: [{ name: 'Ingresos Extras', data: data.detalles_otros_ingresos.map(item => parseFloat(item.monto)) }]
            }
            this.ingresosExtrasBarChartOptions.xaxis.categories = data.detalles_otros_ingresos.map(item => this.formatDate(item.fecha))
  
            this.ingresosExtrasLineChartData = {
              series: [{ name: 'Ingresos Extras', data: data.detalles_otros_ingresos.map(item => parseFloat(item.monto)) }]
            }
            this.ingresosExtrasLineChartOptions.xaxis.categories = data.detalles_otros_ingresos.map(item => this.formatDate(item.fecha))
  
            this.ingresosExtrasPieChartData = {
              series: data.detalles_otros_ingresos.map(item => parseFloat(item.monto))
            }
            this.ingresosExtrasPieChartOptions.labels = data.detalles_otros_ingresos.map(item => item.fuente)
  
            // Egresos
            this.egresosBarChartData = {
              series: [{ name: 'Egresos', data: data.detalles_egresos.map(item => parseFloat(item.monto)) }]
            }
            this.egresosBarChartOptions.xaxis.categories = data.detalles_egresos.map(item => this.formatDate(item.fecha))
  
            this.egresosLineChartData = {
              series: [{ name: 'Egresos', data: data.detalles_egresos.map(item => parseFloat(item.monto)) }]
            }
            this.egresosLineChartOptions.xaxis.categories = data.detalles_egresos.map(item => this.formatDate(item.fecha))
  
            this.egresosPieChartData = {
              series: data.detalles_egresos.map(item => parseFloat(item.monto))
            }
            this.egresosPieChartOptions.labels = data.detalles_egresos.map(item => item.categoria)
  
            // Totales
            const totalIngresos = data.detalles_ingresos.reduce((sum, item) => sum + parseFloat(item.monto), 0)
            const totalOtrosIngresos = data.detalles_otros_ingresos.reduce((sum, item) => sum + parseFloat(item.monto), 0)
            const totalEgresos = data.detalles_egresos.reduce((sum, item) => sum + parseFloat(item.monto), 0)
            const totalNeto = totalIngresos + totalOtrosIngresos - totalEgresos
  
            this.totalesBarChartData = {
              series: [
                { name: 'Ingresos', data: [totalIngresos] },
                { name: 'Otros Ingresos', data: [totalOtrosIngresos] },
                { name: 'Egresos', data: [totalEgresos] },
                { name: 'Total Neto', data: [totalNeto] }
              ]
            }
            this.totalesBarChartOptions.xaxis.categories = ['Totales']
  
            this.totalesLineChartData = {
              series: [
                { name: 'Ingresos', data: [totalIngresos] },
                { name: 'Otros Ingresos', data: [totalOtrosIngresos] },
                { name: 'Egresos', data: [totalEgresos] },
                { name: 'Total Neto', data: [totalNeto] }
              ]
            }
            this.totalesLineChartOptions.xaxis.categories = ['Totales']
  
            this.totalesPieChartData = {
              series: [totalIngresos, totalOtrosIngresos, totalEgresos, totalNeto]
            }
            this.totalesPieChartOptions.labels = ['Ingresos', 'Otros Ingresos', 'Egresos', 'Total Neto']
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
      }
    },
    created() {
      this.fetchData()
    }
  }
  </script>