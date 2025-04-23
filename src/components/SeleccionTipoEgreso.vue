<template>
    <div class="seleccion-tipo-container">
      <div class="egresos-back-btn-container">
        <button class="egresos-back-btn" @click="$router.go(-1)">
          <i class="fas fa-chevron-left"></i>
        </button>
      </div>
  
      <div class="seleccion-tipo-content">
        <h1 class="seleccion-tipo-title">
          <span class="egresos-brand-text">CONTABILÍZATE</span>
          <p class="egresos-subtitle">Seleccionar tipo de egreso</p>
        </h1>
  
        <div class="seleccion-tipo-cards">
          <div 
            class="seleccion-tipo-card seleccion-tipo-debito"
            @click="$router.push('/egresos/debito')"
          >
            <div class="card-content">
              <i class="fas fa-credit-card"></i>
              <h3>Débito o Efectivo</h3>
              <p>Registro de egresos con tarjeta de débito o en efectivo</p>
            </div>
          </div>
  
          <div class="seleccion-tipo-card seleccion-tipo-credito disabled">
            <div class="card-content">
              <i class="fas fa-credit-card"></i>
              <h3>Crédito</h3>
              <p class="coming-soon">Próximamente</p>
            </div>
            <div class="disabled-overlay">
              <i class="fas fa-lock"></i>
              <span>En desarrollo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SeleccionTipoEgreso',
    mounted() {
      document.documentElement.style.setProperty('--primary-blue', '#1A2B3C');
      document.documentElement.style.setProperty('--secondary-blue', '#2D4A5E');
      document.documentElement.style.setProperty('--accent-gold', '#FFD700');
      document.documentElement.style.setProperty('--text-white', '#FFFFFF');
    }
  }
  </script>
  
  <style>
  @import './SeleccionTipoEgreso.css';
  </style>