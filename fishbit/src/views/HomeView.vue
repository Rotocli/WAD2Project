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
                <button @click="openRegister" class="btn btn-lg btn-primary btn-cta">
                  Get Started Free
                </button>
                <button @click="openLogin" class="btn btn-lg btn-outline-light btn-cta" style="margin-left: 20px;">
                  Login
                </button>
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

      <!-- Scroll Indicator Chevrons -->
      <div class="scroll-indicator">
        <svg class="chevron-svg" width="40" height="40" viewBox="0 0 40 40">
          <path d="M 10 15 L 20 25 L 30 15" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <!-- <svg class="chevron-svg" width="40" height="40" viewBox="0 0 40 40">
          <path d="M 10 15 L 20 25 L 30 15" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg> -->
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="container">
        <h2 class="section-title text-center mb-5 scroll-animate">How FishBit Works</h2>

        <div class="row g-4">
          <div class="col-md-3 scroll-animate" data-delay="0">
            <div class="feature-card">
              <div class="feature-number">1</div>
              <h4>Create Habits</h4>
              <p>Set up daily or weekly habits you want to build. Each habit gets its own fish!</p>
            </div>
          </div>

          <div class="col-md-3 scroll-animate" data-delay="100">
            <div class="feature-card">
              <div class="feature-number">2</div>
              <h4>Check In Daily</h4>
              <p>Mark habits as complete to earn coins and maintain streaks. Keep your fish happy!</p>
            </div>
          </div>

          <div class="col-md-3 scroll-animate" data-delay="200">
            <div class="feature-card">
              <div class="feature-number">3</div>
              <h4>Feed Your Fish</h4>
              <p>Your consistency keeps your virtual fish thriving. Break streaks and they get sad!</p>
            </div>
          </div>

          <div class="col-md-3 scroll-animate" data-delay="300">
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
          <div class="col-lg-6 scroll-animate">
            <h2 class="section-title mb-4">Why Gamified Habits Work</h2>
            <p class="section-subtitle mb-4">Research shows that gamification significantly improves habit formation and long-term adherence.</p>
          </div>

          <div class="col-lg-6">
            <div class="benefits-grid">
              <div class="benefit-card scroll-animate" data-delay="0">
                <h5>Turn Progress Into Habit</h5>
                <p>“Gamification uses core game mechanics like challenges, competitions, and rewards to drive motivation and engagement … resulting in deeper engagement.”</p>
                <div class="benefit-source">“Gamification & Its Impacts: A Comprehensive Guide”</div>
              </div>

              <div class="benefit-card scroll-animate" data-delay="100">
                <h5>Motivation That Lasts</h5>
                <p>"Gamification can provide the structure to engage, motivate, and focus … whether they are employees, customers, or communities of interest."</p>
                <div class="benefit-source">Brian Burke -- Gamify: How Gamification Motivates People to Do Extraordinary Things</div>
              </div>

              <div class="benefit-card scroll-animate" data-delay="200">
                <h5>Engagement Through Feeling Smart</h5>
                <p>"People do not take actions that are necessarily the most economical, but actions that make them feel the smartest."</p>
                <div class="benefit-source">Yu-Kai Chou -- Actionable Gamification: Beyond Points, Badges & Leaderboards</div>
              </div>

              <div class="benefit-card scroll-animate" data-delay="300">
                <h5>Feedback Fuels Long-Term Use</h5>
                <p>"Gamification is positively associated with … experiences of affective feedback … which are strongly associated with user perceived benefits and continued use intentions."</p>
                <div class="benefit-source">S. Loijas et al., study in International Journal of Information Management</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Final CTA Section -->
    <div class="final-cta-section">
      <div class="container text-center scroll-animate">
        <h2 class="display-4 fw-bold text-white mb-4">Ready to Transform Your Habits?</h2>
        <p class="lead text-white mb-5">Join thousands of users building better habits with FishBit today!</p>
        <button @click="openRegister" class="btn btn-lg btn-light btn-cta-large">
          <img src="@/assets/image-dark.png" alt="FishBit" class="btn-logo" />
          Start Your Free Aquarium
        </button>
      </div>
    </div>

    <!-- Login Modal -->
    <div v-if="showLoginModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-container">
        <button class="modal-close" @click="closeModals">&times;</button>
        
        <div class="modal-header-content">
          <img src="@/assets/image-dark.png" alt="FishBit" class="modal-logo" />
          <h2>Welcome Back!</h2>
          <p>Login to continue your habit journey</p>
        </div>

        <form @submit.prevent="handleLogin" class="modal-form">
          <div class="form-group">
            <label for="login-email">Email</label>
            <input 
              type="email" 
              id="login-email"
              v-model="loginForm.email"
              required
              placeholder="your@email.com"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="login-password">Password</label>
            <input 
              type="password" 
              id="login-password"
              v-model="loginForm.password"
              required
              placeholder="••••••••"
              class="form-input"
            >
          </div>

          <div v-if="loginError" class="error-message">
            {{ loginError }}
          </div>

          <button
            type="submit"
            class="btn-submit"
            :disabled="loginLoading"
          >
            <span v-if="loginLoading">
              <span class="spinner"></span>
              Logging in...
            </span>
            <span v-else>Login</span>
          </button>

          <div class="divider">
            <span>or</span>
          </div>

          <button
            @click="handleGoogleLogin"
            class="btn-google"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4"/>
              <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853"/>
              <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04"/>
              <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div class="modal-footer-content">
            <p>
              Don't have an account?
              <a href="#" @click.prevent="openRegister">Sign up</a>
            </p>
          </div>
        </form>
      </div>
    </div>

    <!-- Register Modal -->
    <div v-if="showRegisterModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-container">
        <button class="modal-close" @click="closeModals">&times;</button>
        
        <div class="modal-header-content">
          <img src="@/assets/image-dark.png" alt="FishBit" class="modal-logo" />
          <h2>Start Your Journey</h2>
          <p>Create an account to begin tracking habits</p>
        </div>

        <form @submit.prevent="handleRegister" class="modal-form">
          <div class="form-group">
            <label for="register-username">Username</label>
            <input 
              type="text" 
              id="register-username"
              v-model="registerForm.username"
              required
              placeholder="FishLover123"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="register-email">Email</label>
            <input 
              type="email" 
              id="register-email"
              v-model="registerForm.email"
              required
              placeholder="your@email.com"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="register-password">Password</label>
            <input 
              type="password" 
              id="register-password"
              v-model="registerForm.password"
              required
              placeholder="••••••••"
              minlength="6"
              class="form-input"
            >
            <small class="form-hint">At least 6 characters</small>
          </div>

          <div class="form-group">
            <label for="register-confirm">Confirm Password</label>
            <input 
              type="password" 
              id="register-confirm"
              v-model="registerForm.confirmPassword"
              required
              placeholder="••••••••"
              class="form-input"
            >
          </div>

          <div v-if="registerError" class="error-message">
            {{ registerError }}
          </div>

          <button
            type="submit"
            class="btn-submit"
            :disabled="registerLoading"
          >
            <span v-if="registerLoading">
              <span class="spinner"></span>
              Creating account...
            </span>
            <span v-else>Create Account</span>
          </button>

          <div class="divider">
            <span>or</span>
          </div>

          <button
            @click="handleGoogleLogin"
            class="btn-google"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4"/>
              <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853"/>
              <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04"/>
              <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <div class="modal-footer-content">
            <p>
              Already have an account?
              <a href="#" @click.prevent="openLogin">Login</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const showLoginModal = ref(false)
const showRegisterModal = ref(false)

const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loginLoading = ref(false)
const registerLoading = ref(false)
const loginError = ref(null)
const registerError = ref(null)

function openLogin() {
  showLoginModal.value = true
  showRegisterModal.value = false
  loginError.value = null
}

function openRegister() {
  showRegisterModal.value = true
  showLoginModal.value = false
  registerError.value = null
}

function closeModals() {
  showLoginModal.value = false
  showRegisterModal.value = false
  loginError.value = null
  registerError.value = null
}

async function handleLogin() {
  loginLoading.value = true
  loginError.value = null

  try {
    await userStore.login(loginForm.value.email, loginForm.value.password)
    closeModals()
    router.push('/dashboard')
  } catch (err) {
    loginError.value = 'Invalid email or password. Please try again.'
  } finally {
    loginLoading.value = false
  }
}

async function handleRegister() {
  registerLoading.value = true
  registerError.value = null

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerError.value = 'Passwords do not match'
    registerLoading.value = false
    return
  }

  if (registerForm.value.password.length < 6) {
    registerError.value = 'Password must be at least 6 characters'
    registerLoading.value = false
    return
  }

  try {
    await userStore.register(
      registerForm.value.email,
      registerForm.value.password,
      registerForm.value.username
    )
    closeModals()
    router.push('/dashboard')
  } catch (err) {
    if (err.message.includes('email-already-in-use')) {
      registerError.value = 'This email is already registered'
    } else if (err.message.includes('weak-password')) {
      registerError.value = 'Password is too weak'
    } else {
      registerError.value = 'Failed to create account. Please try again.'
    }
  } finally {
    registerLoading.value = false
  }
}

async function handleGoogleLogin() {
  try {
    await userStore.loginWithGoogle()
    closeModals()
    router.push('/dashboard')
  } catch (err) {
    if (err.message.includes('popup-closed-by-user')) {
      // User closed popup - no error message needed
    } else if (err.message.includes('cancelled-popup-request')) {
      // User cancelled - no error message needed
    } else if (err.message.includes('account-exists-with-different-credential')) {
      loginError.value = 'An account already exists with this email using a different sign-in method'
      registerError.value = 'An account already exists with this email using a different sign-in method'
    } else {
      loginError.value = 'Failed to sign in with Google. Please try again.'
      registerError.value = 'Failed to sign up with Google. Please try again.'
    }
  }
}

onMounted(() => {
  if (userStore.isAuthenticated) {
    router.push('/dashboard')
  }

  // Initialize scroll animations
  initScrollAnimations()
})

function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Element is visible - add animation (only once, don't remove on scroll up)
        const delay = entry.target.dataset.delay || 0
        setTimeout(() => {
          entry.target.classList.add('is-visible')
        }, delay)
        // Stop observing once animated
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // Observe all elements with scroll-animate class
  const animatedElements = document.querySelectorAll('.scroll-animate')
  animatedElements.forEach(el => observer.observe(el))
}
</script>

<style scoped>
/* Remove any top padding/margin */
.home-view {
  min-height: 100vh;
  background: #1e3a8a;
  margin-top: -54px;
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
  border: none;
  cursor: pointer;
}

.btn-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

.btn-primary.btn-cta {
  background: #244260;
  color: white;
}

.btn-outline-light.btn-cta {
  border: 2px solid white;
  background: transparent;
  color: white;
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
  background: #244260;
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
  background: #244260;
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
  background: white;
  color: #1e293b;
  border: none;
  cursor: pointer;
}

.btn-cta-large:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.4);
}

.btn-logo {
  width: 32px;
  height: 32px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
  padding: 1rem;
  overflow-y: auto;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 450px;
  width: 100%;
  position: relative;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: #64748b;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-header-content {
  text-align: center;
  margin-bottom: 2rem;
}

.modal-logo {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  display: block;
}

.modal-header-content h2 {
  font-size: 1.75rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 0.5rem;
  text-align: center;
}

.modal-header-content p {
  color: #64748b;
  margin: 0;
  text-align: center;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.form-group label {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-hint {
  color: #64748b;
  font-size: 0.85rem;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 10px;
  font-size: 0.9rem;
  text-align: center;
}

.btn-submit {
  background: #244260;
  color: white;
  border: none;
  padding: 0.875rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Divider for "or" between auth methods */
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
  color: #94a3b8;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.divider span {
  padding: 0 0.75rem;
  font-size: 0.875rem;
}

/* Google Sign-In Button */
.btn-google {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #1e293b;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-google:hover {
  border-color: #4285f4;
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.2);
  background: #f8fafc;
}

.btn-google:active {
  transform: translateY(1px);
}

.btn-google svg {
  flex-shrink: 0;
}

.modal-footer-content {
  text-align: center;
  margin-top: 1rem;
}

.modal-footer-content p {
  color: #64748b;
  margin: 0;
}

.modal-footer-content a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.modal-footer-content a:hover {
  text-decoration: underline;
}

/* Scroll Indicator Chevrons */
.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: -10px;
  z-index: 9999;
  pointer-events: none;
}

.chevron-svg {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
  animation: chevron-float 2s ease-in-out infinite;
}

.chevron-svg:nth-child(1) {
  animation-delay: 0s;
}

.chevron-svg:nth-child(2) {
  animation-delay: 0.2s;
}

@keyframes chevron-float {
  0%, 100% {
    opacity: 0;
    transform: translateY(-10px);
  }
  50% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scroll Animations */
.scroll-animate {
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.scroll-animate.is-visible {
  opacity: 1;
  transform: translateY(0);
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
    margin-bottom: 3rem;
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

@media (max-width: 480px) {
  .modal-container {
    padding: 1.5rem;
  }
  
  .modal-logo {
    width: 50px;
    height: 50px;
  }
}
</style>
