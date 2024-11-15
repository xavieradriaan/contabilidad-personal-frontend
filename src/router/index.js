import { createRouter, createWebHistory } from 'vue-router'
import HomeComponent from '../components/HomeComponent.vue'
import IngresosComponent from '../components/IngresosComponent.vue'
import EgresosComponent from '../components/EgresosComponent.vue'
import TotalComponent from '../components/TotalComponent.vue'
import LoginComponent from '../components/LoginComponent.vue'
import RegisterComponent from '../components/RegisterComponent.vue'
import DashboardComponent from '../components/DashboardComponent.vue'
import OtroIngresoComponent from '../components/OtroIngresoComponent.vue'
import InformesGraficosComponent from '../components/InformesGraficosComponent.vue'
import PagosRecurrentesComponent from '../components/PagosRecurrentesComponent.vue'
import DepositosBancosComponent from '../components/DepositosBancosComponent.vue'  // Importar el nuevo componente

const routes = [
  { path: '/', component: HomeComponent },
  { path: '/login', component: LoginComponent },
  { path: '/register', component: RegisterComponent },
  { path: '/dashboard', component: DashboardComponent, meta: { requiresAuth: true } },
  { path: '/ingresos', component: IngresosComponent, meta: { requiresAuth: true } },
  { path: '/egresos', component: EgresosComponent, meta: { requiresAuth: true } },
  { path: '/total', component: TotalComponent, meta: { requiresAuth: true } },
  { path: '/otros_ingresos', component: OtroIngresoComponent, meta: { requiresAuth: true } },
  { path: '/informes_graficos', component: InformesGraficosComponent, meta: { requiresAuth: true } },
  { path: '/pagos_recurrentes', component: PagosRecurrentesComponent, meta: { requiresAuth: true } },
  { path: '/depositos_bancos', component: DepositosBancosComponent, meta: { requiresAuth: true } }  // Nueva ruta
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const loggedIn = !!localStorage.getItem('token')
  if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router