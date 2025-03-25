import { createStore } from 'vuex'

export default createStore({
  state: {
    darkMode: localStorage.getItem('darkMode') === 'true'
  },
  mutations: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode
      localStorage.setItem('darkMode', state.darkMode)
    }
  },
  actions: {
    toggleDarkMode({ commit }) {
      commit('toggleDarkMode')
    }
  },
  getters: {
    isDarkMode: state => state.darkMode
  }
})