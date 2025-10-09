<template>
  <div class="dashboard-view">
    <div class="container-fluid p-4">
      <!-- Welcome Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="welcome-card">
            <h2>Welcome back, {{ username }}! 👋</h2>
            <p class="text-muted mb-0">{{ motivationalQuote }}</p>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <i class="bi bi-fire"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Current Streak</p>
              <h3 class="stat-value">{{ currentStreak }} days</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <i class="bi bi-coin"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Total Points</p>
              <h3 class="stat-value">{{ totalPoints }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <i class="bi bi-check2-square"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Habits Active</p>
              <h3 class="stat-value">{{ activeHabitsCount }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <i class="bi bi-heart"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Fish Owned</p>
              <h3 class="stat-value">{{ fishCount }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Today's Habits -->
        <div class="col-lg-8">
          <div class="dashboard-card">
            <div class="card-header">
              <h4>Today's Habits</h4>
              <router-link to="/habits" class="btn btn-sm btn-outline-primary">
                View All
              </router-link>
            </div>
            <div class="card-body">
              <div v-if="todaysHabits.length > 0" class="habits-list">
                <div 
                  v-for="habit in todaysHabits" 
                  :key="habit.id"
                  class="habit-item"
                >
                  <div class="habit-info">
                    <div class="habit-check">
                      <input 
                        type="checkbox"
                        :id="'habit-' + habit.id"
                        :checked="habit.completedToday"
                        @change="completeHabit(habit.id)"
                        class="form-check-input"
                      >
                    </div>
                    <div>
                      <h6 class="mb-1">{{ habit.name }}</h6>
                      <small class="text-muted">{{ habit.description }}</small>
                    </div>
                  </div>
                  <div class="habit-streak">
                    <i class="bi bi-fire"></i> {{ habit.currentStreak || 0 }}
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-5">
                <p class="text-muted">No habits for today!</p>
                <router-link to="/habits" class="btn btn-primary">
                  Add Your First Habit
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Fish Tank Preview -->
        <div class="col-lg-4">
          <div class="dashboard-card">
            <div class="card-header">
              <h4>Your Fish Tank</h4>
              <router-link to="/pets" class="btn btn-sm btn-outline-primary">
                Visit Tank
              </router-link>
            </div>
            <div class="card-body">
              <div class="mini-tank">
                <div v-if="fish.length > 0">
                  <div v-for="f in fish.slice(0, 3)" :key="f.id" class="mini-fish">
                    <span class="fish-emoji">{{ getFishEmoji(f.species) }}</span>
                    <div class="fish-info">
                      <strong>{{ f.name }}</strong>
                      <div class="fish-stats">
                        <span><i class="bi bi-heart-fill text-danger"></i> {{ f.health }}%</span>
                        <span><i class="bi bi-star-fill text-warning"></i> Lvl {{ f.level }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-4">
                  <span style="font-size: 3rem;">🐠</span>
                  <p class="mt-2">Your first fish is waiting!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useHabitStore } from '../stores/habitStore'

const userStore = useUserStore()
const habitStore = useHabitStore()

// Computed properties
const username = computed(() => userStore.userProfile?.username || 'Friend')
const currentStreak = computed(() => userStore.currentStreak)
const totalPoints = computed(() => userStore.totalPoints)
const activeHabitsCount = computed(() => habitStore.activeHabits.length)
const todaysHabits = computed(() => habitStore.todaysHabits)

// Local state
const fish = ref([])
const fishCount = computed(() => fish.value.length)
const motivationalQuote = ref("Every journey begins with a single step. Keep going!")

const quotes = [
  "Every journey begins with a single step. Keep going!",
  "Consistency is the key to success. You've got this!",
  "Small habits make big differences over time.",
  "Your fish are counting on you today!",
  "Progress, not perfection. Keep swimming!",
  "Today's efforts are tomorrow's achievements."
]

function getFishEmoji(species) {
  const fishEmojis = {
    goldfish: '🐠',
    tropical: '🐟',
    pufferfish: '🐡',
    shark: '🦈',
    whale: '🐋',
    dolphin: '🐬'
  }
  return fishEmojis[species] || '🐠'
}

async function completeHabit(habitId) {
  try {
    await habitStore.completeHabit(habitId)
    // Show success message or animation
  } catch (error) {
    console.error('Error completing habit:', error)
  }
}

onMounted(async () => {
  // Set random motivational quote
  motivationalQuote.value = quotes[Math.floor(Math.random() * quotes.length)]
  
  // Fetch user's habits
  await habitStore.fetchHabits()
  
  // TODO: Fetch user's fish when fishStore is implemented
  // For now, using mock data
  fish.value = [
    { id: 1, name: 'Bubbles', species: 'goldfish', health: 85, level: 3 },
    { id: 2, name: 'Nemo', species: 'tropical', health: 92, level: 2 }
  ]
})
</script>

<style scoped>
.dashboard-view {
  min-height: calc(100vh - 70px);
  background: #f8f9fa;
}

.welcome-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  margin-right: 1rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #212529;
  margin: 0;
}

.dashboard-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
}

.card-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4 {
  margin: 0;
  font-size: 1.25rem;
}

.card-body {
  padding: 1.25rem;
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.habit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.habit-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.habit-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.habit-check .form-check-input {
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
}

.habit-check .form-check-input:checked {
  background-color: #28a745;
  border-color: #28a745;
}

.habit-streak {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #ff6b6b;
  font-weight: bold;
}

.mini-tank {
  background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 10px;
  padding: 1rem;
  min-height: 200px;
}

.mini-fish {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255,255,255,0.9);
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.fish-emoji {
  font-size: 2rem;
}

.fish-info {
  flex: 1;
}

.fish-stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}
</style>