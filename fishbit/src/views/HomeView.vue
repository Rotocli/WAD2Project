<template>
  <div class="home-view">
    <!-- Hero Section with Aquarium Background -->
    <div class="hero-section">
      <!-- Animated Aquarium Background -->
      <div class="aquarium-backdrop">
        <div class="water-gradient"></div>
        <div class="substrate"></div>
        
        <!-- Decorations -->
        <img src="@/assets/aquariumDeco/seaweed.svg" class="deco seaweed seaweed-1" alt="seaweed" />
        <img src="@/assets/aquariumDeco/kelp.svg" class="deco kelp kelp-1" alt="kelp" />
        <img src="@/assets/aquariumDeco/castle.svg" class="deco castle" alt="castle" />
        <img src="@/assets/aquariumDeco/rock.svg" class="deco rock rock-1" alt="rock" />
        <img src="@/assets/aquariumDeco/coral.svg" class="deco coral coral-1" alt="coral" />
        <img src="@/assets/aquariumDeco/treasureChest.svg" class="deco treasure" alt="treasure" />
        
        <!-- Animated fish using SVG -->
        <svg class="fish fish-1" width="80" height="60" viewBox="0 0 80 60">
          <ellipse cx="40" cy="30" rx="30" ry="18" fill="#3b82f6"/>
          <ellipse cx="25" cy="30" rx="8" ry="12" fill="#60a5fa" opacity="0.8"/>
          <ellipse cx="45" cy="30" rx="8" ry="12" fill="#60a5fa" opacity="0.8"/>
          <circle cx="55" cy="26" r="5" fill="white"/>
          <circle cx="55" cy="26" r="3" fill="#000"/>
          <ellipse cx="12" cy="30" rx="15" ry="12" fill="#3b82f6" opacity="0.9"/>
          <path d="M 8 20 L 0 30 L 8 40 Q 5 30 8 20" fill="#3b82f6" opacity="0.7"/>
        </svg>
        
        <svg class="fish fish-2" width="80" height="60" viewBox="0 0 80 60">
          <ellipse cx="40" cy="30" rx="30" ry="18" fill="#10b981"/>
          <ellipse cx="25" cy="30" rx="8" ry="12" fill="#34d399" opacity="0.8"/>
          <ellipse cx="45" cy="30" rx="8" ry="12" fill="#34d399" opacity="0.8"/>
          <circle cx="55" cy="26" r="5" fill="white"/>
          <circle cx="55" cy="26" r="3" fill="#000"/>
          <ellipse cx="12" cy="30" rx="15" ry="12" fill="#10b981" opacity="0.9"/>
          <path d="M 8 20 L 0 30 L 8 40 Q 5 30 8 20" fill="#10b981" opacity="0.7"/>
        </svg>
        
        <svg class="fish fish-3" width="80" height="60" viewBox="0 0 80 60">
          <ellipse cx="40" cy="30" rx="30" ry="18" fill="#f59e0b"/>
          <ellipse cx="25" cy="30" rx="8" ry="12" fill="#fbbf24" opacity="0.8"/>
          <ellipse cx="45" cy="30" rx="8" ry="12" fill="#fbbf24" opacity="0.8"/>
          <circle cx="55" cy="26" r="5" fill="white"/>
          <circle cx="55" cy="26" r="3" fill="#000"/>
          <ellipse cx="12" cy="30" rx="15" ry="12" fill="#f59e0b" opacity="0.9"/>
          <path d="M 8 20 L 0 30 L 8 40 Q 5 30 8 20" fill="#f59e0b" opacity="0.7"/>
        </svg>
        
        <!-- Bubbles -->
        <div class="bubble bubble-1"></div>
        <div class="bubble bubble-2"></div>
        <div class="bubble bubble-3"></div>
        <div class="bubble bubble-4"></div>
        <div class="bubble bubble-5"></div>
      </div>

      <!-- Content Overlay -->
      <div class="container hero-content-wrapper">
        <div class="row min-vh-100 align-items-center">
          <div class="col-lg-6">
            <div class="hero-content">
              <h1 class="display-2 fw-bold text-white mb-4">
                <img src="@/assets/image.png" alt="FishBit Logo" class="logo-image" />
                FishBit
              </h1>
              <p class="lead text-white mb-5" style="font-size: 1.4rem; line-height: 1.6;">
                Transform your habits into happy fish! Build consistency, earn rewards, 
                and watch your virtual aquarium thrive as you achieve your goals.
              </p>
              
              <!-- CTA Buttons -->
              <div class="cta-buttons">
                <router-link to="/register" class="btn btn-lg btn-primary btn-cta">
                  Get Started Free
                </router-link>
                <router-link to="/login" class="btn btn-lg btn-outline-light btn-cta" style="margin-left: 20px;">
                  Login
                </router-link>
              </div>
            </div>
          </div>
          
          <!-- Right side - Large Preview Card -->
          <div class="col-lg-6">
            <div class="preview-card">
              <div class="preview-header">
                <h4>Your Virtual Aquarium</h4>
                <span class="badge bg-success">Live Preview</span>
              </div>
              <div class="preview-aquarium">
                <div class="mini-aquarium">
                  <img src="@/assets/aquariumDeco/seaweed.svg" class="mini-deco mini-seaweed" alt="seaweed" />
                  <img src="@/assets/aquariumDeco/castle.svg" class="mini-deco mini-castle" alt="castle" />
                  <img src="@/assets/aquariumDeco/rock.svg" class="mini-deco mini-rock" alt="rock" />
                  
                  <svg class="mini-fish mini-fish-1" width="60" height="45" viewBox="0 0 80 60">
                    <ellipse cx="40" cy="30" rx="30" ry="18" fill="#ec4899"/>
                    <circle cx="55" cy="26" r="5" fill="white"/>
                    <circle cx="55" cy="26" r="3" fill="#000"/>
                    <ellipse cx="12" cy="30" rx="15" ry="12" fill="#ec4899" opacity="0.9"/>
                    <path d="M 8 20 L 0 30 L 8 40 Q 5 30 8 20" fill="#ec4899" opacity="0.7"/>
                  </svg>
                  
                  <svg class="mini-fish mini-fish-2" width="60" height="45" viewBox="0 0 80 60">
                    <ellipse cx="40" cy="30" rx="30" ry="18" fill="#8b5cf6"/>
                    <circle cx="55" cy="26" r="5" fill="white"/>
                    <circle cx="55" cy="26" r="3" fill="#000"/>
                    <ellipse cx="12" cy="30" rx="15" ry="12" fill="#8b5cf6" opacity="0.9"/>
                    <path d="M 8 20 L 0 30 L 8 40 Q 5 30 8 20" fill="#8b5cf6" opacity="0.7"/>
                  </svg>
                </div>
              </div>
              <div class="preview-stats">
                <div class="stat-item">
                  <div class="stat-value">12</div>
                  <div class="stat-label">Active Habits</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">8</div>
                  <div class="stat-label">Happy Fish</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">45</div>
                  <div class="stat-label">Day Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="container">
        <h2 class="section-title text-center mb-5">How FishBit Works</h2>
        
        <div class="row g-4">
          <div class="col-md-3">
            <div class="feature-card">
              <div class="feature-number">1</div>
              <h4>Create Habits</h4>
              <p>Set up daily or weekly habits you want to build. Each habit gets its own fish!</p>
            </div>
          </div>
          
          <div class="col-md-3">
            <div class="feature-card">
              <div class="feature-number">2</div>
              <h4>Check In Daily</h4>
              <p>Mark habits as complete to earn coins and maintain streaks. Keep your fish happy!</p>
            </div>
          </div>
          
          <div class="col-md-3">
            <div class="feature-card">
              <div class="feature-number">3</div>
              <h4>Feed Your Fish</h4>
              <p>Your consistency keeps your virtual fish thriving. Break streaks and they get sad!</p>
            </div>
          </div>
          
          <div class="col-md-3">
            <div class="feature-card">
              <div class="feature-number">4</div>
              <h4>Level Up</h4>
              <p>Unlock new fish species, decorations, and customize your aquarium!</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Why Gamification Section -->
    <div class="why-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h2 class="section-title mb-4">Why Gamified Habits Work</h2>
            <p class="section-subtitle mb-4">Research shows that gamification significantly improves habit formation and long-term adherence.</p>
          </div>
          
          <div class="col-lg-6">
            <div class="benefits-grid">
              <div class="benefit-card">
                <h5>Visual Progress Tracking</h5>
                <p>"Seeing my fish thrive gave me a tangible representation of my progress. It made abstract goals feel real and achievable."</p>
                <div class="benefit-source">— Stanford Behavior Design Lab</div>
              </div>
              
              <div class="benefit-card">
                <h5>Increased Motivation</h5>
                <p>"Gamified systems tap into our intrinsic motivation by providing immediate feedback and creating emotional investment in outcomes."</p>
                <div class="benefit-source">— Journal of Behavioral Psychology</div>
              </div>
              
              <div class="benefit-card">
                <h5>Sustained Engagement</h5>
                <p>"Users of gamified habit trackers show 40% higher long-term retention compared to traditional tracking methods."</p>
                <div class="benefit-source">— Digital Health Research</div>
              </div>
              
              <div class="benefit-card">
                <h5>Behavioral Reinforcement</h5>
                <p>"The combination of visual rewards and streak mechanics creates powerful behavioral loops that reinforce positive habits."</p>
                <div class="benefit-source">— Habit Formation Studies</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Final CTA Section -->
    <div class="final-cta-section">
      <div class="container text-center">
        <h2 class="display-4 fw-bold text-white mb-4">Ready to Transform Your Habits?</h2>
        <p class="lead text-white mb-5">Join thousands of users building better habits with FishBit today!</p>
        <router-link to="/register" class="btn btn-lg btn-light btn-cta-large">
          <img src="@/assets/image.png" alt="FishBit" class="btn-logo" />
          Start Your Free Aquarium
        </router-link>
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
  if (userStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
/* Remove any top padding/margin */
.home-view {
  min-height: 100vh;
  background: #1e3a8a;
  margin-top: -54px; /* Override App.vue's .main-content padding-top */
  padding-top: 0;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  margin-top: 0;
  padding-top: 0;
}

.aquarium-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.water-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, 
    #1e3a8a 0%,
    #1e40af 20%, 
    #2563eb 40%, 
    #3b82f6 60%, 
    #60a5fa 100%
  );
}

.substrate {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 25%;
  background: linear-gradient(180deg, #d4a574 0%, #c4955f 50%, #b8894f 100%);
  z-index: 1;
}

/* Decorations */
.deco {
  position: absolute;
  z-index: 2;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
}

.seaweed {
  bottom: 0;
  animation: sway 4s ease-in-out infinite;
}

.seaweed-1 {
  left: 10%;
  height: 180px;
}

.kelp-1 {
  left: 5%;
  bottom: 0;
  height: 200px;
  animation: sway 5s ease-in-out infinite;
  animation-delay: -1s;
}

.castle {
  bottom: 18%;
  left: 50%;
  transform: translateX(-50%);
  height: 120px;
  width: auto;
}

.rock {
  z-index: 3;
}

.rock-1 {
  bottom: 20%;
  right: 15%;
  height: 80px;
}

.coral-1 {
  bottom: 20%;
  left: 25%;
  height: 90px;
  animation: sway 6s ease-in-out infinite;
  animation-delay: -2s;
}

.treasure {
  bottom: 21%;
  right: 35%;
  height: 70px;
}

@keyframes sway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

/* Fish Animations */
.fish {
  position: absolute;
  z-index: 4;
  animation: swim 15s linear infinite;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.fish-1 {
  top: 20%;
  animation-duration: 18s;
}

.fish-2 {
  top: 45%;
  animation-duration: 22s;
  animation-delay: -8s;
}

.fish-3 {
  top: 65%;
  animation-duration: 20s;
  animation-delay: -15s;
}

@keyframes swim {
  0% { 
    right: -100px;
    transform: scaleX(-1);
  }
  100% { 
    right: calc(100% + 100px);
    transform: scaleX(-1);
  }
}

/* Bubbles */
.bubble {
  position: absolute;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.3));
  border-radius: 50%;
  animation: bubble-float 8s linear infinite;
  z-index: 5;
}

.bubble-1 {
  width: 15px;
  height: 15px;
  left: 15%;
  animation-duration: 7s;
}

.bubble-2 {
  width: 20px;
  height: 20px;
  left: 35%;
  animation-duration: 9s;
  animation-delay: -2s;
}

.bubble-3 {
  width: 12px;
  height: 12px;
  left: 55%;
  animation-duration: 8s;
  animation-delay: -4s;
}

.bubble-4 {
  width: 18px;
  height: 18px;
  left: 75%;
  animation-duration: 10s;
  animation-delay: -6s;
}

.bubble-5 {
  width: 14px;
  height: 14px;
  left: 90%;
  animation-duration: 7.5s;
  animation-delay: -3s;
}

@keyframes bubble-float {
  0% {
    bottom: 0;
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    bottom: 100%;
    opacity: 0;
  }
}

/* Hero Content */
.hero-content-wrapper {
  position: relative;
  z-index: 10;
}

.hero-content {
  animation: fadeInUp 1s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-content h1 {
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-image {
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

.hero-content .lead {
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

/* CTA Buttons */
.btn-cta {
  padding: 0.875rem 2rem;
  font-weight: 600;
  font-size: 1.1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.btn-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

.btn-primary.btn-cta {
  background: #223243;
  border: none;
}

.btn-outline-light.btn-cta {
  border: 2px solid white;
}

/* Preview Card */
.preview-card {
  background: rgba(249, 243, 232, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
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

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: #1e293b;
}

.preview-aquarium {
  background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 12px;
  height: 300px;
  position: relative;
  overflow: hidden;
  margin-bottom: 1rem;
}

.mini-aquarium {
  position: relative;
  width: 100%;
  height: 100%;
}

.mini-aquarium::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
  background: linear-gradient(180deg, #d4a574 0%, #c4955f 100%);
}

.mini-deco {
  position: absolute;
  z-index: 2;
}

.mini-seaweed {
  bottom: 0;
  left: 15%;
  height: 100px;
  animation: sway 3s ease-in-out infinite;
}

.mini-castle {
  bottom: 28%;
  left: 50%;
  transform: translateX(-50%);
  height: 80px;
}

.mini-rock {
  bottom: 32%;
  right: 20%;
  height: 50px;
}

.mini-fish {
  position: absolute;
  z-index: 3;
  animation: mini-swim 12s linear infinite;
}

.mini-fish-1 {
  top: 25%;
  animation-duration: 14s;
}

.mini-fish-2 {
  top: 55%;
  animation-duration: 16s;
  animation-delay: -7s;
}

@keyframes mini-swim {
  0% { 
    right: -80px;
    transform: scaleX(-1);
  }
  100% { 
    right: calc(100% + 80px);
    transform: scaleX(-1);
  }
}

.preview-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 1rem;
  border-top: 2px solid rgba(0,0,0,0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1e293b;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

/* Features Section */
.features-section {
  padding: 6rem 0;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
}

.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e293b;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-10px);
  border-color: #667eea;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.feature-number {
  width: 60px;
  height: 60px;
  background: #223243;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.feature-card h4 {
  color: #1e293b;
  margin-bottom: 1rem;
  font-weight: 600;
}

.feature-card p {
  color: #64748b;
  line-height: 1.6;
}

/* Why Section */
.why-section {
  padding: 6rem 0;
  background: white;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  line-height: 1.6;
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.benefit-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.benefit-card h5 {
  color: #1e293b;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.benefit-card p {
  color: #475569;
  font-style: italic;
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.benefit-source {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Final CTA Section */
.final-cta-section {
  padding: 6rem 0;
  background: #223243;
}

.btn-cta-large {
  padding: 1.25rem 3rem;
  font-size: 1.3rem;
  font-weight: 600;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-cta-large:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.4);
}

.btn-logo {
  width: 32px;
  height: 32px;
}

/* Responsive */
@media (max-width: 992px) {
  .hero-content h1 {
    font-size: 3rem;
  }
  
  .logo-image {
    width: 60px;
    height: 60px;
  }
  
  .preview-card {
    margin-top: 3rem;
  }
}

/* Tablet: 2 columns for feature cards */
@media (min-width: 768px) and (max-width: 991px) {
  .features-section .col-md-3 {
    flex: 0 0 50%;
    max-width: 50%;
  }
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .logo-image {
    width: 50px;
    height: 50px;
  }
  
  .preview-aquarium {
    height: 250px;
  }
  
  .castle {
    height: 80px;
  }
  
  .rock-1 {
    height: 60px;
  }
}
</style>
