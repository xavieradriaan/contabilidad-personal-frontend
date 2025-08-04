<template>
  <div class="egresos-container" :class="{ 'egresos-disabled': isCredito }">
    <TarjetasCreditoModal v-if="showTarjetasModal" @close="showTarjetasModal = false" />
    
    <div class="egresos-animated-coins">
      <div v-for="index in 25" :key="index" class="egresos-coin" :class="`egresos-coin-${index}`">
        <img src="/monedas.png" alt="Moneda animada" class="egresos-coin-img">
      </div>
    </div>

    <button class="egresos-back-btn" @click="safeGoBack('/dashboard')">
      <i class="fas fa-chevron-left"></i>
    </button>

    <main class="egresos-main-content">
      <h1 class="egresos-title">
        <span class="egresos-brand-text">CONTABILÍZATE</span>
        <p class="egresos-subtitle">Registro de Egresos</p>
      </h1>

      <div class="egresos-auth-card">
        <form @submit.prevent="addEgreso" class="egresos-auth-form">
          <div class="egresos-input-group">
            <label for="fecha" class="egresos-input-label">
              <i class="fas fa-calendar-alt egresos-icon"></i>
              <span>Fecha</span>
            </label>
            <input
              v-model="nuevoEgreso.fecha"
              id="fecha"
              type="date"
              class="egresos-auth-input"
              required
            >
          </div>

          <div class="egresos-input-group">
            <label for="categoria" class="egresos-input-label">
              <i class="fas fa-tags egresos-icon"></i>
              <span>Categoría</span>
            </label>
            <select
              v-model="nuevoEgreso.categoria"
              id="categoria"
              class="egresos-auth-input"
              @change="handleCategoriaChange"
              required
            >
              <option v-for="categoria in filteredCategorias" :key="categoria" :value="categoria">{{ categoria }}</option>
            </select>
          </div>

          <div v-if="nuevoEgreso.categoria === 'Pago de tarjetas'" class="egresos-input-group">
            <label for="tarjeta" class="egresos-input-label">
              <i class="fas fa-credit-card egresos-icon"></i>
              <span>Tarjeta de Crédito</span>
            </label>
            <select
              v-model="nuevoEgreso.tarjeta"
              id="tarjeta"
              class="egresos-auth-input"
              @change="handleTarjetaChange"
              required
            >
              <option value="">Seleccione una tarjeta</option>
              <option v-for="tarjeta in tarjetas" :key="tarjeta.id" :value="tarjeta.tarjeta_nombre">
                {{ tarjeta.tarjeta_nombre }} - Saldo pendiente: ${{ formatCurrency(tarjeta.monto) }}
              </option>
            </select>
          </div>

          <div class="egresos-input-group">
            <label for="subcategoria" class="egresos-input-label">
              <i class="fas fa-comment-dots egresos-icon"></i>
              <span>Descripción (Opcional)</span>
            </label>
            <input
              v-model="nuevoEgreso.subcategoria"
              id="subcategoria"
              class="egresos-auth-input"
              placeholder="Descripción"
              maxlength="60"
            >
          </div>

          <div class="egresos-input-group">
            <label for="monto" class="egresos-input-label">
              <i class="fas fa-coins egresos-icon"></i>
              <span>Valor</span>
            </label>
            <input
              v-model="nuevoEgreso.monto"
              id="monto"
              type="text"
              class="egresos-auth-input"
              inputmode="decimal"
              @input="validateMonto"
              :placeholder="nuevoEgreso.categoria === 'Pago de tarjetas' && tarjetaSeleccionada ? `Pago sugerido $${formatCurrency(tarjetaSeleccionada.monto)}` : 'Ej: 217,50'"
              required
            >
          </div>

          <div v-if="!isCredito" class="egresos-input-group">
            <label for="bancos" class="egresos-input-label">
              <i class="fas fa-credit-card egresos-icon"></i>
              <span>Banco (opcional)</span>
            </label>
            <select
              v-model="nuevoEgreso.bancos"
              id="bancos"
              class="egresos-auth-input"
            >
              <option value="">Seleccione un banco</option>
              <option v-for="banco in bancos" :key="banco" :value="banco">{{ banco }}</option>
            </select>
          </div>
          
          <div v-else class="egresos-input-group">
            <label for="tarjeta" class="egresos-input-label">
              <i class="fas fa-credit-card egresos-icon"></i>
              <span>Tarjeta de Crédito</span>
            </label>
            <select
              v-model="nuevoEgreso.tarjeta"
              id="tarjeta"
              class="egresos-auth-input"
              required
            >
              <option value="">Seleccione una tarjeta</option>
              <option v-for="tarjeta in tarjetas" :key="tarjeta.tarjeta_nombre" :value="tarjeta.tarjeta_nombre">
                {{ tarjeta.tarjeta_nombre }}
              </option>
            </select>
          </div>

          <button
            type="submit"
            class="egresos-auth-btn egresos-submit-btn"
            :disabled="isSubmitting || !isFormValid"
            :class="{'egresos-loading': isSubmitting}"
          >
            <span v-if="!isSubmitting">Agregar Egreso</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
        </form>
      </div>
    </main>

    <!-- Modal actualizado con estilo de Login -->
    <div v-if="showModal" class="login-modal-overlay">
      <div class="login-animated-coins">
        <div v-for="index in 25" :key="index" class="login-coin" :class="`login-coin-${index}`">
          <img src="/monedas.png" alt="Moneda animada" class="login-coin-img">
        </div>
      </div>

      <!-- Cambia el @click para redirigir a /egresos-tipo -->
      <button class="login-back-btn" @click="$router.push('/egresos-tipo')">
        <i class="fas fa-chevron-left"></i>
      </button>

      <div class="login-auth-card">
        <div class="login-auth-content">
          <h1 class="login-auth-title">
            <span class="login-brand-text">CONTABILÍZATE</span>
            <p class="login-auth-subtitle">Seleccionar Pagos Recurrentes</p>
          </h1>

          <form @submit.prevent="savePagosRecurrentes" class="login-auth-form">
            <div class="login-categories-container">
              <div class="login-input-group" v-for="categoria in categorias" :key="categoria">
                <label class="login-check-label">
                  <input
                    type="checkbox"
                    :value="categoria"
                    v-model="selectedCategorias"
                    class="login-check-input"
                  >
                  <i class="fas fa-calendar-check login-icon"></i>
                  {{ categoria }}
                </label>
              </div>
            </div>

            <div class="login-button-container">
              <button
                type="submit"
                class="login-auth-btn login-login-btn"
                :class="{'login-loading': isSubmitting}"
              >
                <span v-if="!isSubmitting">Guardar Selección</span>
                <i v-else class="fas fa-spinner fa-spin"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import TarjetasCreditoModal from './TarjetasCreditoModal.vue';
import navigationMixin from '../mixins/navigationMixin.js';
import sessionValidation from '../mixins/sessionValidation.js';

export default {
  name: 'EgresosComponent',
  mixins: [navigationMixin, sessionValidation],
  components: {
    TarjetasCreditoModal
  },
  props: {
    tipo: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isCredito: this.tipo === 'credito',
      nuevoEgreso: {
        categoria: '',
        subcategoria: '',
        monto: '',
        fecha: '',
        tarjeta: '',
        bancos: ''
      },
      categorias: [
        'Teléfono Móvil', 'Claude Code', 'Mami', 'Comida', 'Movilización Trabajo',
        'Spotify', 'Maestría', 'Ropa', 'Zapatos', 'Tecnología', 'Restaurantes',
        'Salud', 'Cursos Online', 'Gastos Hijos', 'Videojuegos', 'Netflix',
        'Amazon Prime', 'Alquiler', 'Transporte', 'Entretenimiento', 'Manutención',
        'Otros (Gastos Varios)', 'PayPal', 'Luz', 'Agua', 'Teléfono Fijo',
        'Préstamos', 'Seguros', 'Automóvil', 'Railway'
      ],
      categoriaTarjeta: 'Pago de tarjetas',
      tarjetas: [], // Lista de tarjetas de crédito
      bancos: ['Banco Pichincha', 'Banco de Guayaquil', 'Banco del Pacífico', 'Produbanco', 'Banco Internacional'], // Lista de bancos
      showModal: false,
      showTarjetasModal: false,
      selectedCategorias: [],
      isSubmitting: false,
      tarjetaSeleccionada: null, // Store the selected tarjeta details
    };
  },
  async created() {
    // Only check recurring payments if it's debit
    if (!this.isCredito) {
      await this.checkFirstTime();
    }

    try {
      console.log('EgresosComponent created hook called. isCredito:', this.isCredito);

      if (this.isCredito) {
        console.log('Fetching tarjetas de crédito...');

        const response = await axios.get('/tarjetas_credito', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          params: {
            include_paid: true
          }
        });

        console.log('Response from /tarjetas_credito:', response.data);

        this.tarjetas = Array.isArray(response.data) ? response.data : [];

        if (this.tarjetas.length === 0) {
          console.log('No tarjetas found. Showing welcome modal.');

          await Swal.fire({
            icon: 'info',
            title: '¡Bienvenido!',
            text: 'Parece que es tu primera vez aquí. Por favor, registra las fechas de corte de tus tarjetas de crédito.',
            showCancelButton: true,
            confirmButtonText: 'Sí, deseo ingresar una tarjeta',
            cancelButtonText: 'No, gracias',
            customClass: {
              confirmButton: 'tarjetas-modal-btn tarjetas-modal-btn-primary', // Matches "Agregar Tarjeta"
              cancelButton: 'tarjetas-modal-btn tarjetas-modal-btn-secondary' // Matches "Cerrar"
            },
            buttonsStyling: false // Disable default SweetAlert2 button styles
          }).then((result) => {
            if (result.isConfirmed) {
              this.showTarjetasModal = true;
            } else {
              console.log('El usuario decidió no registrar tarjetas de crédito.');
              this.$router.push('/egresos-tipo');
            }
          });
        }
      }
    } catch (error) {
      console.error('Error al obtener tarjetas de crédito:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al verificar tus tarjetas de crédito. Por favor, intenta nuevamente.',
        showConfirmButton: true
      });
    }
  },
  computed: {
    filteredCategorias() {
      const baseCategories = [...this.categorias];
      if (!this.isCredito) {
        baseCategories.push(this.categoriaTarjeta);
      }
      return baseCategories;
    },
    isFormValid() {
      return this.nuevoEgreso.categoria && 
             this.nuevoEgreso.monto && 
             this.nuevoEgreso.fecha && 
             parseFloat(this.nuevoEgreso.monto) > 0;
    }
  },
  methods: {
    async checkFirstTime() {
      try {
          const response = await axios.get('/check_pagos_recurrentes', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (!response.data.tiene_pagos_recurrentes) {
              this.showModal = true;
          }
      } catch (error) {
          console.error('Error verificando pagos recurrentes:', error);
          Swal.fire('Error', 'No se pudo verificar la configuración de pagos recurrentes', 'error');
      }
    },
    validateMonto(event) {
      let value = event.target.value.replace(/,/g, '.')
      value = value.replace(/[^0-9.]/g, '')
      const parts = value.split('.')
      if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('')
      if (parts[1] && parts[1].length > 2) value = parts[0] + '.' + parts[1].slice(0, 2)
      if (parts[0].length > 7) value = parts[0].slice(0, 7) + (parts[1] ? '.' + parts[1] : '')
      
      if (value.startsWith('0') || parseFloat(value) <= 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se puede ingresar 0 ni valores negativos.',
          showConfirmButton: true
        })
        value = ''
      }
      this.nuevoEgreso.monto = value
    },
    async savePagosRecurrentes() {
      try {
        await axios.post('/pagos_recurrentes', 
          { categorias: this.selectedCategorias },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        )
        this.showModal = false
        Swal.fire({
          icon: 'success',
          title: 'Pagos Recurrentes Guardados',
          text: 'Configuración guardada correctamente',
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            popup: 'egresos-success-popup',
            title: 'egresos-success-title',
            htmlContainer: 'egresos-success-content'
          }
        }).then(() => {
          this.$router.push({ 
              path: '/egresos/debito'
          });
        })
      } catch (error) {
        console.error('Error al guardar pagos recurrentes:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al guardar la configuración',
          showConfirmButton: true
        })
      }
    },
    closeModal() {
      this.showModal = false
    },
    async handleCategoriaChange() {
      if (this.nuevoEgreso.categoria === 'Pago de tarjetas') {
        try {
          const response = await axios.get('/tarjetas_credito', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            params: {
              include_paid: true // Agregar este parámetro
            }
          });
          this.tarjetas = response.data;
        } catch (error) {
          console.error('Error al cargar tarjetas de crédito:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las tarjetas de crédito. Por favor, intenta nuevamente.',
          });
        }
      } else {
        this.nuevoEgreso.tarjeta = '';
        this.tarjetaSeleccionada = null;
      }
    },
    handleTarjetaChange() {
      this.tarjetaSeleccionada = this.tarjetas.find(
        (tarjeta) => tarjeta.tarjeta_nombre === this.nuevoEgreso.tarjeta
      );
      this.$forceUpdate(); // Forzar actualización del template
    },
    async addEgreso() {
      this.isSubmitting = true;
      try {
        const tipoEgreso = this.isCredito ? 'credito' : 'debito';

        const payload = {
          categoria: this.nuevoEgreso.categoria,
          subcategoria: this.nuevoEgreso.subcategoria,
          monto: this.nuevoEgreso.monto,
          fecha: this.nuevoEgreso.fecha,
          tipo_egreso: tipoEgreso,
          // Add these fields
          tarjeta: this.nuevoEgreso.tarjeta,
          bancos: this.nuevoEgreso.categoria === 'Pago de tarjetas' 
                  ? this.nuevoEgreso.tarjeta 
                  : this.nuevoEgreso.bancos
        };

        await axios.post('/egresos', payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        // Reset form and show success message
        this.nuevoEgreso = { categoria: '', subcategoria: '', monto: '', fecha: '', tarjeta: '', bancos: '' };
        await Swal.fire({
          icon: 'success',
          title: 'Egreso Registrado!',
          text: 'El egreso se ha registrado correctamente',
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            popup: 'egresos-success-popup',
            title: 'egresos-success-title',
            htmlContainer: 'egresos-success-content'
          }
        });
      } catch (error) {
        console.error('Error al registrar egreso:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al registrar el egreso',
          showConfirmButton: true
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    formatCurrency(value) {
      return parseFloat(value).toFixed(2);
    }
  }
};
</script>

<style>
@import './EgresosComponent.css';

.egresos-disabled {
  position: relative;
}
</style>