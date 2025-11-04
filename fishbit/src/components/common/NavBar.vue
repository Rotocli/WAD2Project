<template>
  <nav class="navbar navbar-expand-lg navbar-dark fixed-top" :class="{ 'dev-mode': userStore.isDeveloper }">
    <div class="container-fluid">
      <span class="navbar-brand d-flex align-items-center">
        <span class="fish-icon">🐠</span>
        <span class="brand-text">FishBit</span>
      </span>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        @click="toggleNavbar"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div 
        ref="navbarCollapse"
        class="collapse navbar-collapse" 
        :class="{ show: isNavbarOpen }"
      >
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/dashboard" @click="closeNavbar">
              <i class="bi bi-house"></i> Home
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/journal" @click="closeNavbar">
              <i class="bi bi-file-text"></i> Journal
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/habits" @click="closeNavbar">
              <i class="bi bi-check2-square"></i> Habits
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/calendar" @click="closeNavbar">
              <i class="bi bi-calendar"></i> Calendar
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/fishtank" @click="closeNavbar">
              <i class="bi bi-heart"></i> Fishtank
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/shop" @click="closeNavbar">
              <i class="bi bi-shop"></i> Shop
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/goals" @click="closeNavbar">
              <i class="bi bi-trophy"></i> Goals
            </router-link>
          </li>
        </ul>
        
        <div class="navbar-right-section">
          <div class="stats-row">
            <div class="points-display">
              <i class="bi bi-coin"></i>
              <span>{{ totalPoints }}</span>
            </div>
            
            <div class="streak-display">
              <i class="bi bi-fire"></i>
              <span>{{ currentStreak }}</span>
            </div>
          </div>
          
          <div class="dropdown">
            <button 
              class="btn btn-link nav-link dropdown-toggle user-dropdown-btn" 
              type="button"
              @click="toggleDropdown"
              aria-expanded="false"
            >
              <i class="bi bi-person-circle"></i>
              <span class="ms-1">{{ username }}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" :class="{ show: isDropdownOpen }">
              <li>
                <router-link class="dropdown-item" to="/profile" @click="handleProfileClick">
                  <i class="bi bi-gear"></i> Profile
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="dropdown-item" @click="handleLogout">
                  <i class="bi bi-box-arrow-right"></i> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../../stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isNavbarOpen = ref(false)
const isDropdownOpen = ref(false)
const navbarCollapse = ref(null)

const totalPoints = computed(() => userStore.totalPoints)
const currentStreak = computed(() => userStore.currentStreak)
const username = computed(() => userStore.userProfile?.username || 'User')

function toggleNavbar() {
  isNavbarOpen.value = !isNavbarOpen.value
  if (isNavbarOpen.value) {
    isDropdownOpen.value = false
  }
}

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function closeNavbar() {
  isNavbarOpen.value = false
  isDropdownOpen.value = false
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function handleProfileClick() {
  closeNavbar()
}

function handleClickOutside(event) {
  const navbar = navbarCollapse.value
  const toggler = event.target.closest('.navbar-toggler')
  const dropdownBtn = event.target.closest('.user-dropdown-btn')
  
  if (navbar && !navbar.contains(event.target) && !toggler) {
    closeNavbar()
  }
  
  if (isDropdownOpen.value && !dropdownBtn && !event.target.closest('.dropdown-menu')) {
    closeDropdown()
  }
}

async function handleLogout() {
  closeNavbar()
  await userStore.logout()
  router.push('/')
}

const unwatchRoute = router.afterEach(() => {
  closeNavbar()
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  unwatchRoute()
})
</script>

<style scoped>
.navbar {
  background: #667eea;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0;
  transition: top 0.3s ease;
  height: 70px;
  z-index: 100;
}

.container-fluid {
  padding: 0 1.5rem;
  height: 100%;
  display: flex;
  align-items: center;
  max-width: 100%;
  margin: 0;
}

.navbar.dev-mode {
  top: 36px;
}

.navbar-collapse {
  background: #667eea;
}

.navbar-right-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Mobile view */
@media (max-width: 992px) {
  .navbar-collapse {
    position: absolute;
    top: 100%;
    right: 0;
    left: auto;
    width: fit-content;
    min-width: 200px;
    max-width: 280px;
    max-height: calc(100vh - 100px);
    overflow-y: auto;    
    background: #667eea;
    box-shadow: -4px 4px 16px rgba(0, 0, 0, 0.15);
    padding: 1rem;
    border-radius: 0 0 0 12px;
    margin-right: 1rem;
  }

  .navbar-nav {
    flex-direction: column;
    width: 100%;
  }

  .navbar-nav .nav-item {
    width: 100%;
  }

  .navbar-nav .nav-link {
    color: #fff !important;
    padding: 0.75rem 1rem;
    width: 100%;
  }

  .navbar-right-section {
    flex-direction: column;
    align-items: stretch !important;
    width: 100%;
    margin-top: 1rem;
    gap: 0.75rem;
  }

  .stats-row {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    width: 100%;
  }

  .points-display,
  .streak-display {
    flex: 1;
    justify-content: center;
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
  }

  .points-display i,
  .streak-display i {
    font-size: 0.9rem;
  }

  .dropdown {
    width: 100%;
  }

  .user-dropdown-btn {
    width: 100%;
    justify-content: flex-start;
    padding: 0.75rem 1rem !important;
  }

  .dropdown-menu {
    position: static !important;
    width: 100%;
    margin-top: 0.5rem !important;
    box-shadow: none !important;
  }

  .navbar-collapse::-webkit-scrollbar {
    width: 6px;
  }

  .navbar-collapse::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  .navbar-collapse::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }

  .navbar-collapse::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
}

.navbar-nav {
  display: flex;
  align-items: center;
  margin: 0;
}

.navbar-nav .nav-item {
  display: flex;
  align-items: center;
}

.fish-icon {
  font-size: 1.8rem;
  margin-right: 0.5rem;
  animation: swim 3s ease-in-out infinite;
  display: inline-flex;
  align-items: center;
}

.brand-text {
  font-size: 1.5rem;
  margin-right: 0.8rem;
  font-weight: bold;
  color: white;
  line-height: 1;
  font-style: oblique;
}

.navbar-brand {
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  height: 100%;
  cursor: default;
}

@keyframes swim {
  0%, 100% { 
    transform: translateX(0) rotate(0deg); 
  }
  25% { 
    transform: translateX(5px) rotate(5deg); 
  }
  75% { 
    transform: translateX(-5px) rotate(-5deg); 
  }
}

.nav-link {
  color: rgba(255, 255, 255, 0.9) !important;
  margin: 0 0.5rem;
  transition: all 0.3s ease;
  text-decoration: none;
}

.nav-link:hover {
  color: white !important;
  background-color: #4a66e0;
  border-radius: 15px;
  transform: translateY(-2px);
}

.router-link-active {
  color: white !important;
  border-bottom: 2px solid white;
}

.points-display,
.streak-display {
  background: #4a66e0;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  height: fit-content;
  font-size: 0.9rem;
}

.points-display i,
.streak-display i {
  margin-right: 0.25rem;
  font-size: 1rem;
}

.dropdown {
  display: flex;
  align-items: center;
  position: relative;
}

.user-dropdown-btn {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  height: fit-content;
  text-decoration: none;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9) !important;
  cursor: pointer;
  font-size: 0.95rem;
}

.user-dropdown-btn:hover {
  color: white !important;
  background-color: #4a66e0;
  border-radius: 15px;
}

.user-dropdown-btn i {
  font-size: 1.1rem;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  background: #667eea;
  min-width: 180px;
  border-radius: 8px;
  padding: 0.5rem 0;
  display: none;
  z-index: 1000;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  color: white;
  padding: 0.6rem 1.2rem;
  transition: background 0.2s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.95rem;
}

.dropdown-item:hover {
  background: #4a66e0;
  color: white;
}

.dropdown-divider {
  border-color: rgba(255, 255, 255, 0.2);
  margin: 0.5rem 0;
}

.navbar-collapse {
  transition: all 0.3s ease-in-out;
}

.navbar-collapse:not(.show) {
  display: none;
}

.navbar-collapse.show {
  display: block;
}

@media (min-width: 993px) {
  .navbar-right-section {
    display: flex !important;
  }
}
</style>