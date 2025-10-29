<template>
  <nav class="navbar navbar-expand-lg navbar-dark fixed-top" :class="{ 'dev-mode': userStore.isDeveloper }">
    <div class="container-fluid">
      <router-link class="navbar-brand d-flex align-items-center" to="/dashboard">
        <span class="fish-icon">🐠</span>
        <span class="brand-text">FishBit</span>
      </router-link>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/dashboard">
              <i class="bi bi-house"></i> Home
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/habits">
              <i class="bi bi-check2-square"></i> Habits
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/calendar">
              <i class="bi bi-calendar"></i> Calendar
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/fishtank">
              <i class="bi bi-heart"></i> Fishtank
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/shop">
              <i class="bi bi-shop"></i> Shop
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/friends">
              <i class="bi bi-people"></i> Friends
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/goals">
              <i class="bi bi-trophy"></i> Goals
            </router-link>
          </li>
        </ul>
        
        <div class="d-flex align-items-center">
          <div class="points-display me-3">
            <i class="bi bi-coin"></i>
            <span>{{ totalPoints }}</span>
          </div>
          
          <div class="streak-display me-3">
            <i class="bi bi-fire"></i>
            <span>{{ currentStreak }}</span>
          </div>
          
          <div class="dropdown">
            <button 
              class="btn btn-link nav-link dropdown-toggle" 
              type="button" 
              data-bs-toggle="dropdown"
            >
              <i class="bi bi-person-circle"></i>
              {{ username }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link class="dropdown-item" to="/profile">
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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const totalPoints = computed(() => userStore.totalPoints)
const currentStreak = computed(() => userStore.currentStreak)
const username = computed(() => userStore.userProfile?.username || 'User')

async function handleLogout() {
  await userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 0.8rem 1rem;
  transition: top 0.3s ease;
}

/* Push navbar down when dev mode is active */
.navbar.dev-mode {
  top: 36px; /* Height of dev banner */
}

.fish-icon {
  font-size: 1.8rem;
  margin-right: 0.5rem;
  animation: swim 3s ease-in-out infinite;
}

.brand-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

@keyframes swim {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(5px) rotate(5deg); }
  75% { transform: translateX(-5px) rotate(-5deg); }
}

.nav-link {
  color: rgba(255,255,255,0.9) !important;
  margin: 0 0.5rem;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: white !important;
  transform: translateY(-2px);
}

.router-link-active {
  color: white !important;
  border-bottom: 2px solid white;
}

.points-display,
.streak-display {
  background: rgba(255,255,255,0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: white;
  font-weight: bold;
}

.points-display i,
.streak-display i {
  margin-right: 0.3rem;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.dropdown-item:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>
