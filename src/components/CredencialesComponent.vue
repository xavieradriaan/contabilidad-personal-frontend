<template>
  <div class="credenciales-container">
    <div class="credenciales-animated-coins">
      <div v-for="index in 25" :key="index" class="credenciales-coin" :class="`credenciales-coin-${index}`">
        <img src="/monedas.png" alt="Moneda animada" class="credenciales-coin-img" style="width: 100%; height: 100%;"> <!-- Ensure correct size -->
      </div>
    </div>

    <!-- Add this back button -->
    <button class="credenciales-back-btn" @click="$router.go(-1)">
      <i class="fas fa-chevron-left"></i>
    </button>

    <navigation-bar :showBack="true" :showHome="false" :showLogout="false" class="credenciales-nav" />

    <main class="credenciales-main-content">
      <h1 class="credenciales-main-title">
        <span class="credenciales-brand-text">CONTABILÍZATE</span>
        <p class="credenciales-main-subtitle">Gestión de Credenciales</p>
      </h1>

      <div class="credenciales-main-card">
        <form @submit.prevent="saveCredencial" class="credenciales-form">
          <div class="credenciales-input-group">
            <label for="descripcion" class="credenciales-input-label">
              <i class="fas fa-tag credenciales-icon"></i>
              <span>Descripción</span>
            </label>
            <input
              v-model="descripcion"
              type="text"
              id="descripcion"
              class="credenciales-auth-input"
              required
            >
          </div>

          <div class="credenciales-input-group">
            <label for="credencial" class="credenciales-input-label">
              <i class="fas fa-key credenciales-icon"></i>
              <span>Credencial</span>
            </label>
            <textarea
              v-model="credencial"
              id="credencial"
              class="credenciales-auth-input credenciales-textarea"
              rows="3"
              required
            ></textarea>
          </div>

          <button type="submit" class="credenciales-auth-btn credenciales-save-btn">
            Guardar Credencial
          </button>
        </form>

        <div class="credenciales-list-section">
          <h3 class="credenciales-list-title">Mis Credenciales</h3>
          
          <div v-if="credenciales.length" class="credenciales-list-container">
            <div v-for="credencial in credenciales" :key="credencial.id" class="credenciales-item">
              <div class="credenciales-item-header">
                <strong class="credenciales-item-title">{{ credencial.descripcion }}</strong>
                <button 
                  @click="confirmDeleteCredencial(credencial.id)"
                  class="credenciales-delete-btn"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
              <p class="credenciales-item-content" v-html="formatCredencial(credencial.credencial)"></p>
            </div>
          </div>
          
          <p v-else class="credenciales-empty">No hay credenciales guardadas</p>
        </div>
      </div>
    </main>
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
    /* Mantener misma lógica original */
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
      return credencial.replace(/\n/g, '<br>')
    }
  }
}
</script>

<style scoped>
@import './CredencialesComponent.css';

.credenciales-delete-btn {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem; /* Adjust icon size */
  color: #ff4d4d; /* Optional: Add color for better visibility */
}

.credenciales-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>