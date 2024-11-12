<template>
  <div id="app">
    <div v-if="isLoggedIn" class="welcome-message">Hola, {{ username }}</div>
    <navigation-bar :showHome="isLoggedIn" :showLogout="isLoggedIn" @user-logged-out="handleUserLoggedOut"></navigation-bar>
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
    handleUserLoggedOut() {
      this.isLoggedIn = false
      this.username = null
    }
  }
}
</script>