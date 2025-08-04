<template>
  <div class="home-container">
    <div class="home-animated-coins">
      <div v-for="index in 15" :key="index" class="home-coin" :class="`home-coin-${index}`">
        <img 
          src="/monedas.png" 
          alt="Moneda animada"
          class="home-coin-img"
        >
      </div>
    </div>
    
    <main class="home-main-content">
      <div class="home-hero-section">
        <div class="home-header-container">
          <div class="home-logo-wrapper">
            <div class="home-coin-single">
              <img 
                src="/monedas.png" 
                class="home-main-coin" 
                alt="Moneda principal"
              >
            </div>
          </div>
          <h1 class="home-hero-title">
            <span class="home-brand-text">CONTABILÍZATE</span>
            <p class="home-hero-subtitle">Gestión Financiera Inteligente</p>
          </h1>
        </div>
      </div>

      <div class="home-auth-section">
        <div class="home-auth-card">
          <div class="home-auth-buttons">
            <router-link 
              to="/login" 
              class="home-auth-btn home-login-btn"
              aria-label="Iniciar sesión"
            >
              <i class="fas fa-sign-in-alt home-auth-icon"></i>
              <span>Iniciar Sesión</span>
            </router-link>
            
            <router-link 
              to="/register" 
              class="home-auth-btn home-register-btn"
              aria-label="Registrarse"
            >
              <i class="fas fa-user-plus home-auth-icon"></i>
              <span>Registrarse</span>
            </router-link>
          </div>

          <div class="home-divider">
            <div class="home-divider-line"></div>
            <div class="home-divider-circle">
              <span class="home-divider-text">o</span>
            </div>
            <div class="home-divider-line"></div>
          </div>

          <div class="home-additional-links">
            <router-link 
              to="/password_reset" 
              class="home-password-reset-link"
              aria-label="Recuperar acceso"
            >
              <i class="fas fa-question-circle"></i>
              Recuperar Contraseña
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import sessionValidation from '@/mixins/sessionValidation.js';

export default {
  name: 'HomeComponent',
  mixins: [sessionValidation]
}
</script>

<style scoped>
@import './HomeComponent.css';

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%; /* Ensure the body fills the viewport */
  overflow-y: auto; /* Allow vertical scrolling */
}

#app {
  height: 100%; /* Ensure the app container fills the viewport */
}

.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Changed from center to flex-start */
  min-height: 100%; /* Ensure it fills the viewport */
  text-align: center;
  overflow: hidden; /* Prevent extra scrolling */
  /* Removed margin-top and padding-top */
}

.home-main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1; /* Occupy all available space */
  margin-top: 0; /* Removed negative margin */
}

.home-auth-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
