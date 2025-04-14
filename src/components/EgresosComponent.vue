<template>
  <div class="egresos-container">
    <div class="egresos-animated-coins">
      <div v-for="index in 25" :key="index" class="egresos-coin" :class="`egresos-coin-${index}`">
        <img src="/monedas.png" alt="Moneda animada" class="egresos-coin-img">
      </div>
    </div>

    <button class="egresos-back-btn" @click="$router.go(-1)">
      <i class="fas fa-chevron-left"></i>
    </button>

    <main class="egresos-main-content">
      <h1 class="egresos-title">
        <span class="egresos-brand-text">CONTABILÍZATE</span>
        <p class="egresos-subtitle">Registro de Egresos</p>
      </h1>

      <div class="egresos-auth-card">
        <form @submit.prevent="addEgreso" class="egresos-auth-form">
          <div class="egresos-input-group">
            <label for="fecha" class="egresos-input-label">
              <i class="fas fa-calendar-alt egresos-icon"></i>
              <span>Fecha</span>
            </label>
            <input
              v-model="nuevoEgreso.fecha"
              id="fecha"
              type="date"
              class="egresos-auth-input"
              required
            >
          </div>

          <div class="egresos-input-group">
            <label for="categoria" class="egresos-input-label">
              <i class="fas fa-tags egresos-icon"></i>
              <span>Categoría</span>
            </label>
            <select
              v-model="nuevoEgreso.categoria"
              id="categoria"
              class="egresos-auth-input"
              required
            >
              <option v-for="categoria in categorias" :key="categoria" :value="categoria">{{ categoria }}</option>
            </select>
          </div>

          <div class="egresos-input-group">
            <label for="subcategoria" class="egresos-input-label">
              <i class="fas fa-comment-dots egresos-icon"></i>
              <span>Subcategoría (opcional)</span>
            </label>
            <input
              v-model="nuevoEgreso.subcategoria"
              id="subcategoria"
              class="egresos-auth-input"
              placeholder="Descripción"
              maxlength="60"
            >
          </div>

          <div class="egresos-input-group">
            <label for="monto" class="egresos-input-label">
              <i class="fas fa-coins egresos-icon"></i>
              <span>Valor</span>
            </label>
            <input
              v-model="nuevoEgreso.monto"
              id="monto"
              type="text"
              class="egresos-auth-input"
              inputmode="decimal"
              @input="validateMonto"
              required
              placeholder="Ej: 217,50"
            >
          </div>

          <div class="egresos-input-group">
            <label for="bancos" class="egresos-input-label">
              <i class="fas fa-university egresos-icon"></i>
              <span>Banco (opcional)</span>
            </label>
            <select
              v-model="nuevoEgreso.bancos"
              id="bancos"
              class="egresos-auth-input"
            >
              <option value="">Seleccione un banco</option>
              <option v-for="banco in bancos" :key="banco" :value="banco">{{ banco }}</option>
            </select>
          </div>

          <button
            type="submit"
            class="egresos-auth-btn egresos-submit-btn"
            :disabled="isSubmitting || !isFormValid"
            :class="{'egresos-loading': isSubmitting}"
          >
            <span v-if="!isSubmitting">Agregar Egreso</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
        </form>
      </div>
    </main>

    <!-- Modal actualizado -->
    <div v-if="showModal" class="egresos-modal-overlay">
      <div class="egresos-modal-card">
        <div class="egresos-modal-header">
          <h3 class="egresos-modal-title">Seleccionar Pagos Recurrentes</h3>
          <button class="egresos-modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="egresos-modal-body">
          <div v-for="categoria in categorias" :key="categoria" class="egresos-check-group">
            <input
              type="checkbox"
              :id="categoria"
              :value="categoria"
              v-model="selectedCategorias"
              class="egresos-check-input"
            >
            <label :for="categoria" class="egresos-check-label">
              {{ categoria }}
            </label>
          </div>
        </div>
        <div class="egresos-modal-footer">
          <button
            class="egresos-auth-btn egresos-modal-btn"
            @click="savePagosRecurrentes"
          >
            Guardar Selección
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  name: 'EgresosComponent',
  data() {
    return {
      nuevoEgreso: {
        categoria: '',
        subcategoria: '',
        monto: '',
        fecha: '',
        bancos: ''
      },
      categorias: [
        'Teléfono Móvil', 'GitHub', 'Mami', 'Comida', 'Movilización Trabajo', 
        'Pago de Tarjetas (Pacificard)', 'Pago de Tarjetas (Bankard)', 
        'Pago de Tarjetas (American Express)', 'Pago de Tarjetas (Diners Club)', 
        'Spotify', 'Maestría', 'Ropa', 'Zapatos', 'Tecnología', 'Restaurantes', 
        'Salud', 'Cursos Online', 'Gastos Hijos', 'Videojuegos', 'Netflix', 
        'Amazon Prime', 'Alquiler', 'Transporte', 'Entretenimiento', 'Manutención', 
        'Otros (Gastos Varios)', 'PayPal', 'Luz', 'Agua', 'Teléfono Fijo', 
        'Préstamos', 'Seguros', 'Automóvil', 'Railway'
      ],
      bancos: [
        'Pacificard', 'Bankard', 'Banco Diners Club', 'American Express', 
        'Banco Pichincha', 'Produbanco', 'Banco Guayaquil', 'Banco del Pacífico', 
        'Banco Bolivariano', 'Banco Internacional', 'Banco del Austro', 
        'Banco G. Rumiñahui', 'Banco de Machala', 'CitiBank', 'Banco ProCredit', 
        'Banco Amazonas', 'Banco CoopNacional', 'Banco del Litoral', 'Banco DelBank'
      ],
      showModal: false,
      selectedCategorias: [],
      isSubmitting: false
    }
  },
  computed: {
    isFormValid() {
      return this.nuevoEgreso.categoria && 
             this.nuevoEgreso.monto && 
             this.nuevoEgreso.fecha && 
             parseFloat(this.nuevoEgreso.monto) > 0;
    }
  },
  async created() {
    await this.checkFirstTime()
  },
  methods: {
    validateMonto(event) {
      let value = event.target.value.replace(/,/g, '.')
      value = value.replace(/[^0-9.]/g, '')
      const parts = value.split('.')
      if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('')
      if (parts[1] && parts[1].length > 2) value = parts[0] + '.' + parts[1].slice(0, 2)
      if (parts[0].length > 7) value = parts[0].slice(0, 7) + (parts[1] ? '.' + parts[1] : '')
      
      if (value.startsWith('0') || parseFloat(value) <= 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se puede ingresar 0 ni valores negativos.',
          showConfirmButton: true
        })
        value = ''
      }
      this.nuevoEgreso.monto = value
    },
    async checkFirstTime() {
      try {
        const response = await axios.get('/pagos_recurrentes', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          params: {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1
          }
        })
        if (response.data.length === 0) this.showModal = true
      } catch (error) {
        console.error('Error al verificar pagos recurrentes:', error)
      }
    },
    async savePagosRecurrentes() {
      try {
        await axios.post('/pagos_recurrentes', 
          { categorias: this.selectedCategorias },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        )
        this.showModal = false
        Swal.fire({
          icon: 'success',
          title: 'Pagos Recurrentes Guardados',
          text: 'Configuración guardada correctamente',
          showConfirmButton: false,
          timer: 1500
        })
      } catch (error) {
        console.error('Error al guardar pagos recurrentes:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al guardar la configuración',
          showConfirmButton: true
        })
      }
    },
    closeModal() {
      this.showModal = false
    },
    async addEgreso() {
      this.isSubmitting = true
      try {
        await axios.post('/egresos', {
          categoria: this.nuevoEgreso.categoria,
          subcategoria: this.nuevoEgreso.subcategoria,
          monto: parseFloat(this.nuevoEgreso.monto),
          fecha: this.nuevoEgreso.fecha,
          bancos: this.nuevoEgreso.bancos
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        
        this.nuevoEgreso = { categoria: '', subcategoria: '', monto: '', fecha: '', bancos: '' }
        await Swal.fire({
          icon: 'success',
          title: 'Egreso Registrado!',
          text: 'El egreso se ha registrado correctamente',
          showConfirmButton: false,
          timer: 1500
        })
      } catch (error) {
        console.error('Error al registrar egreso:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al registrar el egreso',
          showConfirmButton: true
        })
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style>
@import './EgresosComponent.css';
</style>