<template>
  <div class="home-view">
    <div class="container">
      <div class="row min-vh-100 align-items-center">
        <div class="col-lg-6">
          <div class="hero-content">
            <h1 class="display-3 fw-bold text-white mb-4">
              <span class="fish-emoji">🐠</span> FishBit
            </h1>
            <p class="lead text-white mb-4">
              Transform your habits into happy fish! Build consistency, earn rewards, 
              and watch your virtual aquarium thrive as you achieve your goals.
            </p>
            <div class="features-list mb-5">
              <div class="feature-item">
                <i class="bi bi-check-circle-fill"></i>
                <span>Track daily habits with ease</span>
              </div>
              <div class="feature-item">
                <i class="bi bi-check-circle-fill"></i>
                <span>Care for virtual fish pets</span>
              </div>
              <div class="feature-item">
                <i class="bi bi-check-circle-fill"></i>
                <span>Compete with friends</span>
              </div>
              <div class="feature-item">
                <i class="bi bi-check-circle-fill"></i>
                <span>Earn points and rewards</span>
              </div>
            </div>
            <div class="cta-buttons">
              <router-link to="/register" class="btn btn-lg btn-light me-3">
                Get Started Free
              </router-link>
              <router-link to="/login" class="btn btn-lg btn-outline-light">
                Login
              </router-link>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="hero-illustration">
            <div class="fish-tank-preview">
              <div class="fish fish-1">🐠</div>
              <div class="fish fish-2">🐟</div>
              <div class="fish fish-3">🐡</div>
              <div class="bubble bubble-1"></div>
              <div class="bubble bubble-2"></div>
              <div class="bubble bubble-3"></div>
              <div class="seaweed seaweed-1">🌿</div>
              <div class="seaweed seaweed-2">🌱</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="features-section py-5">
        <h2 class="text-center text-white mb-5">How It Works</h2>
        <div class="row g-4">
          <div class="col-md-3">
            <div class="feature-card text-center">
              <div class="feature-icon">📝</div>
              <h4>Create Habits</h4>
              <p>Set up daily or weekly habits you want to build</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="feature-card text-center">
              <div class="feature-icon">✅</div>
              <h4>Check In Daily</h4>
              <p>Mark habits as complete to earn points and maintain streaks</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="feature-card text-center">
              <div class="feature-icon">🐠</div>
              <h4>Feed Your Fish</h4>
              <p>Your consistency keeps your virtual fish happy and healthy</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="feature-card text-center">
              <div class="feature-icon">🏆</div>
              <h4>Level Up</h4>
              <p>Unlock new fish, decorations, and compete with friends</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  // Redirect if already logged in
  if (userStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  padding-top: 0;
}

.hero-content {
  animation: fadeInLeft 1s ease;
}

.fish-emoji {
  animation: swim 3s ease-in-out infinite;
}

@keyframes swim {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(10px) rotate(5deg); }
  75% { transform: translateX(-10px) rotate(-5deg); }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.features-list {
  list-style: none;
}

.feature-item {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  animation: fadeIn 1s ease forwards;
  opacity: 0;
}

.feature-item:nth-child(1) { animation-delay: 0.2s; }
.feature-item:nth-child(2) { animation-delay: 0.4s; }
.feature-item:nth-child(3) { animation-delay: 0.6s; }
.feature-item:nth-child(4) { animation-delay: 0.8s; }

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.feature-item i {
  color: #4ade80;
  margin-right: 0.75rem;
  font-size: 1.3rem;
}

.cta-buttons .btn {
  padding: 0.75rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cta-buttons .btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.hero-illustration {
  position: relative;
  height: 500px;
  animation: fadeInRight 1s ease;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fish-tank-preview {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.fish {
  position: absolute;
  font-size: 3rem;
  animation: fishSwim 10s linear infinite;
}

.fish-1 {
  top: 20%;
  animation-duration: 12s;
}

.fish-2 {
  top: 50%;
  animation-duration: 15s;
  animation-delay: -5s;
}

.fish-3 {
  top: 70%;
  animation-duration: 18s;
  animation-delay: -10s;
}

@keyframes fishSwim {
  0% { left: -50px; }
  100% { left: calc(100% + 50px); }
}

.bubble {
  position: absolute;
  background: rgba(255,255,255,0.4);
  border-radius: 50%;
  animation: bubbleFloat 8s linear infinite;
}

.bubble-1 {
  width: 20px;
  height: 20px;
  left: 20%;
  animation-duration: 6s;
}

.bubble-2 {
  width: 15px;
  height: 15px;
  left: 50%;
  animation-duration: 8s;
  animation-delay: -2s;
}

.bubble-3 {
  width: 10px;
  height: 10px;
  left: 80%;
  animation-duration: 7s;
  animation-delay: -4s;
}

@keyframes bubbleFloat {
  0% {
    bottom: -20px;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    bottom: 100%;
    opacity: 0;
  }
}

.seaweed {
  position: absolute;
  bottom: 0;
  font-size: 3rem;
  animation: seaweedWave 4s ease-in-out infinite;
}

.seaweed-1 {
  left: 10%;
}

.seaweed-2 {
  right: 15%;
  animation-delay: -2s;
}

@keyframes seaweedWave {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.feature-card {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  color: white;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  background: rgba(255,255,255,0.2);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
</style>