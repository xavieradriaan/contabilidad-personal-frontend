<template>
  <div class="container mt-5">
    <navigation-bar :showBack="true" :showHome="false" :showLogout="false"></navigation-bar>
    <h1 class="text-center mb-4">Balance Detalles</h1>
    <form @submit.prevent="fetchTotals" class="mb-4">
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
      <button @click="exportToXML" class="btn btn-success w-100">Exportar a XML</button>
    </form>

    <!-- Mover este bloque de código para que aparezca primero -->
    <div class="card mb-4">
      <div class="card-body text-center">
        <h5 class="text-muted">Saldo Anterior Disponible + Total Actual Disponible:</h5>
        <p class="display-4" style="display: flex; justify-content: center; align-items: center;">
          {{ showSaldo ? `$${saldo_disponible.toFixed(2)}` : '****' }}
          <i :class="{'fas fa-eye': showSaldo, 'fas fa-eye-slash': !showSaldo}" @click="toggleSaldoVisibility" style="cursor: pointer; margin-left: 10px; font-size: 0.5em; position: relative; top: 1px;"></i>
        </p>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-header text-center">
        <h2>{{ nombre_mes }}</h2>
      </div>
      <div class="card-body">
        <p><strong>Total Ingresos (Quincena + Fin de Mes):</strong> ${{ total_ingresos.toFixed(2) }}</p>
        <p><strong>Total Otros Ingresos:</strong> ${{ total_otros_ingresos.toFixed(2) }}</p>
        <p><strong>Total de Ingresos + Otros Ingresos:</strong> ${{ (total_ingresos + total_otros_ingresos).toFixed(2) }}</p>
        <p><strong>Total Egresos:</strong> ${{ total_egresos.toFixed(2) }}</p>
        <p><strong>Saldo mes de ({{ nombre_mes }}):</strong> ${{ total.toFixed(2) }}</p>
      </div>
    </div>

    <div v-if="detalles_ingresos.length || detalles_otros_ingresos.length || detalles_egresos.length" class="detalles">
      <h2 class="text-center mb-4">Ingreso Salario</h2>
      <table v-if="detalles_ingresos.length" class="table table-striped table-hover">
        <thead class="table-dark">
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
            <td>${{ ingreso.monto.toFixed(2) }}</td>
            <td>{{ ingreso.descripcion }}</td>
          </tr>
          <tr>
            <td colspan="3"><strong>Total Ingresos:</strong></td>
            <td><strong>${{ total_ingresos.toFixed(2) }}</strong></td>
          </tr>
        </tbody>
      </table>

      <h2 class="text-center mb-4">Detalles de Otros Ingresos</h2>
      <table v-if="detalles_otros_ingresos.length" class="table table-striped table-hover">
        <thead class="table-dark">
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
            <td>${{ otro_ingreso.monto.toFixed(2) }}</td>
            <td>{{ otro_ingreso.descripcion }}</td>
          </tr>
          <tr>
            <td colspan="3"><strong>Total Otros Ingresos:</strong></td>
            <td><strong>${{ total_otros_ingresos.toFixed(2) }}</strong></td>
          </tr>
          <tr>
            <td colspan="3"><strong>Total Ingresos + Otros Ingresos:</strong></td>
            <td><strong>${{ (total_ingresos + total_otros_ingresos).toFixed(2) }}</strong></td>
          </tr>
        </tbody>
      </table>

      <h2 class="text-center mb-4">Detalles de Egresos</h2>
      <table v-if="detalles_egresos.length" class="table table-striped table-hover">
        <thead class="table-dark">
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
            <td>${{ egreso.monto.toFixed(2) }}</td>
          </tr>
          <tr>
            <td colspan="3"><strong>Total Egresos:</strong></td>
            <td><strong>${{ total_egresos.toFixed(2) }}</strong></td>
          </tr>
        </tbody>
      </table>

      <h2 class="text-center mb-4">Detalles Totales</h2>
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th>Total Ingresos + Otros Ingresos</th>
            <th>Total Egresos</th>
            <th>Total Neto</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${{ (total_ingresos + total_otros_ingresos).toFixed(2) }}</td>
            <td>${{ total_egresos.toFixed(2) }}</td>
            <td>${{ ((total_ingresos + total_otros_ingresos) - total_egresos).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
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
      saldo_anterior: 0,  // Nueva propiedad para el saldo anterior
      saldo_disponible: 0,  // Nueva propiedad para el saldo disponible
      nombre_mes: '',  // Nueva propiedad para el nombre del mes
      detalles_ingresos: [],
      detalles_otros_ingresos: [],
      detalles_egresos: [],
      showSaldo: true  // Nueva propiedad para controlar la visibilidad del saldo
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
      this.saldo_anterior = parseFloat(response.data.saldo_anterior)  // Asignar el saldo anterior
      this.saldo_disponible = parseFloat(response.data.saldo_disponible)  // Asignar el saldo disponible
      this.nombre_mes = response.data.nombre_mes  // Asignar el nombre del mes
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
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
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
        xml += `      <Monto>${ingreso.monto.toFixed(2)}</Monto>\n`
        xml += `      <Descripcion>${ingreso.descripcion}</Descripcion>\n`
        xml += '    </Ingreso>\n'
      })
      xml += '    <TotalIngresos>\n'
      xml += `      <Monto>${this.total_ingresos.toFixed(2)}</Monto>\n`
      xml += '    </TotalIngresos>\n'
      xml += '  </DetallesIngresos>\n'

      xml += '  <DetallesOtrosIngresos>\n'
      this.detalles_otros_ingresos.forEach(otro_ingreso => {
        xml += '    <OtroIngreso>\n'
        xml += `      <Fuente>${otro_ingreso.fuente}</Fuente>\n`
        xml += `      <Fecha>${this.formatDate(otro_ingreso.fecha)}</Fecha>\n`
        xml += `      <Monto>${otro_ingreso.monto.toFixed(2)}</Monto>\n`
        xml += `      <Descripcion>${otro_ingreso.descripcion}</Descripcion>\n`
        xml += '    </OtroIngreso>\n'
      })
      xml += '    <TotalOtrosIngresos>\n'
      xml += `      <Monto>${this.total_otros_ingresos.toFixed(2)}</Monto>\n`
      xml += '    </TotalOtrosIngresos>\n'
      xml += '  </DetallesOtrosIngresos>\n'

      xml += '  <DetallesEgresos>\n'
      this.detalles_egresos.forEach(egreso => {
        xml += '    <Egreso>\n'
        xml += `      <Categoria>${egreso.categoria}</Categoria>\n`
        xml += `      <Descripcion>${egreso.subcategoria}</Descripcion>\n`
        xml += `      <Fecha>${this.formatDate(egreso.fecha)}</Fecha>\n`
        xml += `      <Monto>${egreso.monto.toFixed(2)}</Monto>\n`
        xml += '    </Egreso>\n'
      })
      xml += '    <TotalEgresos>\n'
      xml += `      <Monto>${this.total_egresos.toFixed(2)}</Monto>\n`
      xml += '    </TotalEgresos>\n'
      xml += '  </DetallesEgresos>\n'

      xml += '  <DetallesTotales>\n'
      xml += '    <TotalIngresosOtrosIngresos>\n'
      xml += `      <Monto>${(this.total_ingresos + this.total_otros_ingresos).toFixed(2)}</Monto>\n`
      xml += '    </TotalIngresosOtrosIngresos>\n'
      xml += '    <TotalEgresos>\n'
      xml += `      <Monto>${this.total_egresos.toFixed(2)}</Monto>\n`
      xml += '    </TotalEgresos>\n'
      xml += '    <TotalNeto>\n'
      xml += `      <Monto>${this.total.toFixed(2)}</Monto>\n`
      xml += '    </TotalNeto>\n'

      xml += '</Totales>\n'
      return xml
    }
  },
  created() {
    this.fetchTotals()
  }
}
</script>

<!-- Agregar el enlace a Font Awesome en el archivo HTML principal -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">