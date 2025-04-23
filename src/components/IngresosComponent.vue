<template>
  <div class="ingresos-container">
    <div class="ingresos-animated-coins">
      <div v-for="index in 25" :key="index" class="ingresos-coin" :class="`ingresos-coin-${index}`">
        <img src="/monedas.png" alt="Moneda animada" class="ingresos-coin-img">
      </div>
    </div>

    <button class="ingresos-back-btn" @click="$router.go(-1)">
      <i class="fas fa-chevron-left"></i>
    </button>

    <main class="ingresos-main-content">
      <h1 class="ingresos-title">
        <span class="ingresos-brand-text">CONTABILÍZATE</span>
        <p class="ingresos-subtitle">Registro de Ingresos</p>
      </h1>

      <div class="ingresos-auth-card">
        <form @submit.prevent="addIngreso" class="ingresos-auth-form">
          <div class="ingresos-input-group">
            <label for="fecha" class="ingresos-input-label">
              <i class="fas fa-calendar-alt ingresos-icon"></i>
              <span>Fecha</span>
            </label>
            <input
              v-model="nuevoIngreso.fecha"
              id="fecha"
              type="date"
              class="ingresos-auth-input"
              required
              @change="checkIngresos"
            >
          </div>

          <div class="ingresos-input-group">
            <label for="fuente" class="ingresos-input-label">
              <i class="fas fa-wallet ingresos-icon"></i>
              <span>Fuente de Ingreso</span>
            </label>
            <select
              v-model="nuevoIngreso.fuente"
              id="fuente"
              class="ingresos-auth-input"
              required
              :class="{'ingresos-input-disabled': (quincenaExists || finMesExists)}"
            >
              <option value="" disabled>Seleccione una fuente</option>
              <option 
                value="Ingresar Salario (Quincena)" 
                :disabled="quincenaExists" 
                :title="quincenaExists ? 'Ya se ha registrado un ingreso de Quincena para este mes' : ''"
              >Ingresar Salario (Quincena)</option>
              <option 
                value="Ingresar Salario (Fin de Mes)" 
                :disabled="finMesExists" 
                :title="finMesExists ? 'Ya se ha registrado un ingreso de Fin de Mes para este mes' : ''"
              >Ingresar Salario (Fin de Mes)</option>
              <option value="Ingresos Extras">Ingresos Extras</option>
            </select>
          </div>

          <div v-if="nuevoIngreso.fuente === 'Ingresos Extras'" class="ingresos-input-group">
            <label for="descripcion" class="ingresos-input-label">
              <i class="fas fa-comment ingresos-icon"></i>
              <span>Descripción</span>
            </label>
            <input
              v-model="nuevoIngreso.descripcion"
              id="descripcion"
              type="text"
              class="ingresos-auth-input"
              maxlength="70"
              placeholder="Descripción (máximo 70 caracteres)"
              required
            >
          </div>

          <div class="ingresos-input-group">
            <label for="monto" class="ingresos-input-label">
              <i class="fas fa-coins ingresos-icon"></i>
              <span>Valor</span>
            </label>
            <input
              v-model="nuevoIngreso.monto"
              id="monto"
              type="text"
              class="ingresos-auth-input"
              inputmode="decimal"
              @input="validateMonto"
              required
              placeholder="Ingrese un valor con decimales, Ejm: '217,50'"
            >
          </div>

          <button
            type="submit"
            class="ingresos-auth-btn ingresos-submit-btn"
            :disabled="isSubmitting || !isFormValid"
            :class="{'ingresos-loading': isSubmitting}"
          >
            <span v-if="!isSubmitting">Agregar Ingreso</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  name: 'IngresosComponent',
  data() {
    return {
      nuevoIngreso: {
        fuente: '',
        descripcion: '',
        fecha: '',
        monto: ''
      },
      quincenaExists: false,
      finMesExists: false,
      isSubmitting: false
    }
  },
  computed: {
    isFormValid() {
      return this.nuevoIngreso.fuente && 
             this.nuevoIngreso.monto && 
             this.nuevoIngreso.fecha && 
             parseFloat(this.nuevoIngreso.monto) > 0;
    }
  },
  methods: {
    validateMonto(event) {
      let value = event.target.value.replace(/,/g, '.')
      value = value.replace(/[^0-9.]/g, '')
      const parts = value.split('.')
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('')
      }
      if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].slice(0, 2)
      }
      if (parts[0].length > 7) {
        value = parts[0].slice(0, 7) + (parts[1] ? '.' + parts[1] : '')
      }
      if (value.startsWith('0') || parseFloat(value) <= 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se puede ingresar 0 ni valores negativos.',
          showConfirmButton: true
        })
        value = ''
      }
      this.nuevoIngreso.monto = value
    },
    async checkIngresos() {
      if (!this.nuevoIngreso.fecha) return;
      const [year, month] = this.nuevoIngreso.fecha.split('-');
      try {
        const response = await axios.get('/check_ingresos', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          params: {
            year: year,
            month: month
          }
        })
        this.quincenaExists = response.data.quincena_exists
        this.finMesExists = response.data.fin_mes_exists
        this.setDefaultFuente()
      } catch (error) {
        console.error('Error al verificar ingresos:', error)
      }
    },
    setDefaultFuente() {
      if (!this.quincenaExists) {
        this.nuevoIngreso.fuente = 'Ingresar Salario (Quincena)'
      } else if (!this.finMesExists) {
        this.nuevoIngreso.fuente = 'Ingresar Salario (Fin de Mes)'
      } else {
        this.nuevoIngreso.fuente = 'Ingresos Extras'
      }
    },
    async addIngreso() {
      this.isSubmitting = true
      const [year, month] = this.nuevoIngreso.fecha.split('-');
      try {
        const response = await axios.get('/check_ingresos', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          params: {
            year: year,
            month: month
          }
        })
        if ((this.nuevoIngreso.fuente === 'Ingresar Salario (Quincena)' && response.data.quincena_exists) ||
            (this.nuevoIngreso.fuente === 'Ingresar Salario (Fin de Mes)' && response.data.fin_mes_exists)) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Ya se ha registrado un ingreso de ${this.nuevoIngreso.fuente} para este mes.`,
            showConfirmButton: true
          })
          this.isSubmitting = false
          return
        }
        const url = this.nuevoIngreso.fuente === 'Ingresos Extras' ? '/otros_ingresos' : '/ingresos'
        const data = {
          fuente: this.nuevoIngreso.fuente,
          fecha: this.nuevoIngreso.fecha,
          monto: parseFloat(this.nuevoIngreso.monto),
          descripcion: this.nuevoIngreso.descripcion
        }
        await axios.post(url, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        this.nuevoIngreso = { fuente: '', descripcion: '', fecha: '', monto: '' }
        await this.checkIngresos()
        this.setDefaultFuente()
        await Swal.fire({
          icon: 'success',
          title: 'Ingreso Exitoso!',
          text: 'El ingreso ha sido agregado correctamente.',
          showConfirmButton: false,
          timer: 1500
        })
      } catch (error) {
        console.error('Error al registrar ingreso:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al registrar el ingreso.',
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
@import './IngresosComponent.css';
</style>