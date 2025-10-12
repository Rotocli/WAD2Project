<template>
  <div class="dashboard-view">
    <div class="container-fluid p-0">
      <!-- Welcome Section -->
      <div class="p-4">
        <WelcomeSection :motivationalQuote="motivationalQuote" :username="username"/>
      </div>

      <!-- AQUARIUM - Full Width -->
      <div class="aquarium-section">
        <AquariumView @fish-clicked="handleFishClick" />
      </div>

      <!-- Stats Cards -->
      <div class="p-4">
        <StatCard 
          :currentStreak="currentStreak" 
          :totalPoints="totalPoints" 
          :activeHabitsCount="activeHabitsCount" 
          :fishCount="fishCount"
        />
        
        <div class="row g-4 mt-2">
          <!-- Today's Habits -->
          <HabitDisplay :todaysHabits="todaysHabits" />
          
          <!-- Quick Actions Card -->
          <div class="col-lg-4">
            <div class="dashboard-card">
              <div class="card-header">
                <h4>Quick Actions</h4>
              </div>
              <div class="card-body">
                <div class="quick-actions">
                  <router-link to="/habits" class="action-btn">
                    <i class="bi bi-plus-circle"></i>
                    <span>Add Habit</span>
                  </router-link>
                  <router-link to="/pets" class="action-btn">
                    <i class="bi bi-eye"></i>
                    <span>View All Fish</span>
                  </router-link>
                  <router-link to="/shop" class="action-btn">
                    <i class="bi bi-cart"></i>
                    <span>Shop Items</span>
                  </router-link>
                  <button @click="customizeAquarium" class="action-btn">
                    <i class="bi bi-palette"></i>
                    <span>Customize Tank</span>
                  </button>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useHabitStore } from '../stores/habitStore'
import { useFishStore } from '../stores/fishStore'
import WelcomeSection from '../components/DashboardView/WelcomeSection.vue'
import StatCard from '../components/DashboardView/StatCard.vue'
import HabitDisplay from '../components/DashboardView/HabitDisplay.vue'
import AquariumView from '../components/fish/AquariumView.vue'

const userStore = useUserStore()
const habitStore = useHabitStore()
const fishStore = useFishStore()

// Fetch user habits
watch(
  () => userStore.currentUserId,
  (uid) => {
    if (uid) habitStore.fetchHabits(uid)
  },
  { immediate: true } 
)

// Computed properties
const username = computed(() => userStore.userProfile?.username || 'Friend')
const currentStreak = computed(() => userStore.currentStreak)
const totalPoints = computed(() => userStore.totalPoints)
const activeHabitsCount = computed(() => habitStore.activeHabits.length)
const todaysHabits = computed(() => habitStore.todaysHabits)
const fishCount = computed(() => fishStore.activeFish.length)

// Local state
const motivationalQuote = ref("Every journey begins with a single step. Keep going!")

const quotes = [
  "Every journey begins with a single step. Keep going!",
  "Consistency is the key to success. You've got this!",
  "Small habits make big differences over time.",
  "Your fish are counting on you today!",
  "Progress, not perfection. Keep swimming!",
  "Today's efforts are tomorrow's achievements."
]

// Event handlers
function handleFishClick(fish) {
  console.log('Fish clicked:', fish)
  // TODO: Open fish detail modal or navigate to pets page
  // For now, just log
}

function customizeAquarium() {
  // TODO: Open customization modal
  console.log('Customize aquarium')
  // This will be implemented when we build the shop/customization UI
}

onMounted(() => {
  // Set random motivational quote
  motivationalQuote.value = quotes[Math.floor(Math.random() * quotes.length)]
})
</script>

<style scoped>
.dashboard-view {
  min-height: calc(100vh - 70px);
  background: #f8f9fa;
}

/* Aquarium Section */
.aquarium-section {
  background: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(102, 126, 234, 0.4);
  color: white;
}

.action-btn i {
  font-size: 24px;
  margin-bottom: 8px;
}

.action-btn span {
  font-size: 13px;
  font-weight: 500;
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

/* Responsive */
@media (max-width: 768px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .action-btn {
    padding: 15px;
  }
  
  .action-btn i {
    font-size: 20px;
  }
}
</style>
