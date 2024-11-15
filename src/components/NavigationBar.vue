<template>
  <div class="navigation-bar">
    <div v-if="username" class="welcome-message">Hola, {{ username }}</div>
    <div class="buttons">
      <button v-if="showBack" class="btn btn-secondary mb-2" @click="goBack">Regresar</button>
      <button v-if="showHome" class="btn btn-primary mb-2" @click="goHome">Salir</button>
      <button v-if="showLogout" class="btn btn-danger" @click="logout">Logout</button>
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
  computed: {
    username() {
      return localStorage.getItem('username')
    }
  },
  methods: {
    goBack() {
      if (this.$route.path === '/register') {
        this.$router.push('/dashboard')
      } else {
        this.$router.go(-1)
      }
    },
    goHome() {
      this.$router.push('/')
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      this.$emit('user-logged-out')
      this.$router.push('/login')
    }
  }
}
</script>