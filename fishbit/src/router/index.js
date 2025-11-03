import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import { useUserStore } from '../stores/userStore'

// Lazy load views for better performance
const HomeView = () => import('../views/HomeView.vue')
const DashboardView = () => import('../views/DashboardView.vue')
const HabitsView = () => import('../views/HabitsView.vue')
const CalendarView = () => import('../views/CalendarView.vue')
const FishtankView = () => import('../views/FishtankView.vue')
const ShopView = () => import('../views/ShopView.vue')
const ProfileView = () => import('../views/ProfileView.vue')
const GoalsView = () => import('../views/GoalsView.vue')
const LoginView = () => import('../views/LoginView.vue')
const RegisterView = () => import('../views/RegisterView.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: CalendarView,
    meta: { requiresAuth: true }
  },
  {
    path: '/habits',
    name: 'habits',
    component: HabitsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/fishtank',
    name: 'fishtank',
    component: FishtankView,
    meta: { requiresAuth: true }
  },
  {
    path: '/shop',
    name: 'shop',
    component: ShopView,
    meta: { requiresAuth: true }
  },
  {
    path: '/goals',
    name: 'goals',
    component: GoalsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for protected routes
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // Wait for auth to initialize if still loading
  if (userStore.loading) {
    await new Promise(resolve => {
      const unwatch = watch(() => userStore.loading, (isLoading) => {
        if (!isLoading) {
          unwatch()
          resolve()
        }
      })
    })
  }
  
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else if ((to.name === 'login' || to.name === 'register') && userStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
