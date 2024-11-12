<template>
  <div class="container mt-5">
    <navigation-bar :showBack="true" :showHome="true" :showLogout="true"></navigation-bar>
    <h1 class="text-center mb-4">Registrar Ingresos</h1>
    <form @submit.prevent="addIngreso" class="card p-4 shadow-sm">
      <div class="mb-3">
        <label for="fuente" class="form-label">Fuente</label>
        <select v-model="nuevoIngreso.fuente" id="fuente" class="form-select" required @change="updateDescripcion">
          <option value="Ingresar Salario (Quincena)">Ingresar Salario (Quincena)</option>
          <option value="Ingresar Salario (Fin de Mes)">Ingresar Salario (Fin de Mes)</option>
          <option value="Ingresos Extras">Ingresos Extras</option>
        </select>
      </div>
      <div v-if="nuevoIngreso.fuente === 'Ingresos Extras'" class="mb-3">
        <label for="descripcion" class="form-label">Descripción</label>
        <input v-model="nuevoIngreso.descripcion" id="descripcion" type="text" class="form-control" maxlength="70" placeholder="Descripción (máximo 70 caracteres)" required style="color: #000;" :style="{ '::placeholder': { color: '#d3d3d3' } }">
      </div>
      <div class="mb-3">
        <label for="fecha" class="form-label">Fecha</label>
        <input v-model="nuevoIngreso.fecha" id="fecha" type="date" class="form-control" required>
      </div>
      <div class="mb-3">
        <label for="monto" class="form-label">Valor</label>
        <input v-model="nuevoIngreso.monto" id="monto" type="text" class="form-control" inputmode="numeric" @input="validateMonto" required placeholder="Ingrese solo valores enteros" style="color: #000;" :style="{ '::placeholder': { color: '#d3d3d3' } }">
      </div>
      <button type="submit" class="btn btn-primary w-100">Agregar Ingreso</button>
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
        fuente: 'Ingresar Salario (Quincena)',
        descripcion: '',
        fecha: '',
        monto: ''
      }
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
      let value = event.target.value.replace(/[^0-9]/g, '')
      if (value.length > 5) {
        value = value.slice(0, 5)
      }
      this.nuevoIngreso.monto = value
    },
    async addIngreso() {
      const url = this.nuevoIngreso.fuente === 'Ingresos Extras' ? '/otros_ingresos' : '/ingresos'
      const data = {
        fuente: this.nuevoIngreso.fuente,
        fecha: this.nuevoIngreso.fecha,
        monto: parseInt(this.nuevoIngreso.monto, 10),
        descripcion: this.nuevoIngreso.descripcion
      }
      try {
        await axios.post(url, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        this.nuevoIngreso = { fuente: 'Ingresar Salario (Quincena)', descripcion: '', fecha: '', monto: '' }
        Swal.fire({
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
      }
    }
  }
}
</script>