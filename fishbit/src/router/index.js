import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'

// Lazy load views for better performance
const HomeView = () => import('../views/HomeView.vue')
const DashboardView = () => import('../views/DashboardView.vue')
const HabitsView = () => import('../views/HabitsView.vue')
const PetsView = () => import('../views/PetsView.vue')
const ShopView = () => import('../views/ShopView.vue')
const FriendsView = () => import('../views/FriendsView.vue')
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
    path: '/habits',
    name: 'habits',
    component: HabitsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/pets',
    name: 'pets',
    component: PetsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/shop',
    name: 'shop',
    component: ShopView,
    meta: { requiresAuth: true }
  },
  {
    path: '/friends',
    name: 'friends',
    component: FriendsView,
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
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else if ((to.name === 'login' || to.name === 'register') && userStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
