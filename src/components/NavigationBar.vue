<template>
  <div class="navigation-bar">
    <!-- Desktop version -->
    <div class="buttons desktop-nav">
      <button v-if="showLogout" @click="emitLogoutClicked" class="nav-btn logout-btn">
        <i class="fas fa-sign-out-alt"></i>
        <span class="btn-text">Salir</span>
      </button>
    </div>
    
    <!-- Mobile compact version -->
    <div class="mobile-nav">
      <button v-if="showLogout" @click="emitLogoutClicked" class="nav-btn-compact logout-btn-compact" title="Cerrar Sesión">
        <i class="fas fa-sign-out-alt"></i>
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

/* Default: Desktop navigation styles */
.mobile-nav {
  display: none;
}

.desktop-nav {
  display: flex;
}

/* Ensure desktop version is shown on large screens */
@media (min-width: 769px) {
  .desktop-nav {
    display: flex !important;
  }
  
  .mobile-nav {
    display: none !important;
  }
}

.nav-btn-compact {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(231, 76, 60, 0.4);
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.nav-btn-compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.5);
}

.nav-btn-compact:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(231, 76, 60, 0.3);
}

/* Responsive styles */
@media (max-width: 768px) {
  .navigation-bar {
    top: 20px;
    right: 15px;
  }
  
  .desktop-nav {
    display: none !important; /* Force hide desktop version */
  }
  
  .mobile-nav {
    display: flex !important; /* Force show mobile compact version */
  }
  
  .nav-btn-compact {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}

/* Extra small devices */
@media (max-width: 480px) {
  .navigation-bar {
    top: 15px;
    right: 10px;
  }
  
  .nav-btn-compact {
    width: 38px;
    height: 38px;
    font-size: 0.9rem;
  }
}
</style>