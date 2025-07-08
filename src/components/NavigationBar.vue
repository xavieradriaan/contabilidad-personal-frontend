<template>
  <div class="navigation-bar">
    <div class="buttons">
      <button v-if="showLogout" @click="emitLogoutClicked" class="nav-btn logout-btn">
        <i class="fas fa-sign-out-alt"></i>
        <span class="btn-text">Salir</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavigationBar',
  props: {
    showHome: {
      type: Boolean,
      default: false
    },
    showLogout: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    goHome() {
      this.$router.push('/');
    },
    emitLogoutClicked() {
      this.$emit('logout-clicked');
    }
  }
}
</script>

<style scoped>
.navigation-bar {
  position: absolute;
  top: 80px;
  right: 20px;
  z-index: 10000;
}

.buttons {
  display: flex;
  gap: 15px;
}

.nav-btn {
  background: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 30px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  padding: 0 20px;
}

.home-btn {
  background: linear-gradient(135deg, var(--primary-blue), #2c3e50);
}

.logout-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.25);
}

.nav-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.nav-btn i {
  font-size: 1.2rem;
  margin-right: 10px;
}

.btn-text {
  font-weight: 600;
  font-size: 1rem;
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .navigation-bar {
    top: 120px;
    right: 10px;
  }
  
  .nav-btn {
    height: 40px;
    padding: 0 15px;
  }
  
  .btn-text {
    font-size: 0.9rem;
  }
  
  .nav-btn i {
    font-size: 1rem;
    margin-right: 8px;
  }
}
</style>