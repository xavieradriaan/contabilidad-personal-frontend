<template>
  <div class="container mt-5" style="position: relative;">
    <navigation-bar :showBack="true" :showHome="false" :showLogout="false"></navigation-bar>
    <h1 class="text-center mb-4">Registrar Ingresos</h1>
    <form @submit.prevent="addIngreso" class="card p-4 shadow-sm">
      <div class="mb-3">
        <label for="fecha" class="form-label">Fecha</label>
        <input v-model="nuevoIngreso.fecha" id="fecha" type="date" class="form-control" required @change="checkIngresos">
      </div>
      <div class="mb-3">
        <label for="fuente" class="form-label">Fuente</label>
        <select v-model="nuevoIngreso.fuente" id="fuente" class="form-select" required>
          <option value="" disabled>Seleccione una fuente</option>
          <option value="Ingresar Salario (Quincena)" :disabled="quincenaExists" :title="quincenaExists ? 'Ya se ha registrado un ingreso de Quincena para este mes' : ''">Ingresar Salario (Quincena)</option>
          <option value="Ingresar Salario (Fin de Mes)" :disabled="finMesExists" :title="finMesExists ? 'Ya se ha registrado un ingreso de Fin de Mes para este mes' : ''">Ingresar Salario (Fin de Mes)</option>
          <option value="Ingresos Extras">Ingresos Extras</option>
        </select>
      </div>
      <div v-if="nuevoIngreso.fuente === 'Ingresos Extras'" class="mb-3">
        <label for="descripcion" class="form-label">Descripción</label>
        <input v-model="nuevoIngreso.descripcion" id="descripcion" type="text" class="form-control" maxlength="70" placeholder="Descripción (máximo 70 caracteres)" required style="color: #000;">
      </div>
      <div class="mb-3">
        <label for="monto" class="form-label">Valor</label>
        <input v-model="nuevoIngreso.monto" id="monto" type="text" class="form-control" inputmode="decimal" @input="validateMonto" required placeholder="Ingrese un valor con decimales, Ejm: '217,50'" :style="{ color: nuevoIngreso.monto ? '#000' : 'rgba(0, 0, 0, 0.3)' }">
      </div>
      <button type="submit" :class="['btn', 'w-100', isFormValid ? 'btn-primary' : 'btn-secondary']" :style="!isFormValid ? { backgroundColor: '#d3d3d3', borderColor: '#d3d3d3' } : {}" :disabled="isSubmitting || !isFormValid">Agregar Ingreso</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import NavigationBar from './NavigationBar.vue'

export default {
  name: 'IngresosComponent',
  components: {
    NavigationBar
  },
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
      isSubmitting: false  // Nueva propiedad para controlar el estado del botón
    }
  },
  computed: {
    isFormValid() {
      return this.nuevoIngreso.fuente && this.nuevoIngreso.monto && this.nuevoIngreso.fecha;
    }
  },
  methods: {
    updateDescripcion() {
      if (this.nuevoIngreso.fuente === 'Ingresar Salario (Quincena)') {
        this.nuevoIngreso.descripcion = 'Quincena'
      } else if (this.nuevoIngreso.fuente === 'Ingresar Salario (Fin de Mes)') {
        this.nuevoIngreso.descripcion = 'Fin de Mes'
      } else {
        this.nuevoIngreso.descripcion = ''
      }
    },
    validateMonto(event) {
      let value = event.target.value.replace(/,/g, '.')
      // Remove non-numeric characters except for the first dot
      value = value.replace(/[^0-9.]/g, '')
      // Ensure only one dot is present
      const parts = value.split('.')
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('')
      }
      // Limit to two decimal places
      if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].slice(0, 2)
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
        this.setDefaultFuente()  // Establecer la fuente por defecto nuevamente
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
      this.isSubmitting = true  // Deshabilitar el botón al hacer clic
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
        await this.checkIngresos()  // Verificar nuevamente los ingresos después de agregar uno nuevo
        this.setDefaultFuente()  // Establecer la fuente por defecto nuevamente
        Swal.fire({
          icon: 'success',
          title: 'Ingreso Exitoso!',
          text: 'El ingreso ha sido agregado correctamente.',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.isSubmitting = false  // Habilitar el botón después de mostrar el mensaje
        })
      } catch (error) {
        console.error('Error al registrar ingreso:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al registrar el ingreso.',
          showConfirmButton: true
        }).then(() => {
          this.isSubmitting = false  // Habilitar el botón después de mostrar el mensaje de error
        })
      }
    }
  }
}
</script>

<style>
/* Estilo para cambiar el cursor cuando se pasa el mouse sobre las opciones deshabilitadas */
option[disabled] {
  cursor: not-allowed;
}
</style>