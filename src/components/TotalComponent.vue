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
          animationDelay: `${Math.random() * 5}s`,
          visibility: (Math.random() > 0.2 || (index > 5 && index < 10)) ? 'visible' : 'hidden'
        }"
      >
        <img src="/monedas.png" alt="Moneda animada" class="total-coin-img">
      </div>
    </div>

    <button class="total-back-btn" @click="$router.go(-1)">
      <i class="fas fa-chevron-left"></i>
    </button>

    <main class="total-main-content">
      <h1 class="total-main-title">
        <span class="total-brand-text">CONTABILÍZATE</span>
        <p class="total-main-subtitle">Dashboard Financiero</p>
      </h1>

      <!-- Próximos Vencimientos -->
      <div v-if="resumen.proximos_vencimientos && resumen.proximos_vencimientos.length" class="proximos-vencimientos">
        <h5><i class="fas fa-clock text-warning"></i> Próximos Vencimientos</h5>
        <div v-for="v in resumen.proximos_vencimientos" :key="v.nombre" class="vencimiento-item">
          <div class="vencimiento-header">
            <span class="vencimiento-icon"><i class="fas fa-exclamation-triangle text-danger"></i></span>
            <strong>{{ v.nombre }}</strong>
            <span class="badge bg-danger">{{ v.dias }} días</span>
          </div>
          <div class="vencimiento-details">
            <div class="vencimiento-monto">${{ formatCurrency(v.monto) }}</div>
            <div class="vencimiento-fecha">Vence: {{ formatDate(v.fecha_vencimiento) }}</div>
          </div>
        </div>
      </div>

      <!-- Detalle Mensual Original -->
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
          <h3 class="total-balance-title">Saldo Disponible Real ({{ nombre_mes }}):</h3>
          <p class="total-balance-amount">
            {{ showSaldo ? `$${formatCurrency(saldo_disponible)}` : '****' }}
            <i :class="{'fas fa-eye': showSaldo, 'fas fa-eye-slash': !showSaldo}" 
               @click="toggleSaldoVisibility"
               class="total-eye-icon"></i>
          </p>
          <small class="balance-note">*No incluye consumos de crédito</small>
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
              Total Egresos (Débito/Cash): ${{ formatCurrency(total_egresos) }}
            </li>
            <li class="total-month-list-item">
              Consumos con Tarjetas de Crédito: ${{ formatCurrency(total_tarjetas_credito) }}
            </li>
            <li class="total-month-list-item">
              Saldo mes de ({{ nombre_mes }}): ${{ formatCurrency(total) }}
            </li>
          </ul>
        </div>

        <!-- Resto de las tablas originales -->
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
          <h3 class="total-table-title">Detalles de Egresos (Débito/Cash)</h3>
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
                <tr v-for="egreso in detalles_egresos.filter(e => e.tipo_egreso !== 'credito')" :key="egreso.id">
                  <td>{{ egreso.categoria }}</td>
                  <td>
                    {{ egreso.categoria === 'Pago de tarjetas' && egreso.bancos ? `(${egreso.bancos})` : egreso.subcategoria }}
                  </td>
                  <td>{{ formatDate(egreso.fecha) }}</td>
                  <td>${{ formatCurrency(egreso.monto) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="detalles_egresos_credito.length" class="total-table-section">
          <h3 class="total-table-title">Consumos con Tarjetas de Crédito</h3>
          <div class="total-table-container">
            <table class="total-data-table">
              <thead>
                <tr>
                  <th>Tarjeta</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="egreso in detalles_egresos_credito" :key="egreso.id">
                  <td>{{ egreso.bancos }}</td>
                  <td>{{ egreso.categoria }}</td>
                  <td>{{ egreso.subcategoria }}</td>
                  <td>{{ formatDate(egreso.fecha) }}</td>
                  <td>${{ formatCurrency(egreso.monto) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Nueva tabla mejorada de tarjetas -->
        <div v-if="tarjetas_con_ciclo.length" class="total-table-section">
          <h3 class="total-table-title">Estado Detallado de Tarjetas de Crédito</h3>
          <div class="total-table-container">
            <table class="total-data-table">
              <thead>
                <tr>
                  <th>Tarjeta</th>
                  <th>Corte/Pago</th>
                  <th>Saldo Cortado</th>
                  <th>Consumo Actual</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Días</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in tarjetas_con_ciclo" :key="item.tarjeta.id" 
                    :class="getRowClass(item.estado_ciclo)">
                  <td>{{ item.tarjeta.tarjeta_nombre }}</td>
                  <td>
                    <small>
                      Corte: {{ item.tarjeta.fecha_corte }}<br>
                      Pago: {{ item.tarjeta.fecha_pago }}
                    </small>
                  </td>
                  <td>${{ formatCurrency(item.tarjeta.saldo_periodo_anterior || 0) }}</td>
                  <td>${{ formatCurrency(item.consumos_periodo_actual) }}</td>
                  <td><strong>${{ formatCurrency(item.saldo_a_pagar) }}</strong></td>
                  <td>
                    <span :class="getStatusClass(item.estado_ciclo)">
                      {{ getStatusText(item.estado_ciclo) }}
                    </span>
                  </td>
                  <td>
                    <small v-if="item.estado_ciclo === 'en_curso'">
                      {{ item.dias_para_corte }} para corte
                    </small>
                    <small v-else-if="item.estado_ciclo === 'por_pagar'">
                      {{ item.dias_para_vencimiento }} para vencer
                    </small>
                    <small v-else-if="item.estado_ciclo === 'al_dia'">
                      Al día 
                    </small>
                    <small v-else-if="item.estado_ciclo === 'vencida'">
                      Vencida 
                    </small>
                    <small v-else>
                      -
                    </small>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="total-table-section">
          <h3 class="total-table-title">Liquidez Real ({{ nombre_mes }})</h3>
          <div class="total-table-container">
            <table class="total-data-table">
              <thead>
                <tr>
                  <th>Total Ingresos + Otros Ingresos</th>
                  <th>Total Egresos (Solo Débito/Cash)</th>
                  <th>Dinero Disponible</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${{ formatCurrency(total_ingresos + total_otros_ingresos) }}</td>
                  <td>${{ formatCurrency(total_egresos) }}</td>
                  <td class="text-success"><strong>${{ formatCurrency((total_ingresos + total_otros_ingresos) - total_egresos) }}</strong></td>
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

export default {
  name: 'TotalComponent',
  data() {
    return {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      total_ingresos: 0,
      total_otros_ingresos: 0,
      total_egresos: 0,
      total_tarjetas_credito: 0,
      total: 0,
      saldo_anterior: 0,
      saldo_disponible: 0,
      nombre_mes: '',
      detalles_ingresos: [],
      detalles_otros_ingresos: [],
      detalles_egresos: [],
      detalles_tarjetas: [],
      detalles_egresos_credito: [],
      tarjetas_con_ciclo: [],
      showSaldo: false,
      resumen: {
        saldo_disponible: 0,
        total_deuda_tarjetas: 0,
        uso_credito_mes: 0,
        tarjetas_vencidas: 0,
        tarjetas_por_pagar: 0,
        proximos_vencimientos: []
      }
    }
  },
  computed: {
    totalTarjetas() {
      return this.tarjetas_con_ciclo.length;
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
      });
      this.total_ingresos = parseFloat(response.data.total_ingresos);
      this.total_otros_ingresos = parseFloat(response.data.total_otros_ingresos);
      this.total_egresos = parseFloat(
        response.data.detalles_egresos
          .filter(egreso => egreso.tipo_egreso !== 'credito')
          .reduce((sum, egreso) => sum + parseFloat(egreso.monto), 0)
      );
      this.total_tarjetas_credito = parseFloat(
        response.data.detalles_egresos
          .filter(egreso => egreso.tipo_egreso === 'credito')
          .reduce((sum, egreso) => sum + parseFloat(egreso.monto), 0)
      );
      this.total = this.total_ingresos + this.total_otros_ingresos - this.total_egresos;
      this.saldo_anterior = parseFloat(response.data.saldo_anterior);
      this.saldo_disponible = this.saldo_anterior + this.total_ingresos + this.total_otros_ingresos - this.total_egresos; 
      this.nombre_mes = response.data.nombre_mes;
      this.detalles_ingresos = response.data.detalles_ingresos.map(ingreso => ({
        ...ingreso,
        monto: parseFloat(ingreso.monto)
      }));
      this.detalles_otros_ingresos = response.data.detalles_otros_ingresos.map(otro_ingreso => ({
        ...otro_ingreso,
        monto: parseFloat(otro_ingreso.monto)
      }));
      this.detalles_egresos = response.data.detalles_egresos.map(egreso => ({
        ...egreso,
        monto: parseFloat(egreso.monto)
      }));
      this.detalles_egresos_credito = response.data.detalles_egresos
        .filter(egreso => egreso.tipo_egreso === 'credito')
        .map(egreso => ({
          ...egreso,
          monto: parseFloat(egreso.monto)
        }));
    },

    async fetchTarjetas() {
      try {
        const response = await axios.get('/tarjetas_credito', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          params: {
            include_paid: true
          }
        });
        this.detalles_tarjetas = response.data.map(tarjeta => ({
          ...tarjeta,
          monto: parseFloat(tarjeta.monto)
        }));
      } catch (error) {
        console.error('Error al obtener detalles de tarjetas de crédito:', error);
      }
    },

    async fetchTarjetasCiclo() {
      try {
        const response = await axios.get('/api/tarjetas_con_ciclo', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.tarjetas_con_ciclo = response.data.tarjetas || [];
      } catch (error) {
        console.error('Error al obtener tarjetas con ciclo:', error);
      }
    },

    async fetchDashboardData() {
      try {
        const response = await axios.get('/api/dashboard_financiero', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.resumen = response.data.resumen;
      } catch (error) {
        console.error('Error al obtener dashboard:', error);
      }
    },

    getRowClass(estado) {
      switch(estado) {
        case 'vencida': return 'row-vencida';
        case 'por_pagar': return 'row-por-pagar';
        case 'en_curso': return 'row-en-curso';
        case 'al_dia': return 'row-al-dia';  // Nuevo estado
        default: return '';
      }
    },

    getStatusClass(estado) {
      switch(estado) {
        case 'vencida': return 'badge bg-danger';
        case 'por_pagar': return 'badge bg-warning';
        case 'en_curso': return 'badge bg-success';
        case 'al_dia': return 'badge bg-info';  // Nuevo estado
        default: return 'badge bg-secondary';
      }
    },

    getStatusText(estado) {
      switch(estado) {
        case 'vencida': return 'Vencida';
        case 'por_pagar': return 'Por Pagar';
        case 'en_curso': return 'En Curso';
        case 'al_dia': return 'Al Día';  // Nuevo estado
        default: return 'Desconocido';
      }
    },

    formatDate(date) {
      if (!date) return '';
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

  async created() {
    await this.fetchDashboardData();
    await this.fetchTotals();
    await this.fetchTarjetas();
    await this.fetchTarjetasCiclo();
  }
}
</script>

<style scoped>
@import './TotalComponent.css';
</style>