<template>
  <div class="total-container">
    <div class="total-animated-coins">
      <div
        v-for="index in 30" 
        :key="index" 
        class="total-coin" 
        :style="{ 
          top: `${Math.random() * 100}vh`, 
          left: `${Math.random() * 100}vw`, 
          animationDelay: `${Math.random() * 5}s` 
        }"
      >
        <img src="/monedas.png" alt="Moneda animada" class="total-coin-img">
      </div>
    </div>

    <!-- Botón de regreso agregado aquí -->
    <button class="total-back-btn" @click="$router.go(-1)">
      <i class="fas fa-chevron-left"></i>
    </button>

    <navigation-bar :showBack="true" :showHome="false" :showLogout="false" @back-clicked="$router.go(-1)" />

    <main class="total-main-content">
      <h1 class="total-main-title">
        <span class="total-brand-text">CONTABILÍZATE</span>
        <p class="total-main-subtitle">Balance Detallado</p>
      </h1>

      <div class="total-main-card">
        <form @submit.prevent="fetchTotals" class="total-main-form">
          <div class="total-input-group">
            <label for="year" class="total-input-label">
              <i class="fas fa-calendar-alt total-icon"></i>
              <span>Año</span>
            </label>
            <input
              v-model="year"
              type="number"
              id="year"
              class="total-main-input"
              min="2000"
              max="2100"
              required
            >
          </div>

          <div class="total-input-group">
            <label for="month" class="total-input-label">
              <i class="fas fa-calendar total-icon"></i>
              <span>Mes</span>
            </label>
            <input
              v-model="month"
              type="number"
              id="month"
              class="total-main-input"
              min="1"
              max="12"
              required
            >
          </div>

          <div class="total-buttons-group">
            <button type="submit" class="total-main-btn total-consult-btn">
              <span class="btn-text">Consultar</span>
            </button>
            <button @click="exportToXML" class="total-main-btn total-export-btn">
              <span class="btn-text">Exportar XML</span>
            </button>
          </div>
        </form>

        <div class="total-balance-card">
          <h3 class="total-balance-title">Saldo Anterior Disponible + Total Actual Disponible:</h3>
          <p class="total-balance-amount">
            {{ showSaldo ? `$${formatCurrency(saldo_disponible)}` : '****' }}
            <i :class="{'fas fa-eye': showSaldo, 'fas fa-eye-slash': !showSaldo}" 
               @click="toggleSaldoVisibility"
               class="total-eye-icon"></i>
          </p>
        </div>

        <div class="total-month-summary">
          <h3 class="total-month-title">{{ nombre_mes }}</h3>
          <ul class="total-month-list">
            <li class="total-month-list-item">
              Total Ingresos (Quincena + Fin de Mes): ${{ formatCurrency(total_ingresos) }}
            </li>
            <li class="total-month-list-item">
              Total Otros Ingresos: ${{ formatCurrency(total_otros_ingresos) }}
            </li>
            <li class="total-month-list-item">
              Total de Ingresos + Otros Ingresos: ${{ formatCurrency(total_ingresos + total_otros_ingresos) }}
            </li>
            <li class="total-month-list-item">
              Total Egresos: ${{ formatCurrency(total_egresos) }}
            </li>
            <li class="total-month-list-item">
              Saldo mes de ({{ nombre_mes }}): ${{ formatCurrency(total) }}
            </li>
          </ul>
        </div>

        <div v-if="detalles_ingresos.length" class="total-table-section">
          <h3 class="total-table-title">Detalles de Ingresos</h3>
          <div class="total-table-container">
            <table class="total-data-table">
              <thead>
                <tr>
                  <th>Fuente</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ingreso in detalles_ingresos" :key="ingreso.id">
                  <td>{{ ingreso.fuente }}</td>
                  <td>{{ formatDate(ingreso.fecha) }}</td>
                  <td>${{ formatCurrency(ingreso.monto) }}</td>
                  <td>{{ ingreso.descripcion }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="detalles_otros_ingresos.length" class="total-table-section">
          <h3 class="total-table-title">Detalles de Otros Ingresos</h3>
          <div class="total-table-container">
            <table class="total-data-table">
              <thead>
                <tr>
                  <th>Fuente</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="otro_ingreso in detalles_otros_ingresos" :key="otro_ingreso.id">
                  <td>{{ otro_ingreso.fuente }}</td>
                  <td>{{ formatDate(otro_ingreso.fecha) }}</td>
                  <td>${{ formatCurrency(otro_ingreso.monto) }}</td>
                  <td>{{ otro_ingreso.descripcion }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="detalles_egresos.length" class="total-table-section">
          <h3 class="total-table-title">Detalles de Egresos</h3>
          <div class="total-table-container">
            <table class="total-data-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="egreso in detalles_egresos" :key="egreso.id">
                  <td>{{ egreso.categoria }}</td>
                  <td>{{ egreso.subcategoria }}</td>
                  <td>{{ formatDate(egreso.fecha) }}</td>
                  <td>${{ formatCurrency(egreso.monto) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="total-table-section">
          <h3 class="total-table-title">Detalles Totales</h3>
          <div class="total-table-container">
            <table class="total-data-table">
              <thead>
                <tr>
                  <th>Total Ingresos + Otros Ingresos</th>
                  <th>Total Egresos</th>
                  <th>Total Neto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${{ formatCurrency(total_ingresos + total_otros_ingresos) }}</td>
                  <td>${{ formatCurrency(total_egresos) }}</td>
                  <td>${{ formatCurrency((total_ingresos + total_otros_ingresos) - total_egresos) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import NavigationBar from './NavigationBar.vue'

export default {
  name: 'TotalComponent',
  components: {
    NavigationBar
  },
  data() {
    return {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      total_ingresos: 0,
      total_otros_ingresos: 0,
      total_egresos: 0,
      total: 0,
      saldo_anterior: 0,
      saldo_disponible: 0,
      nombre_mes: '',
      detalles_ingresos: [],
      detalles_otros_ingresos: [],
      detalles_egresos: [],
      showSaldo: false
    }
  },
  methods: {
    async fetchTotals() {
      const response = await axios.get('/total', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        params: {
          year: this.year,
          month: this.month
        }
      })
      this.total_ingresos = parseFloat(response.data.total_ingresos)
      this.total_otros_ingresos = parseFloat(response.data.total_otros_ingresos)
      this.total_egresos = parseFloat(response.data.total_egresos)
      this.total = parseFloat(response.data.total)
      this.saldo_anterior = parseFloat(response.data.saldo_anterior)
      this.saldo_disponible = parseFloat(response.data.saldo_disponible)
      this.nombre_mes = response.data.nombre_mes
      this.detalles_ingresos = response.data.detalles_ingresos.map(ingreso => ({
        ...ingreso,
        monto: parseFloat(ingreso.monto)
      }))
      this.detalles_otros_ingresos = response.data.detalles_otros_ingresos.map(otro_ingreso => ({
        ...otro_ingreso,
        monto: parseFloat(otro_ingreso.monto)
      }))
      this.detalles_egresos = response.data.detalles_egresos.map(egreso => ({
        ...egreso,
        monto: parseFloat(egreso.monto)
      }))
    },
    formatDate(date) {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }
      return new Date(date).toLocaleDateString('es-ES', options)
    },
    toggleSaldoVisibility() {
      this.showSaldo = !this.showSaldo
    },
    exportToXML() {
      const xmlData = this.generateXML()
      const blob = new Blob([xmlData], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `totales_${this.year}_${this.month}.xml`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    generateXML() {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
      xml += '<Totales>\n'

      xml += '  <DetallesIngresos>\n'
      this.detalles_ingresos.forEach(ingreso => {
        xml += '    <Ingreso>\n'
        xml += `      <Fuente>${ingreso.fuente}</Fuente>\n`
        xml += `      <Fecha>${this.formatDate(ingreso.fecha)}</Fecha>\n`
        xml += `      <Monto>${this.formatCurrency(ingreso.monto)}</Monto>\n`
        xml += `      <Descripcion>${ingreso.descripcion}</Descripcion>\n`
        xml += '    </Ingreso>\n'
      })
      xml += '    <TotalIngresos>\n'
      xml += `      <Monto>${this.formatCurrency(this.total_ingresos)}</Monto>\n`
      xml += '    </TotalIngresos>\n'
      xml += '  </DetallesIngresos>\n'

      xml += '  <DetallesOtrosIngresos>\n'
      this.detalles_otros_ingresos.forEach(otro_ingreso => {
        xml += '    <OtroIngreso>\n'
        xml += `      <Fuente>${otro_ingreso.fuente}</Fuente>\n`
        xml += `      <Fecha>${this.formatDate(otro_ingreso.fecha)}</Fecha>\n`
        xml += `      <Monto>${this.formatCurrency(otro_ingreso.monto)}</Monto>\n`
        xml += `      <Descripcion>${otro_ingreso.descripcion}</Descripcion>\n`
        xml += '    </OtroIngreso>\n'
      })
      xml += '    <TotalOtrosIngresos>\n'
      xml += `      <Monto>${this.formatCurrency(this.total_otros_ingresos)}</Monto>\n`
      xml += '    </TotalOtrosIngresos>\n'
      xml += '  </DetallesOtrosIngresos>\n'

      xml += '  <DetallesEgresos>\n'
      this.detalles_egresos.forEach(egreso => {
        xml += '    <Egreso>\n'
        xml += `      <Categoria>${egreso.categoria}</Categoria>\n`
        xml += `      <Descripcion>${egreso.subcategoria}</Descripcion>\n`
        xml += `      <Fecha>${this.formatDate(egreso.fecha)}</Fecha>\n`
        xml += `      <Monto>${this.formatCurrency(egreso.monto)}</Monto>\n`
        xml += '    </Egreso>\n'
      })
      xml += '    <TotalEgresos>\n'
      xml += `      <Monto>${this.formatCurrency(this.total_egresos)}</Monto>\n`
      xml += '    </TotalEgresos>\n'
      xml += '  </DetallesEgresos>\n'

      xml += '  <DetallesTotales>\n'
      xml += '    <TotalIngresosOtrosIngresos>\n'
      xml += `      <Monto>${this.formatCurrency(this.total_ingresos + this.total_otros_ingresos)}</Monto>\n`
      xml += '    </TotalIngresosOtrosIngresos>\n'
      xml += '    <TotalEgresos>\n'
      xml += `      <Monto>${this.formatCurrency(this.total_egresos)}</Monto>\n`
      xml += '    </TotalEgresos>\n'
      xml += '    <TotalNeto>\n'
      xml += `      <Monto>${this.formatCurrency(this.total)}</Monto>\n`
      xml += '    </TotalNeto>\n'

      xml += '</Totales>\n'
      return xml
    },
    formatCurrency(value) {
      return Number(value).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  },
  created() {
    this.fetchTotals()
  }
}
</script>

<style scoped>
@import './TotalComponent.css';

/* Add this CSS rule to center the buttons */
.total-buttons-group {
  display: flex;
  justify-content: center;
  gap: 1rem; /* Optional: Adds spacing between buttons */
}
</style>