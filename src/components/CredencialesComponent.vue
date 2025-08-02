<template>
  <div class="credenciales-container">
    <div class="credenciales-animated-coins">
      <div v-for="index in 25" :key="index" class="credenciales-coin" :class="`credenciales-coin-${index}`">
        <img src="/monedas.png" alt="Moneda animada" class="credenciales-coin-img" style="width: 100%; height: 100%;"> <!-- Ensure correct size -->
      </div>
    </div>

    <!-- Add this back button -->
    <button class="credenciales-back-btn" @click="safeGoBack('/dashboard')">
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
          <button 
            type="submit" 
            class="credenciales-auth-btn credenciales-save-btn"
            :disabled="isSavingCredential"
          >
            <span v-if="!isSavingCredential">Guardar Credencial</span>
            <span v-else>
              <i class="fas fa-spinner fa-spin"></i> Guardando...
            </span>
          </button>
        </form>

        <div class="credenciales-list-section">
          <h3 class="credenciales-list-title">Mis Credenciales</h3>
          
          <div v-if="credenciales.length" class="credenciales-list-container">
            <div v-for="credencial in credenciales" :key="credencial.id" class="credenciales-item">
              <div class="credenciales-item-header">
                <strong class="credenciales-item-title">{{ credencial.descripcion }}</strong>
                <button 
                  @click="openEditModal(credencial)"
                  class="credenciales-edit-btn"
                  title="Editar"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  @click="confirmDeleteCredencial(credencial.id)"
                  class="credenciales-delete-btn"
                  title="Eliminar"
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

      <!-- Modal para edición de credenciales -->
      <div v-if="showEditModal" class="credenciales-modal">
        <div class="credenciales-modal-content">
          <span class="credenciales-modal-close" @click="closeEditModal">&times;</span>
          <h2 class="credenciales-modal-title">Editar Credencial</h2>

          <!-- Paso 2: Formulario de edición -->
          <div v-if="editStep === 2" class="credenciales-modal-step">
            <form @submit.prevent="goToConfirmEdit" class="credenciales-form">
              <div class="credenciales-input-group">
                <label for="editDescripcion" class="credenciales-input-label">
                  <i class="fas fa-tag credenciales-icon"></i>
                  <span>Descripción</span>
                </label>
                <input
                  v-model="editDescription"
                  type="text"
                  id="editDescripcion"
                  class="credenciales-auth-input"
                  required
                >
              </div>
              <div class="credenciales-input-group">
                <label for="editCredencial" class="credenciales-input-label">
                  <i class="fas fa-key credenciales-icon"></i>
                  <span>Credencial</span>
                </label>
                <textarea
                  v-model="editCredential"
                  id="editCredencial"
                  class="credenciales-auth-input credenciales-textarea"
                  rows="3"
                  required
                ></textarea>
              </div>
              <div class="credenciales-modal-actions">
                <button 
                  type="submit" 
                  class="credenciales-modal-btn credenciales-modal-confirm" 
                  :disabled="isSaving"
                >
                  Siguiente
                </button>
                <button type="button" @click="closeEditModal" class="credenciales-modal-btn credenciales-modal-cancel">
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          <!-- Paso 1: Confirmación -->
          <div v-else-if="editStep === 1" class="credenciales-modal-step">
            <p>¿Deseas confirmar los cambios en la credencial?</p>
            <div class="credenciales-modal-actions">
              <button @click="saveEditedCredential" class="credenciales-modal-btn credenciales-modal-confirm" :disabled="isSaving">
                {{ isSaving ? 'Guardando...' : 'Confirmar' }}
              </button>
              <button @click="editStep = 2" class="credenciales-modal-btn credenciales-modal-back">
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Notificación de éxito -->
      <transition 
        name="credenciales-notification"
        enter-active-class="credenciales-notification-enter-active"
        leave-active-class="credenciales-notification-leave-active"
        enter-from-class="credenciales-notification-enter-from"
        leave-to-class="credenciales-notification-leave-to"
      >
        <div 
          v-if="showSuccessNotification" 
          class="credenciales-notification credenciales-notification-success"
        >
          <i class="fas fa-check-circle"></i>
          {{ successMessage }}
        </div>
      </transition>
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import NavigationBar from './NavigationBar.vue'
import navigationMixin from '../mixins/navigationMixin.js'

export default {
  name: 'CredencialesComponent',
  mixins: [navigationMixin],
  components: {
    NavigationBar
  },
  data() {
    return {
      descripcion: '',
      credencial: '',
      credenciales: [],
      // Modal edición
      showEditModal: false,
      currentCredential: null,
      editStep: 2, // 2: edición, 1: confirmación
      editDescription: '',
      editCredential: '',
      hasChanges: false,
      isSaving: false,
      isSavingCredential: false, // Controlar estado del botón
      showSuccessNotification: false, // Mostrar notificación
      successMessage: '¡Credencial guardada con éxito!' // Mensaje dinámico
    }
  },
  watch: {
    editDescription() {
      this.checkForChanges();
    },
    editCredential() {
      this.checkForChanges();
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
      this.isSavingCredential = true;
      try {
        const response = await axios.post('/credenciales', {
          descripcion: this.descripcion,
          credencial: this.credencial
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.credenciales.push(response.data);
        this.descripcion = '';
        this.credencial = '';
        this.successMessage = '¡Credencial guardada con éxito!';
        this.showSuccessNotification = true;
        setTimeout(() => {
          this.showSuccessNotification = false;
        }, 1500);
      } catch (error) {
        console.error('Error al guardar credencial:', error);
      } finally {
        this.isSavingCredential = false;
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
        this.successMessage = '¡Credencial eliminada con éxito!';
        this.showSuccessNotification = true;
        setTimeout(() => {
          this.showSuccessNotification = false;
        }, 1500);
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
      if (!credencial) return '';
      return credencial.replace(/\n/g, '<br>')
    },
    // --- Modal edición ---
    openEditModal(credencial) {
      this.currentCredential = credencial;
      this.editDescription = credencial.descripcion;
      this.editCredential = credencial.credencial;
      this.showEditModal = true;
      this.editStep = 2; // Abrir directamente el formulario de edición
      this.hasChanges = false;
    },
    goToConfirmEdit() {
      this.editStep = 1;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.currentCredential = null;
      this.editStep = 2;
      this.isSaving = false;
    },
    checkForChanges() {
      if (this.currentCredential) {
        this.hasChanges =
          this.editDescription !== this.currentCredential.descripcion ||
          this.editCredential !== this.currentCredential.credencial;
      } else {
        this.hasChanges = false;
      }
    },
    async saveEditedCredential() {
      this.isSaving = true;
      try {
        const response = await axios.put('/credenciales', {
          id: this.currentCredential.id,
          descripcion: this.editDescription,
          credencial: this.editCredential
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.updated === false) {
          this.successMessage = '¡Credencial guardada sin modificaciones!';
          this.showSuccessNotification = true;
          setTimeout(() => {
            this.showSuccessNotification = false;
          }, 1500);
          this.closeEditModal();
          return;
        }

        this.successMessage = '¡Credencial modificada con éxito!';
        this.showSuccessNotification = true;
        setTimeout(() => {
          this.showSuccessNotification = false;
        }, 1500);

        const credencialActualizada = response.data.credencial || response.data;
        const index = this.credenciales.findIndex(c => c.id === this.currentCredential.id);
        if (index !== -1 && credencialActualizada) {
          this.credenciales[index] = credencialActualizada;
        }
        this.closeEditModal();
      } catch (error) {
        console.error('Error al actualizar credencial:', error);
        alert('Error al actualizar credencial');
        this.isSaving = false;
      }
    },
    showSuccessMessage(message) {
      // Crear elemento de notificación
      const notification = document.createElement('div');
      notification.className = 'credenciales-notification credenciales-notification-success';
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.classList.add('credenciales-notification-exit');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
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

.credenciales-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.credenciales-modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  position: relative;
}

.credenciales-modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  cursor: pointer;
  font-size: 1.5rem;
}

.credenciales-modal-title {
  margin: 0 0 1rem 0;
  font-size: 1.8rem;
  text-align: center;
}

.credenciales-modal-step {
  display: flex;
  flex-direction: column;
}

.credenciales-modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.credenciales-modal-btn {
  flex: 1;
  margin: 0 0.5rem;
}

/* ELIMINAR ESTAS REGLAS (ya están en el CSS global) */
/*
.credenciales-notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: #28a745;
  color: #fff;
  padding: 1rem;
  border-radius: 5px;
  z-index: 1000;
  transition: opacity 0.3s ease;
}

.credenciales-notification-exit {
  opacity: 0;
}
*/
</style>
