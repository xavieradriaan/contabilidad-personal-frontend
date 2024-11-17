<template>
  <div class="navigation-bar">
    <div class="buttons">
      <button v-if="showBack" class="btn btn-secondary mb-2" @click="goBack">Regresar</button>
      <button v-if="showHome" class="btn btn-primary mb-2" @click="goHome">Salir</button>
      <button v-if="showLogout" class="btn btn-logout mb-2" @click="emitLogoutClicked">Logout</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavigationBar',
  props: {
    showBack: {
      type: Boolean,
      default: false
    },
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
    goBack() {
      if (this.$route.path === '/register') {
        this.$router.push('/')
      } else {
        this.$router.go(-1)
      }
    },
    goHome() {
      this.$router.push('/')
    },
    emitLogoutClicked() {
      console.log('Logout button clicked'); // Log
      this.$emit('logout-clicked');
    }
  }
}
</script>