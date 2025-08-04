<template>
  <div class="container">
    <navigation-bar :showBack="true" :showHome="true" :showLogout="true"></navigation-bar>
    <h1>Otros Ingresos</h1>
    <ul class="list-group">
      <li class="list-group-item" v-for="otro_ingreso in otros_ingresos" :key="otro_ingreso.id">
        {{ otro_ingreso.fuente }} - {{ formatDate(otro_ingreso.fecha) }} - ${{ parseFloat(otro_ingreso.monto).toFixed(2) }}
      </li>
    </ul>
    <p class="mt-3">Total Otros Ingresos: ${{ parseFloat(totalOtrosIngresos).toFixed(2) }}</p>
    <form @submit.prevent="addOtroIngreso">
      <div class="mb-3">
        <label for="fuente" class="form-label">Fuente</label>
        <input v-model="nuevoOtroIngreso.fuente" id="fuente" class="form-control" placeholder="Fuente" required>
      </div>
      <div class="mb-3">
        <label for="fecha" class="form-label">Fecha</label>
        <input v-model="nuevoOtroIngreso.fecha" id="fecha" type="date" class="form-control" required>
      </div>
      <div class="mb-3">
        <label for="monto" class="form-label">Monto</label>
        <input v-model.number="nuevoOtroIngreso.monto" id="monto" type="text" class="form-control" inputmode="decimal" @input="validateNumber" required>
      </div>
      <button type="submit" class="btn btn-primary">Agregar Otro Ingreso</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import NavigationBar from './NavigationBar.vue'
import navigationMixin from '../mixins/navigationMixin.js'
import sessionValidation from '../mixins/sessionValidation.js'

export default {
  name: 'OtroIngresoComponent',
  mixins: [navigationMixin, sessionValidation],
  components: {
    NavigationBar
  },
  data() {
    return {
      otros_ingresos: [],
      nuevoOtroIngreso: {
        fuente: '',
        fecha: '',
        monto: 0
      }
    }
  },
  computed: {
    totalOtrosIngresos() {
      return this.otros_ingresos.reduce((total, otro_ingreso) => total + parseFloat(otro_ingreso.monto), 0).toFixed(2)
    }
  },
  created() {
    this.fetchOtrosIngresos()
  },
  methods: {
    async fetchOtrosIngresos() {
      const response = await axios.get('/otros_ingresos', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      this.otros_ingresos = response.data
    },
    async addOtroIngreso() {
      const response = await axios.post('/otros_ingresos', this.nuevoOtroIngreso, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      this.otros_ingresos.push(response.data)
      this.nuevoOtroIngreso = { fuente: '', fecha: '', monto: 0 }
      Swal.fire({
        icon: 'success',
        title: 'Ingreso Exitoso!',
        text: 'El otro ingreso ha sido agregado correctamente.',
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
    },
    formatDate(date) {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
      return new Date(date).toLocaleDateString('es-ES', options)
    }
  }
}
</script>