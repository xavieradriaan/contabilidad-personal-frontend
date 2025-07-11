
<template>
  <div class="tarjetas-modal-overlay">
    <div class="tarjetas-modal-card">
      <div class="tarjetas-modal-header">
        <h3 class="tarjetas-modal-title">Gestión de Tarjetas</h3>
        <button class="tarjetas-modal-close" @click="$router.push('/egresos-tipo')">
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
              v-for="(tarjeta, index) in filteredPredefinidas" 
              :key="index" 
              :value="tarjeta"
              :disabled="tarjeta === 'Otra tarjeta' ? false : isTarjetaExistente(tarjeta)"
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
          
          <!-- Fechas en línea horizontal -->
          <div class="fechas-row">
            <div class="fecha-field-group">
              <label class="fecha-label">Fecha de Corte</label>
              <input
                type="date"
                v-model="nuevaTarjeta.fechaCorte"
                class="tarjeta-input"
              />
            </div>
            
            <div class="fecha-field-group">
              <label class="fecha-label">Fecha Máximo de Pago</label>
              <input
                type="date"
                v-model="nuevaTarjeta.fechaPago"
                class="tarjeta-input"
              />
            </div>
          </div>
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
          <button class="btn-eliminar" @click="eliminarTarjeta(tarjeta.id)">
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
          @click="$router.push('/egresos-tipo')"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

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
        'Pacificard', 'Bankard', 'American Express', 'Diners Club', 'Titanium', 'Discover','Produbanco','Visa','Mastercard','American Express','Otra tarjeta'
      ],
      tarjetas: []
    };
  },
  computed: {
    filteredPredefinidas() {
      return this.tarjetasPredefinidas.filter(tarjeta => 
        !this.tarjetas.some(t => t.tarjeta_nombre === tarjeta) || 
        tarjeta === 'Otra tarjeta'
      );
    }
  },
  methods: {
    isTarjetaExistente(nombreTarjeta) {
      return this.tarjetas.some(t => t.tarjeta_nombre === nombreTarjeta);
    },
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

        // Mostrar mensaje de éxito con duración garantizada
        await Swal.fire({
          icon: 'success',
          title: 'Tarjeta Registrada!',
          text: 'Se han guardado con éxito las tarjetas de crédito',
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
          timer: 1500,
          timerProgressBar: false,
          customClass: {
            popup: 'tarjetas-success-popup',
            title: 'tarjetas-success-title',
            htmlContainer: 'tarjetas-success-content'
          }
        });

      } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        alert(`Error al agregar: ${error.response?.data?.message || 'Verifique los datos'}`);
      }
    },
    async eliminarTarjeta(tarjetaId) {
      try {
        // Mostrar confirmación antes de eliminar
        const result = await Swal.fire({
          title: '¿Estás seguro?',
          text: 'Esta acción no se puede deshacer',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d'
        });

        if (!result.isConfirmed) {
          return;
        }

        // Realizar la eliminación
        await axios.delete(`/tarjetas_credito/${tarjetaId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        // Actualizar la lista local
        this.tarjetas = this.tarjetas.filter(tarjeta => tarjeta.id !== tarjetaId);

        // Mostrar mensaje de éxito
        await Swal.fire({
          icon: 'success',
          title: 'Tarjeta eliminada',
          text: 'La tarjeta se eliminó correctamente',
          showConfirmButton: false,
          timer: 1500
        });

      } catch (error) {
        console.error('Error al eliminar tarjeta:', error);
        
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo eliminar la tarjeta',
          showConfirmButton: true
        });
      }
    },
    async fetchTarjetas() {
      try {
        const response = await axios.get('/api/tarjetas_con_ciclo', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.tarjetas = response.data.tarjetas.map(item => item.tarjeta);
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