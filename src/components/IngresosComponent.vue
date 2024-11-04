<template>
  <div class="container mt-5">
    <navigation-bar :showBack="true" :showHome="true" :showLogout="true"></navigation-bar>
    <h1 class="text-center mb-4">Registrar Ingresos</h1>
    <form @submit.prevent="addIngreso" class="card p-4 shadow-sm">
      <div class="mb-3">
        <label for="fuente" class="form-label">Fuente</label>
        <select v-model="nuevoIngreso.fuente" id="fuente" class="form-select" required>
          <option value="Ingreso Salario">Ingreso Salario</option>
          <option value="Ingresos Extras">Ingresos Extras</option>
        </select>
      </div>
      <div v-if="nuevoIngreso.fuente === 'Ingresos Extras'" class="mb-3">
        <label for="descripcion" class="form-label">Descripción</label>
        <input v-model="nuevoIngreso.descripcion" id="descripcion" type="text" class="form-control" maxlength="70" placeholder="Descripción (máximo 70 caracteres)" required>
      </div>
      <div class="mb-3">
        <label for="fecha" class="form-label">Fecha</label>
        <input v-model="nuevoIngreso.fecha" id="fecha" type="date" class="form-control" required>
      </div>
      <div class="mb-3">
        <label for="monto" class="form-label">Monto</label>
        <input v-model.number="nuevoIngreso.monto" id="monto" type="text" class="form-control" inputmode="decimal" @input="validateNumber" required>
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
        fuente: 'Ingreso Salario',
        descripcion: '',
        fecha: '',
        monto: 0
      }
    }
  },
  methods: {
    async addIngreso() {
      const url = this.nuevoIngreso.fuente === 'Ingresos Extras' ? '/otros_ingresos' : '/ingresos'
      const data = {
        fuente: this.nuevoIngreso.fuente,
        fecha: this.nuevoIngreso.fecha,
        monto: this.nuevoIngreso.monto,
        descripcion: this.nuevoIngreso.descripcion
      }
      await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      this.nuevoIngreso = { fuente: 'Ingreso Salario', descripcion: '', fecha: '', monto: 0 }
      Swal.fire({
        icon: 'success',
        title: 'Ingreso Exitoso!',
        text: 'El ingreso ha sido agregado correctamente.',
        showConfirmButton: false,
        timer: 1500
      })
    },
    validateNumber(event) {
      const value = event.target.value
      const regex = /^[0-9]*\.?[0-9]*$/
      if (!regex.test(value)) {
        event.target.value = value.slice(0, -1)
      }
    }
  }
}
</script>