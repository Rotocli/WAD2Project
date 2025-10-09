<template>
  <div class="auth-view">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-5">
          <div class="auth-card">
            <div class="text-center mb-4">
              <h1 class="fish-logo">🐠</h1>
              <h2 class="h3 mb-3">Start Your Journey</h2>
              <p class="text-muted">Create an account to begin tracking habits</p>
            </div>

            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username"
                  v-model="formData.username"
                  required
                  placeholder="FishLover123"
                >
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email"
                  v-model="formData.email"
                  required
                  placeholder="your@email.com"
                >
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password"
                  v-model="formData.password"
                  required
                  placeholder="••••••••"
                  minlength="6"
                >
                <small class="text-muted">At least 6 characters</small>
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  required
                  placeholder="••••••••"
                >
              </div>

              <div class="alert alert-danger" v-if="error">
                {{ error }}
              </div>

              <button 
                type="submit" 
                class="btn btn-primary w-100 mb-3"
                :disabled="loading"
              >
                <span v-if="loading">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Creating account...
                </span>
                <span v-else>Create Account</span>
              </button>

              <div class="text-center">
                <p class="mb-0">
                  Already have an account? 
                  <router-link to="/login" class="text-decoration-none">
                    Login
                  </router-link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref(null)

async function handleRegister() {
  loading.value = true
  error.value = null

  // Validation
  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = 'Passwords do not match'
    loading.value = false
    return
  }

  if (formData.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters'
    loading.value = false
    return
  }

  try {
    await userStore.register(
      formData.value.email, 
      formData.value.password,
      formData.value.username
    )
    router.push('/dashboard')
  } catch (err) {
    if (err.message.includes('email-already-in-use')) {
      error.value = 'This email is already registered'
    } else if (err.message.includes('weak-password')) {
      error.value = 'Password is too weak'
    } else {
      error.value = 'Failed to create account. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.auth-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
}

.fish-logo {
  font-size: 4rem;
  animation: swim 3s ease-in-out infinite;
}

@keyframes swim {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(10px) rotate(5deg); }
  75% { transform: translateX(-10px) rotate(-5deg); }
}

.form-control {
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 0.75rem;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>