<template>
  <div class="egresos-container" :class="{ 'egresos-disabled': isCredito }">
    <TarjetasCreditoModal v-if="showTarjetasModal" @close="showTarjetasModal = false" />
    
    <div class="egresos-animated-coins">
      <div v-for="index in 25" :key="index" class="egresos-coin" :class="`egresos-coin-${index}`">
        <img src="/monedas.png" alt="Moneda animada" class="egresos-coin-img">
      </div>
    </div>

    <button class="egresos-back-btn" @click="$router.go(-1)">
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
              <option v-for="categoria in categorias" :key="categoria" :value="categoria">{{ categoria }}</option>
            </select>
          </div>

          <div v-if="nuevoEgreso.categoria === 'Pago de tarjetas'" class="egresos-input-group">
            <label for="tarjeta" class="egresos-input-label">
              <i class="fas fa-credit-card egresos-icon"></i>
              <span>Tarjetas de Crédito</span>
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
              <span>Subcategoría (opcional)</span>
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
              <span v-if="nuevoEgreso.categoria === 'Pago de tarjetas'">Tarjeta a Pagar</span>
              <span v-else>Banco (opcional)</span>
            </label>
            <select
              v-if="nuevoEgreso.categoria === 'Pago de tarjetas'"
              v-model="nuevoEgreso.tarjeta"
              id="tarjeta"
              class="egresos-auth-input"
              required
            >
              <option value="">Seleccione una tarjeta</option>
              <option 
                v-for="tarjeta in tarjetas" 
                :key="tarjeta.id" 
                :value="tarjeta.tarjeta_nombre"
              >
                {{ tarjeta.tarjeta_nombre }} - Saldo: ${{ formatCurrency(tarjeta.monto) }}
              </option>
            </select>
            <select
              v-else
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

    <!-- Modal actualizado -->
    <div v-if="showModal" class="egresos-modal-overlay">
      <div class="egresos-modal-card">
        <div class="egresos-modal-header">
          <h3 class="egresos-modal-title">Seleccionar Pagos Recurrentes</h3>
          <button class="egresos-modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="egresos-modal-body">
          <div v-for="categoria in categorias" :key="categoria" class="egresos-check-group">
            <input
              type="checkbox"
              :id="categoria"
              :value="categoria"
              v-model="selectedCategorias"
              class="egresos-check-input"
            >
            <label :for="categoria" class="egresos-check-label">
              {{ categoria }}
            </label>
          </div>
        </div>
        <div class="egresos-modal-footer">
          <button
            class="egresos-auth-btn egresos-modal-btn"
            @click="savePagosRecurrentes"
          >
            Guardar Selección
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import TarjetasCreditoModal from './TarjetasCreditoModal.vue';

export default {
  name: 'EgresosComponent',
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
      isCredito: this.tipo === 'credito', // Determinar si es crédito basado en el parámetro de la ruta
      nuevoEgreso: {
        categoria: '',
        subcategoria: '',
        monto: '',
        fecha: '',
        tarjeta: '',
        bancos: ''
      },
      categorias: [
        'Teléfono Móvil', 'GitHub', 'Mami', 'Comida', 'Movilización Trabajo',
        'Spotify', 'Maestría', 'Ropa', 'Zapatos', 'Tecnología', 'Restaurantes',
        'Salud', 'Cursos Online', 'Gastos Hijos', 'Videojuegos', 'Netflix',
        'Amazon Prime', 'Alquiler', 'Transporte', 'Entretenimiento', 'Manutención',
        'Otros (Gastos Varios)', 'PayPal', 'Luz', 'Agua', 'Teléfono Fijo',
        'Préstamos', 'Seguros', 'Automóvil', 'Railway', 'Pago de tarjetas' // Keep only this
      ],
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
          timer: 1500
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
        // Solo cargar tarjetas si aún no están cargadas
        if (this.tarjetas.length === 0) {
          try {
            const response = await axios.get('/tarjetas_credito', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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
        }
      } else {
        // Si se selecciona otra categoría, no borrar las tarjetas, solo limpiar la tarjeta seleccionada
        this.nuevoEgreso.tarjeta = '';
        this.tarjetaSeleccionada = null;
      }
    },
    handleTarjetaChange() {
      this.tarjetaSeleccionada = this.tarjetas.find(
        (tarjeta) => tarjeta.tarjeta_nombre === this.nuevoEgreso.tarjeta
      );
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
          timer: 1500
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