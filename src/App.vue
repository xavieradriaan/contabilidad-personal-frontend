<template>
  <div id="app">
    <div v-if="isLoggedIn" class="welcome-message">Hola, {{ username }}</div>
    <navigation-bar :showHome="isLoggedIn" :showLogout="isLoggedIn"></navigation-bar>
    <router-view/>
  </div>
</template>

<script>
import NavigationBar from './components/NavigationBar.vue'

export default {
  name: 'App',
  components: {
    NavigationBar
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token')
    },
    username() {
      return localStorage.getItem('username')
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      this.$router.push('/login')
    }
  }
}
</script>