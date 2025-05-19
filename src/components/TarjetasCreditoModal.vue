<template>
  <div class="tarjetas-modal-overlay">
    <div class="tarjetas-modal-card">
      <div class="tarjetas-modal-header">
        <h3 class="tarjetas-modal-title">Gestión de Tarjetas</h3>
        <button class="tarjetas-modal-close" @click="$emit('close')">
          <!-- Removed the "X" icon -->
        </button>
      </div>
      
      <div class="tarjetas-modal-body">
        <!-- Formulario para nueva tarjeta -->
        <div class="nueva-tarjeta-form">
          <select 
            v-model="nuevaTarjeta.nombre" 
            class="tarjeta-select"
            @change="handleTarjetaChange"
          >
            <option value="">Seleccione tipo</option>
            <option 
              v-for="(tarjeta, index) in tarjetasPredefinidas" 
              :key="index" 
              :value="tarjeta"
            >
              {{ tarjeta }}
            </option>
          </select>
          
          <input 
            v-if="nuevaTarjeta.nombre === 'Otra tarjeta'"
            v-model="nuevaTarjeta.nombrePersonalizado"
            placeholder="Nombre personalizado"
            class="tarjeta-input"
          />
          
          <input
            type="date"
            v-model="nuevaTarjeta.fechaCorte"
            class="tarjeta-input"
            placeholder="Fecha de corte"
          />
          
          <input
            type="date"
            v-model="nuevaTarjeta.fechaPago"
            class="tarjeta-input"
            placeholder="Fecha máximo pago"
          />
        </div>

        <!-- Listado de tarjetas existentes -->
        <div class="tarjeta-item" v-for="(tarjeta, index) in tarjetas" :key="index">
          <div class="tarjeta-info">
            <span class="tarjeta-nombre">{{ tarjeta.tarjeta_nombre }}</span>
            <div class="fechas-container">
              <span class="fecha-item">Corte: {{ tarjeta.fecha_corte }}</span>
              <span class="fecha-item">Fecha Máximo Pago: {{ tarjeta.fecha_pago }}</span>
            </div>
          </div>
          <button class="btn-eliminar">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>

      <!-- Botones de acciones -->
      <div class="tarjetas-modal-actions">
        <button 
          class="tarjetas-modal-btn tarjetas-modal-btn-primary"
          @click="addTarjeta"
        >
          <i class="fas fa-plus-circle"></i>
          Agregar Tarjeta
        </button>
        <button 
          class="tarjetas-modal-btn tarjetas-modal-btn-secondary"
          @click="$emit('close')"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'TarjetasCreditoModal',
  data() {
    return {
      nuevaTarjeta: {
        nombre: '',
        nombrePersonalizado: '',
        fechaCorte: '',
        fechaPago: ''
      },
      tarjetasPredefinidas: [
        'Pacificard', 'Bankard', 'American Express', 'Diners Club', 'Titanium', 'Discover', 'Otra tarjeta'
      ],
      tarjetas: []
    };
  },
  methods: {
    handleTarjetaChange() {
      if (this.nuevaTarjeta.nombre !== 'Otra tarjeta') {
        this.nuevaTarjeta.nombrePersonalizado = '';
      }
    },
    async addTarjeta() {
      try {
        const tarjetaFinal = this.nuevaTarjeta.nombre === 'Otra tarjeta' 
          ? this.nuevaTarjeta.nombrePersonalizado 
          : this.nuevaTarjeta.nombre;

        // Validar campos requeridos
        if (!tarjetaFinal || !this.nuevaTarjeta.fechaCorte || !this.nuevaTarjeta.fechaPago) {
          alert('Todos los campos son obligatorios');
          return;
        }

        // Formatear fechas a ISO (YYYY-MM-DD)
        const formatDate = (date) => {
          if (!date) return '';
          const [year, month, day] = date.split('-');
          return new Date(year, month - 1, day).toISOString().split('T')[0];
        };

        const payload = {
          nombre: tarjetaFinal, // Clave que espera el backend
          fechaCorte: formatDate(this.nuevaTarjeta.fechaCorte),
          fechaPago: formatDate(this.nuevaTarjeta.fechaPago)
        };

        const response = await axios.post('/tarjetas_credito', payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        // Actualizar lista local sin volver a cargar
        this.tarjetas = [...this.tarjetas, response.data];
        
        // Resetear formulario
        this.nuevaTarjeta = { 
          nombre: '', 
          nombrePersonalizado: '', 
          fechaCorte: '', 
          fechaPago: '' 
        };

      } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        alert(`Error al agregar: ${error.response?.data?.message || 'Verifique los datos'}`);
      }
    },
    async fetchTarjetas() {
      try {
        const response = await axios.get('/tarjetas_credito', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.tarjetas = response.data;
      } catch (error) {
        console.error('Error al obtener tarjetas:', error);
      }
    }
  },
  created() {
    this.fetchTarjetas();
  }
};
</script>

<style src="./TarjetasCreditoModal.css" scoped></style>