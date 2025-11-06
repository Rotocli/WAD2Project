<template>
  <nav class="navbar navbar-expand-lg navbar-dark fixed-top" :class="{ 'dev-mode': userStore.isDeveloper }">
    <div class="container-fluid">
      <!-- Brand -->
      <span class="navbar-brand d-flex align-items-center">
        <span class="fish-icon">
          <img src="@/assets/image.png" alt="FishBit Logo" width="40" height="40"/>
        </span>
        <span class="brand-text">FishBit</span>
      </span>

      <!-- Hamburger -->
      <button class="navbar-toggler" type="button" @click="toggleNavbar" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Collapsible menu -->
      <div 
        ref="navbarCollapse"
        class="navbar-collapse"
        :class="{ 'mobile-open': isNavbarOpen }"
        :style="{ height: isMobile ? collapseHeight : 'auto' }"
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

        <!-- Right section -->
        <div class="navbar-right-section">
          <div class="stats-row">
            <div class="points-display" title="Your Points">
              <i class="bi bi-coin"></i>
              <span>&nbsp{{ totalPoints }}</span>
            </div>
            
            <div class="streak-display" title="Your Streak">
              <i class="bi bi-fire"></i>
              <span>&nbsp{{ currentStreak }}</span>
            </div>
          </div>

          <div class="dropdown">
            <button class="btn btn-link nav-link dropdown-toggle user-dropdown-btn" type="button" @click="toggleDropdown">
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
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const isMobile = ref(window.innerWidth < 992)
const isNavbarOpen = ref(false)
const isDropdownOpen = ref(false)
const navbarCollapse = ref(null)
const collapseHeight = ref('0px')

const totalPoints = computed(() => userStore.totalPoints)
const currentStreak = computed(() => userStore.currentStreak)
const username = computed(() => userStore.userProfile?.username || 'User')

function toggleNavbar() {
  isNavbarOpen.value = !isNavbarOpen.value
  if (isNavbarOpen.value) isDropdownOpen.value = false

  const el = navbarCollapse.value
  if (!el) return

  if (isNavbarOpen.value) {
    el.style.display = 'block'
    nextTick(() => {
      collapseHeight.value = el.scrollHeight + 'px'
    })
  } else {
    collapseHeight.value = '0px'
    setTimeout(() => {
      el.style.display = 'none'
    }, 250)
  }
}

function toggleDropdown() { isDropdownOpen.value = !isDropdownOpen.value }
function closeNavbar() { isNavbarOpen.value = false; isDropdownOpen.value = false }
function closeDropdown() { isDropdownOpen.value = false }
function handleProfileClick() { closeNavbar() }

async function handleLogout() {
  closeNavbar()
  await userStore.logout()
  router.push('/')
}

function handleClickOutside(event) {
  const navbar = navbarCollapse.value
  const toggler = event.target.closest('.navbar-toggler')
  const dropdownBtn = event.target.closest('.user-dropdown-btn')

  // Fix: Check if navbar is actually open before closing
  if (isNavbarOpen.value && navbar && !navbar.contains(event.target) && !toggler) {
    closeNavbar()
  }
  if (isDropdownOpen.value && !dropdownBtn && !event.target.closest('.dropdown-menu')) {
    closeDropdown()
  }
}

function updateViewport() {
  isMobile.value = window.innerWidth < 992
}

onMounted(() => {
  window.addEventListener('resize', updateViewport)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateViewport)
})

onMounted(() => { document.addEventListener('click', handleClickOutside) })
onUnmounted(() => { document.removeEventListener('click', handleClickOutside) })
</script>

<style scoped>
.fish-icon {
  font-size: 1.8rem;
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;
  animation: swim 3s ease-in-out infinite; /* add this line */
}

@keyframes swim {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(5px) rotate(5deg); }
  75% { transform: translateX(-5px) rotate(-5deg); }
}

body, html { overflow-x: hidden; }

.navbar {
  background: #244260;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 0;
  height: 70px;
  z-index: 100;
  overflow: visible;
}

.container-fluid { 
  padding: 0 1.5rem; 
  display: flex; 
  align-items: center; 
  max-width: 100%; 
  margin: 0; 
}

.navbar.dev-mode { 
  top: 36px; 
}

.navbar-collapse {
  background: transparent;
  overflow: visible !important;
  transition: height 0.25s ease;
  position: relative;
}

.nav-link { 
  color: rgba(255,255,255,0.9); 
  margin: 0 0.5rem; 
  padding: 0.5rem 1rem; 
  border-radius: 15px; 
  transition: all 0.3s ease; 
  text-decoration: none; 
}

.nav-link:hover { 
  color: white; 
  border-radius: 15px;
  background-color: #547da7; 
  border-bottom: 0px;
}

.router-link-active { 
  color: white; 
  border-radius: 0px;
  border-bottom: 2px solid white; 
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

.points-display, .streak-display { 
  background: #547da7; 
  padding: 0.5rem 1rem; 
  border-radius: 20px; 
  color: white; 
  font-weight: bold; 
  display: flex; 
  align-items: center; 
  font-size: 0.9rem; 
  cursor: pointer;
}

.dropdown { 
  position: relative; 
  display: flex; 
  align-items: center; 
  color: white;
}

.user-dropdown-btn { 
  display: flex; 
  align-items: center; 
  padding: 0.4rem 0.8rem; 
  border: none; 
  background: transparent; 
  color: rgba(255,255,255,0.9); 
  cursor: pointer; 
  border-radius: 10px; 
}

.user-dropdown-btn:hover { 
  color: white; 
  background-color: #547da7; 
}

.dropdown-menu { 
  position: absolute !important; 
  right: 0;
  top: calc(100% + 6px);
  min-width: 180px;
  margin-top: 0.5rem !important;
  background: #244260;
  backdrop-filter: blur(6px); 
  border-radius: 15px; 
  padding: 0.5rem 0; 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: block; 
  opacity: 0; 
  transform: translateY(-5px); 
  pointer-events: none; 
  transition: all 0.25s ease; 
  z-index: 2000;
  transform: translateY(-5px);
}

.dropdown-menu.show { 
  opacity: 1; 
  transform: translateY(0); 
  pointer-events: auto; 
}

.dropdown-item {
  color: white;
  padding: 0.6rem 1.2rem;
  transition: background 0.2s ease;
  
}

.dropdown-item:hover {
  background: transparent;
  transition: all 0.25s ease; 
  color: white;
  background-color: #547da7;
  border-radius: 8px;
  border-bottom: 0px;
}
.dropdown-item:active{
  border-bottom: 2px white;
  border-radius: 0px;
}

/* mobile view */
@media (max-width: 992px) {
  .navbar-collapse {
    display: none;
    position: absolute;
    background: #244260;
    backdrop-filter: blur(20px);
    top: 70px;
    right: 0;
    width: auto;
    min-width: 250px;
    max-width: 280px;
    
    border-radius: 0 0 0 12px;
    box-shadow: -4px 4px 16px rgba(0, 0, 0, 0.15);
    overflow: visible;
    transition: height 0.25s ease, opacity 0.2s ease;
    height: 0;
    padding: 0 1.5rem; 
  }
  .navbar-collapse:not(.mobile-open) { 
    opacity: 0;
    pointer-events: none;
  }
  
  .navbar-collapse.mobile-open {
    display: block;
    opacity: 1;
  }

  .navbar-nav { 
    flex-direction: column;
    padding-top: 1rem;
  }

  .navbar-nav .nav-item {
    width: 100%;
  }

  .navbar-nav .nav-link { 
    color: #fff !important;
    padding: 0.75rem 1rem;
    width: 100%;
    border-radius: 0px;
    transition: all 0.3s ease;
  }

  .navbar-nav .nav-link:hover {
    color: white !important;
    background-color: #547da7;
    border-radius: 15px;
  }

  .navbar-right-section {
    flex-direction: column;
    align-items: stretch !important;
    width: 100%;
    margin-top: 1rem;
    padding-bottom: 1rem;
    gap: 0.75rem;
  }


  .dropdown {
    width: 100%;
    position: relative;
  }

  .dropdown-menu {
    position: absolute !important;
    right:0;
    top: calc(100% + 6px);
    z-index: 1000;
    width: 100%;
    background-color: transparent;
    box-shadow: none !important;
    transform: translateX(-5px);
  }

  .dropdown-menu.show {
    transform: translateX(0);
  }
}
</style>