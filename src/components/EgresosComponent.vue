<template>
  <div class="container mt-5">
    <navigation-bar :showBack="true" :showHome="true" :showLogout="true"></navigation-bar>
    <h1 class="text-center mb-4">Registrar Egresos</h1>
    <form @submit.prevent="addEgreso" class="card p-4 shadow-sm">
      <div class="mb-3">
        <label for="categoria" class="form-label">Categoría</label>
        <select v-model="nuevoEgreso.categoria" id="categoria" class="form-select" required>
          <option v-for="categoria in categorias" :key="categoria" :value="categoria">{{ categoria }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="subcategoria" class="form-label">Subcategoría</label>
        <input v-model="nuevoEgreso.subcategoria" id="subcategoria" class="form-control" placeholder="Descripción (opcional)" style="color: #000;" :style="{ '::placeholder': { color: '#6c757d' } }">
      </div>
      <div class="mb-3">
        <label for="monto" class="form-label">Valor</label>
        <input v-model="nuevoEgreso.monto" id="monto" type="text" class="form-control" inputmode="decimal" @input="validateMonto" required placeholder="Ingrese valores con decimales, ej: 300.50" style="color: #000;" :style="{ '::placeholder': { color: '#6c757d' } }">
      </div>
      <div class="mb-3">
        <label for="fecha" class="form-label">Fecha</label>
        <input v-model="nuevoEgreso.fecha" id="fecha" type="date" class="form-control" required>
      </div>
      <button type="submit" class="btn btn-primary w-100">Agregar Egreso</button>
    </form>

    <!-- Modal para seleccionar pagos recurrentes -->
    <div v-if="showModal" class="modal" tabindex="-1" style="display: block;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Seleccionar Pagos Recurrentes</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div v-for="categoria in categorias" :key="categoria" class="form-check">
              <input class="form-check-input" type="checkbox" :value="categoria" v-model="selectedCategorias">
              <label class="form-check-label">{{ categoria }}</label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="savePagosRecurrentes">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import NavigationBar from './NavigationBar.vue'

export default {
  name: 'EgresosComponent',
  components: {
    NavigationBar
  },
  data() {
    return {
      nuevoEgreso: {
        categoria: '',
        subcategoria: '',
        monto: '',
        fecha: ''
      },
      categorias: [
        'Teléfono Móvil', 'GitHub', 'Mami', 'Comida', 'Movilización Trabajo', 'Diners Club', 'Spotify', 'Maestría', 'Ropa', 'Zapatos', 'Tecnología', 'Restaurantes', 'Salud', 'Cursos Online', 'Gastos Hijos', 'Videojuegos', 'Netflix', 'Amazon Prime', 'Alquiler', 'Transporte', 'Entretenimiento', 'Manutención', 'Otros (Gastos Varios)'
      ],
      showModal: false,
      selectedCategorias: []
    }
  },
  async created() {
    await this.checkFirstTime()
  },
  methods: {
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
      this.nuevoEgreso.monto = value
    },
    async checkFirstTime() {
      try {
        const response = await axios.get('/pagos_recurrentes', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.data.length === 0) {
          this.showModal = true
        }
      } catch (error) {
        console.error('Error al verificar pagos recurrentes:', error)
      }
    },
    async savePagosRecurrentes() {
      try {
        await axios.post('/pagos_recurrentes', { categorias: this.selectedCategorias }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        this.showModal = false
        Swal.fire({
          icon: 'success',
          title: 'Pagos Recurrentes Guardados',
          text: 'Los pagos recurrentes han sido guardados correctamente.',
          showConfirmButton: false,
          timer: 1500
        })
      } catch (error) {
        console.error('Error al guardar pagos recurrentes:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al guardar los pagos recurrentes.',
          showConfirmButton: true
        })
      }
    },
    closeModal() {
      this.showModal = false
    },
    async addEgreso() {
      try {
        await axios.post('/egresos', {
          categoria: this.nuevoEgreso.categoria,
          subcategoria: this.nuevoEgreso.subcategoria,
          monto: parseFloat(this.nuevoEgreso.monto),
          fecha: this.nuevoEgreso.fecha
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        this.nuevoEgreso = { categoria: '', subcategoria: '', monto: '', fecha: '' }
        Swal.fire({
          icon: 'success',
          title: 'Egreso Exitoso!',
          text: 'El egreso ha sido agregado correctamente.',
          showConfirmButton: false,
          timer: 1500
        })
      } catch (error) {
        console.error('Error al registrar egreso:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al registrar el egreso.',
          showConfirmButton: true
        })
      }
    }
  }
}
</script>