<template>
  <div class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Registrar Tarjetas de Crédito</h3>
        <button class="close-btn" @click="$emit('close'); $router.push('/egresos-tipo')">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="addTarjeta">
          <div class="form-group">
            <label for="nombre">Nombre de la Tarjeta</label>
            <select v-model="nuevaTarjeta.nombre" id="nombre" @change="handleTarjetaChange" required>
              <option value="">Seleccione una tarjeta</option>
              <option v-for="tarjeta in tarjetasPredefinidas" :key="tarjeta" :value="tarjeta">{{ tarjeta }}</option>
            </select>
            <input
              v-if="nuevaTarjeta.nombre === 'Otra tarjeta'"
              v-model="nuevaTarjeta.nombrePersonalizado"
              id="nombrePersonalizado"
              type="text"
              placeholder="Ingrese el nombre de la tarjeta"
              required
            />
          </div>
          <div class="form-group">
            <label for="fechaCorte">Fecha de Corte</label>
            <input v-model="nuevaTarjeta.fechaCorte" id="fechaCorte" type="date" required />
          </div>
          <div class="form-group">
            <label for="fechaPago">Fecha de Pago</label>
            <input v-model="nuevaTarjeta.fechaPago" id="fechaPago" type="date" required />
          </div>
          <button type="submit" class="submit-btn">Agregar Tarjeta</button>
        </form>
        <ul class="tarjetas-list">
          <li v-for="tarjeta in tarjetas" :key="tarjeta.id">
            {{ tarjeta.nombre }} - Corte: {{ tarjeta.fechaCorte }} - Pago: {{ tarjeta.fechaPago }}
          </li>
        </ul>
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
        const tarjetaFinal = this.nuevaTarjeta.nombre === 'Otra tarjeta' ? this.nuevaTarjeta.nombrePersonalizado : this.nuevaTarjeta.nombre;
        const response = await axios.post('/tarjetas_credito', {
          nombre: tarjetaFinal,
          fechaCorte: this.nuevaTarjeta.fechaCorte,
          fechaPago: this.nuevaTarjeta.fechaPago
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.tarjetas.push(response.data);
        this.nuevaTarjeta = { nombre: '', nombrePersonalizado: '', fechaCorte: '', fechaPago: '' };
      } catch (error) {
        console.error('Error al agregar tarjeta:', error);
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