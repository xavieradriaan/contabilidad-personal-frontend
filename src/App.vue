<template>
  <div id="app">
    <div v-if="isLoggedIn" class="welcome-message">Hola, {{ username }}</div>
    <navigation-bar :showHome="isLoggedIn" :showLogout="isLoggedIn" @logout-clicked="logout"></navigation-bar>
    <router-view/>
  </div>
</template>

<script>
import axios from 'axios'
import NavigationBar from './components/NavigationBar.vue'
import inactivityLogout from './mixins/inactivityLogout.js'

export default {
  name: 'App',
  components: {
    NavigationBar
  },
  mixins: [inactivityLogout],
  data() {
    return {
      isLoggedIn: !!localStorage.getItem('token'),
      username: localStorage.getItem('username')
    }
  },
  watch: {
    isLoggedIn(newVal) {
      if (!newVal) {
        this.$router.push('/login')
      }
    }
  },
  methods: {
    async logout() {
      try {
        await axios.post('/logout', {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        this.isLoggedIn = false
        this.username = null
        this.$router.push('/login')
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
      }
    }
  }
}
</script>