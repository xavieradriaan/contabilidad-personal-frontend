import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/styles.css'  // Importar el archivo CSS global
import VueApexCharts from 'vue3-apexcharts'
import jwt_decode from 'jwt-decode'

// Configurar la URL base de Axios usando una variable de entorno
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://127.0.0.1:5000'

// Interceptor para añadir el token de autenticación a cada solicitud
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// Función para verificar el tiempo restante del token
function checkTokenExpiration() {
  const token = localStorage.getItem('token')
  if (token) {
    const decodedToken = jwt_decode(token)
    const currentTime = Date.now() / 1000
    const timeLeft = decodedToken.exp - currentTime

    if (timeLeft < 300) {  // Si quedan menos de 5 minutos (300 segundos)
      alert('Tu sesión está a punto de expirar. Por favor, guarda tu trabajo.')
    }
  }
}

// Verificar el tiempo de expiración del token cada minuto
setInterval(checkTokenExpiration, 60000)

// Interceptor para manejar la expiración del token
axios.interceptors.response.use(response => {
  return response
}, error => {
  if (error.response && error.response.status === 401) {
    alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    router.push('/login')
  }
  return Promise.reject(error)
})

const app = createApp(App)
app.use(router)
app.use(VueApexCharts)
app.mount('#app')