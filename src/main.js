import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/styles.css'
import VueApexCharts from 'vue3-apexcharts'
import SweetAlert2 from './plugins/sweetalert2'

axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://127.0.0.1:5000'

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

const app = createApp(App)
app.use(router)
app.use(VueApexCharts)
app.use(SweetAlert2)
app.mount('#app')