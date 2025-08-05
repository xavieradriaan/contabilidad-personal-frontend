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
                <div class="credenciales-buttons-group">
                  <button 
                    @click="toggleVisibility(credencial.id)"
                    class="credenciales-eye-btn"
                    :title="isVisible(credencial.id) ? 'Ocultar' : 'Mostrar'"
                  >
                    <i :class="isVisible(credencial.id) ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
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
              </div>
              <div class="credenciales-content-wrapper">
                <p class="credenciales-item-content" v-html="formatCredencial(credencial.credencial, credencial.id)"></p>
              </div>
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

      <!-- Modal OTP Verificación -->
      <div v-if="showOTPModal" class="credenciales-modal">
        <div class="credenciales-modal-content">
          <span class="credenciales-modal-close" @click="closeOTPModal">&times;</span>
          <h2 class="credenciales-modal-title">Verificación de Seguridad</h2>
          
          <div v-if="otpStep === 'request'" class="credenciales-modal-step">
            <p class="credenciales-otp-description">
              <i class="fas fa-shield-alt"></i>
              Para acceder a tus credenciales almacenadas, necesitamos verificar tu identidad.
            </p>
            <p class="credenciales-otp-info">
              Se enviará un código de verificación a tu correo electrónico registrado.
            </p>
            <div class="credenciales-modal-actions">
              <button 
                @click="requestOTP" 
                class="credenciales-modal-btn credenciales-modal-confirm"
                :disabled="isRequestingOTP"
              >
                <span v-if="!isRequestingOTP">
                  <i class="fas fa-envelope"></i> Enviar Código
                </span>
                <span v-else>
                  <i class="fas fa-spinner fa-spin"></i> Enviando...
                </span>
              </button>
              <button @click="closeOTPModal" class="credenciales-modal-btn credenciales-modal-cancel">
                Cancelar
              </button>
            </div>
          </div>

          <div v-else-if="otpStep === 'verify'" class="credenciales-modal-step">
            <p class="credenciales-otp-description">
              <i class="fas fa-key"></i>
              Ingresa el código de 6 dígitos que hemos enviado a tu correo electrónico.
            </p>
            <div class="credenciales-input-group">
              <label for="otpCode" class="credenciales-input-label">
                <i class="fas fa-lock credenciales-icon"></i>
                <span>Código de Verificación</span>
              </label>
              <input
                v-model="otpCode"
                type="text"
                id="otpCode"
                class="credenciales-auth-input credenciales-otp-input"
                placeholder="123456"
                maxlength="6"
                @input="otpCode = otpCode.replace(/[^0-9]/g, '')"
                required
              >
            </div>
            <div class="credenciales-modal-actions">
              <button 
                @click="verifyOTP" 
                class="credenciales-modal-btn credenciales-modal-confirm"
                :disabled="isVerifyingOTP || otpCode.length !== 6"
              >
                <span v-if="!isVerifyingOTP">
                  <i class="fas fa-check"></i> Verificar
                </span>
                <span v-else>
                  <i class="fas fa-spinner fa-spin"></i> Verificando...
                </span>
              </button>
              <button @click="otpStep = 'request'" class="credenciales-modal-btn credenciales-modal-back">
                <i class="fas fa-arrow-left"></i> Volver
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
import sessionValidation from '../mixins/sessionValidation.js'

export default {
  name: 'CredencialesComponent',
  mixins: [navigationMixin, sessionValidation],
  components: {
    NavigationBar
  },
  data() {
    return {
      descripcion: '',
      credencial: '',
      credenciales: [],
      visibleCredentials: {}, // Controla qué credenciales están visibles
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
      successMessage: '¡Credencial guardada con éxito!', // Mensaje dinámico
      // Modal OTP
      showOTPModal: false,
      otpStep: 'request', // 'request' o 'verify'
      otpCode: '',
      isRequestingOTP: false,
      isVerifyingOTP: false,
      pendingAction: null, // Guarda la acción que se ejecutará después de la verificación OTP
      pendingActionData: null // Datos adicionales para la acción pendiente
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
        if (error.response && error.response.status === 403 && error.response.data.requires_otp) {
          // El backend requiere verificación OTP
          this.pendingAction = 'fetchCredenciales'
          this.showOTPModal = true
          this.otpStep = 'request'
        } else {
          console.error('Error al obtener credenciales:', error)
          this.$swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las credenciales'
          })
        }
      }
    },

    // Método específico para cargar credenciales después de OTP exitoso
    async loadCredentialsAfterOTP() {
      try {
        console.log('Cargando credenciales después de verificación OTP exitosa...')
        const response = await axios.get('/credenciales', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        this.credenciales = response.data
        console.log('Credenciales cargadas exitosamente:', this.credenciales.length, 'elementos')
        
        // Forzar actualización de la vista
        this.$forceUpdate()
      } catch (error) {
        console.error('Error al cargar credenciales después de OTP:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las credenciales después de la verificación'
        })
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
        if (error.response && error.response.status === 403 && error.response.data.requires_otp) {
          this.pendingAction = 'saveCredencial'
          this.showOTPModal = true
          this.otpStep = 'request'
        } else {
          console.error('Error al guardar credencial:', error);
        }
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
        if (error.response && error.response.status === 403 && error.response.data.requires_otp) {
          this.pendingAction = 'deleteCredencial'
          this.pendingActionData = id
          this.showOTPModal = true
          this.otpStep = 'request'
        } else {
          console.error('Error al eliminar credencial:', error)
        }
      }
    },
    confirmDeleteCredencial(id) {
      if (confirm("¿Estás seguro que deseas eliminar esta credencial?")) {
        this.deleteCredencial(id)
      }
    },
    formatCredencial(credencial, credencialId) {
      if (!credencial) return '';
      
      // Si está marcada como visible, mostrar contenido real
      if (this.visibleCredentials[credencialId]) {
        return credencial.replace(/\n/g, '<br>');
      }
      
      // Por defecto, mostrar máscara
      return '<span style="color: #333; font-weight: bold;">***</span>';
    },
    toggleVisibility(credencialId) {
      console.log('Toggle clicked for credential:', credencialId);
      // Vue 3 - Crear nuevo objeto para forzar reactividad
      const currentState = this.visibleCredentials[credencialId] || false;
      this.visibleCredentials = {
        ...this.visibleCredentials,
        [credencialId]: !currentState
      };
      console.log('New visibility state:', this.visibleCredentials[credencialId]);
    },
    isVisible(credencialId) {
      return this.visibleCredentials[credencialId] || false;
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
        if (error.response && error.response.status === 403 && error.response.data.requires_otp) {
          this.pendingAction = 'saveEditedCredential'
          this.showOTPModal = true
          this.otpStep = 'request'
        } else {
          console.error('Error al actualizar credencial:', error);
          alert('Error al actualizar credencial');
          this.isSaving = false;
        }
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
    },
    
    // Métodos OTP
    async requestOTP() {
      this.isRequestingOTP = true
      try {
        const response = await axios.post('/credentials/request-otp', {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.data.success) {
          this.otpStep = 'verify'
          this.otpCode = ''
          this.$swal.fire({
            icon: 'success',
            title: 'Código Enviado',
            text: 'Revisa tu correo electrónico',
            timer: 2000,
            showConfirmButton: false
          })
        }
      } catch (error) {
        console.error('Error al solicitar OTP:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo enviar el código de verificación'
        })
      } finally {
        this.isRequestingOTP = false
      }
    },
    
    async verifyOTP() {
      this.isVerifyingOTP = true
      try {
        const response = await axios.post('/credentials/verify-otp', {
          otp: this.otpCode
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.data.success) {
          // Primero ejecutar la acción pendiente
          if (this.pendingAction) {
            await this.executePendingAction()
          }
          
          // Cerrar el modal con un pequeño delay para asegurar que se procese todo
          setTimeout(() => {
            this.closeOTPModal()
          }, 100)
          
          // Mostrar notificación de éxito
          this.$swal.fire({
            icon: 'success',
            title: 'Verificación Exitosa',
            text: 'Acceso concedido por 10 minutos',
            timer: 1500,
            showConfirmButton: false
          })
        }
      } catch (error) {
        console.error('Error al verificar OTP:', error)
        const message = error.response?.data?.message || 'Código inválido o expirado'
        this.$swal.fire({
          icon: 'error',
          title: 'Error de Verificación',
          text: message
        })
        this.otpCode = '' // Limpiar código incorrecto
      } finally {
        this.isVerifyingOTP = false
      }
    },
    
    async executePendingAction() {
      switch (this.pendingAction) {
        case 'fetchCredenciales':
          await this.loadCredentialsAfterOTP()
          break
        case 'saveCredencial':
          await this.saveCredencial()
          break
        case 'saveEditedCredential':
          await this.saveEditedCredential()
          break
        case 'deleteCredencial':
          if (this.pendingActionData) {
            await this.deleteCredencial(this.pendingActionData)
          }
          break
        default:
          console.warn('Acción pendiente no reconocida:', this.pendingAction)
      }
      this.pendingAction = null
      this.pendingActionData = null
    },
    
    closeOTPModal() {
      this.showOTPModal = false
      this.otpStep = 'request'
      this.otpCode = ''
      this.isRequestingOTP = false
      this.isVerifyingOTP = false
      this.pendingAction = null
      this.pendingActionData = null
    }
  }
}
</script>

<style scoped>
@import './CredencialesComponent.css';

.credenciales-edit-btn {
  background: transparent;
  border: none;
  color: #666;
  padding: 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.credenciales-edit-btn:hover {
  background: rgba(102, 102, 102, 0.2);
  color: #333;
}

.credenciales-delete-btn {
  background: transparent;
  border: none;
  color: #ff4d4d;
  padding: 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.credenciales-delete-btn:hover {
  background: rgba(255, 77, 77, 0.2);
  color: #ff0000;
}

.credenciales-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.credenciales-buttons-group {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.credenciales-content-wrapper {
  margin-top: 0.5rem;
}

.credenciales-item-content {
  margin: 0;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #333;
  line-height: 1.4;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  min-height: 20px;
}

.credenciales-eye-btn {
  background: transparent;
  border: none;
  color: var(--primary-gold);
  padding: 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.credenciales-eye-btn:hover {
  background: rgba(226, 201, 133, 0.2);
  color: #fff;
  transform: scale(1.1);
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

/* Estilos específicos para el modal OTP */
.credenciales-otp-description {
  text-align: center;
  color: #495057;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.credenciales-otp-description i {
  margin-right: 0.5rem;
  color: #007bff;
}

.credenciales-otp-info {
  text-align: center;
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.credenciales-otp-input {
  text-align: center !important;
  font-size: 1.5rem !important;
  letter-spacing: 0.5rem !important;
  font-weight: bold !important;
}

.credenciales-modal-confirm {
  background: var(--primary-blue) !important;
  color: white !important;
  border: none !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.credenciales-modal-confirm:hover:not(:disabled) {
  background: #2D4A5E !important;
  transform: translateY(-2px) !important;
}

.credenciales-modal-confirm:disabled {
  background: #6c757d !important;
  cursor: not-allowed !important;
  transform: none !important;
}

.credenciales-modal-cancel {
  background: #6c757d !important;
  color: white !important;
  border: none !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.credenciales-modal-cancel:hover {
  background: #545b62 !important;
  transform: translateY(-2px) !important;
}

.credenciales-modal-back {
  background: var(--secondary-blue) !important;
  color: white !important;
  border: none !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.credenciales-modal-back:hover {
  background: #3a5f76 !important;
  transform: translateY(-2px) !important;
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
