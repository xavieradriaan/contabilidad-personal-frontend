<template>
  <div class="container mt-5">
    <navigation-bar :showBack="true" :showHome="false" :showLogout="false"></navigation-bar>
    <h1 class="text-center mb-4">Credenciales</h1>
    <div class="card p-4 shadow-sm">
      <form @submit.prevent="saveCredencial" class="text-center">
        <div class="mb-3">
          <label for="descripcion" class="form-label">Descripción</label>
          <input v-model="descripcion" type="text" class="form-control" id="descripcion" required>
        </div>
        <div class="mb-3">
          <label for="credencial" class="form-label">Credencial</label>
          <textarea v-model="credencial" class="form-control" id="credencial" rows="3" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-half">Guardar</button>
      </form>
      <div class="mt-4">
        <h3>Mis Credenciales</h3>
        <ul class="list-group">
          <li v-for="credencial in credenciales" :key="credencial.id" class="list-group-item">
            <strong>{{ credencial.descripcion }}</strong>
            <p v-html="formatCredencial(credencial.credencial)"></p>
            <button @click="confirmDeleteCredencial(credencial.id)" class="btn btn-danger btn-sm btn-half">Eliminar</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import NavigationBar from './NavigationBar.vue'

export default {
  name: 'CredencialesComponent',
  components: {
    NavigationBar
  },
  data() {
    return {
      descripcion: '',
      credencial: '',
      credenciales: []
    }
  },
  async created() {
    await this.fetchCredenciales()
  },
  methods: {
    async fetchCredenciales() {
      try {
        const response = await axios.get('/credenciales', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        this.credenciales = response.data
      } catch (error) {
        console.error('Error al obtener credenciales:', error)
      }
    },
    async saveCredencial() {
      try {
        const response = await axios.post('/credenciales', {
          descripcion: this.descripcion,
          credencial: this.credencial
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        this.credenciales.push(response.data)
        this.descripcion = ''
        this.credencial = ''
      } catch (error) {
        console.error('Error al guardar credencial:', error)
      }
    },
    async deleteCredencial(id) {
      try {
        await axios.delete('/credenciales', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          data: { id }
        })
        this.credenciales = this.credenciales.filter(credencial => credencial.id !== id)
      } catch (error) {
        console.error('Error al eliminar credencial:', error)
      }
    },
    confirmDeleteCredencial(id) {
      if (confirm("¿Estás seguro que deseas eliminar esta credencial?")) {
        this.deleteCredencial(id)
      }
    },
    formatCredencial(credencial) {
      // Reemplazar saltos de línea con etiquetas <br> para mostrar correctamente en HTML
      return credencial.replace(/\n/g, '<br>')
    }
  }
}
</script>

<style scoped>
/* Estilo para cambiar el tamaño de los botones a la mitad */
.btn-half {
  width: 50%;
  margin: 0 auto;
}
</style>