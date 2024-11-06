import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/styles.css'  // Importar el archivo CSS global
import VueApexCharts from 'vue3-apexcharts'

// Configurar la URL base de Axios usando una variable de entorno
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://127.0.0.1:5000'

const app = createApp(App)
app.use(router)
app.use(VueApexCharts)
app.mount('#app')