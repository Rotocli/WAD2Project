<template>
  <div class="auth-view">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-5">
          <div class="auth-card">
            <div class="text-center mb-4">
              <h1 class="fish-logo">🐠</h1>
              <h2 class="h3 mb-3">Welcome Back!</h2>
              <p class="text-muted">Login to continue your habit journey</p>
            </div>

            <form @submit.prevent="handleLogin">
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
                  Logging in...
                </span>
                <span v-else>Login</span>
              </button>

              <div class="text-center">
                <p class="mb-0">
                  Don't have an account? 
                  <router-link to="/register" class="text-decoration-none">
                    Sign up
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
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref(null)

async function handleLogin() {
  loading.value = true
  error.value = null

  try {
    await userStore.login(formData.value.email, formData.value.password)
    router.push('/dashboard')
  } catch (err) {
    error.value = 'Invalid email or password. Please try again.'
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