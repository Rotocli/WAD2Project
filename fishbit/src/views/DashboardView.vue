<template>
  <div class="dashboard-view">
    <div class="container-fluid p-0">

      <div class="aquarium-section">
        <AquariumView @fish-clicked="handleFishClick" />
      </div>

      <div class="p-4">
        <div class="row g-4 mt-2">
          <HabitDisplay :todaysHabits="todaysHabits" />

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
                  <router-link to="/fishtank" class="action-btn">
                    <i class="bi bi-eye"></i>
                    <span>View All Fish</span>
                  </router-link>
                  <router-link to="/shop" class="action-btn">
                    <i class="bi bi-cart"></i>
                    <span>Shop Items</span>
                  </router-link>
                  <router-link to="/fishtank" class="action-btn">
                    <i class="bi bi-palette"></i>
                    <span>Customize Tank</span>
                  </router-link>
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
import { notificationService } from '../services/notificationService'
import WelcomeSection from '../components/DashboardView/WelcomeSection.vue'
import StatCard from '../components/DashboardView/StatCard.vue'
import HabitDisplay from '../components/DashboardView/HabitDisplay.vue'
import AquariumView from '../components/fish/AquariumView.vue'
import { useAquariumStore } from '../stores/aquariumStore'

const userStore = useUserStore()
const habitStore = useHabitStore()
const fishStore = useFishStore()


watch(
  () => userStore.currentUserId,
  (uid) => {
    if (uid) habitStore.fetchHabits(uid)
  },
  { immediate: true } 
)

watch(
  () => userStore.currentUserId,
  (uid) => {
    if (uid) fishStore.fetchFish(uid)
  },
  { immediate: true }
)

const username = computed(() => userStore.userProfile?.username || 'Friend')
const currentStreak = computed(() => userStore.currentStreak)
const totalPoints = computed(() => userStore.totalPoints)
const activeHabitsCount = computed(() => habitStore.activeHabits.length)
const todaysHabits = computed(() => habitStore.todaysHabits)
const fishCount = computed(() => fishStore.activeFish.length)

const motivationalQuote = ref("Every journey begins with a single step. Keep going!")

const quotes = [
  "Every journey begins with a single step. Keep going!",
  "Consistency is the key to success. You've got this!",
  "Small habits make big differences over time.",
  "Your fish are counting on you today!",
  "Progress, not perfection. Keep swimming!",
  "Today's efforts are tomorrow's achievements."
]

function handleFishClick(fish) {
  console.log('Fish clicked:', fish)
}

onMounted(() => {
  console.log('🚀 Dashboard mounted')
  
  motivationalQuote.value = quotes[Math.floor(Math.random() * quotes.length)]
  
  let remindersScheduled = false
  
  watch(
    () => [userStore.currentUserId, habitStore.activeHabits, habitStore.progress],
    async ([userId, habits, progress]) => {
      // stop multiple schedules
      if (remindersScheduled) return
      
      if (userId && habits.length > 0) {
        
        if (!progress || progress.length === 0) {
          console.log('⏳ Waiting for progress to load...')
          await habitStore.fetchProgress(userId)
          console.log('✅ Progress loaded:', habitStore.progress.length, 'entries')
        }
        
        if (notificationService.hasPermission()) {
          console.log('✅ Scheduling daily reminders with', habits.length, 'habits and', habitStore.progress.length, 'progress entries')
          notificationService.scheduleDailyReminders(habits, habitStore.progress)
          
          remindersScheduled = true
        }
      }
    },
    { immediate: true }
  )
})

</script>

<style scoped>
.dashboard-view {
  position: relative;
  min-height: 100vh; 
  width: 100%;
  background: linear-gradient(to top, #805621 0%, #f3ca96 50%);
  overflow: hidden; 
}

.aquarium-section {
  top: 0;
  border-radius: 0;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.bubble-container {
  display: grid;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  transition: all 0.6s ease-in-out;
  padding: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, white, #99d3ff);
  border: 2px solid #81b9f0;
  color: #57a4f1;
  text-decoration: none;
  cursor: pointer;
  padding: 10%;
  width: 100%;
  aspect-ratio: 1 / 1;
  max-width: 200px; 
  margin: 0 auto;
  text-align: center;
  transition: 
    transform 0.25s ease,
    box-shadow 0.25s ease,
    all 0.6s ease-in-out; 
}

/* hover expand inflate */
.action-btn:hover {
  transform: scale(1.08);
}

/* click 'pop' */
.action-btn:active {
  animation: bubble-pop 0.25s ease-out;
}

@keyframes bubble-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* responsiveness */
@media (max-width: 992px) {
  .bubble-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .bubble-container {
    grid-template-columns: repeat(2, minmax(100px, 1fr));
    gap: 1rem;
  }
  .action-btn {
  max-width: 120px;
  }
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
  background: hsla(0, 0%, 100%, 0.55); ;
  border-radius: 15px;
  color: #57a4f1;
  overflow: hidden;
}

.card-header {
  padding: 1.25rem;
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

@media (max-width: 900px) {
  .bubble-container {
    grid-template-columns: repeat(2, 1fr); 
  }
  .action-btn {
    width: clamp(100px, 25vw, 150px);
  }
}

@media (max-width: 500px) {
  .bubble-container {
    gap: 1rem;
    padding: 1rem;
  }
  .action-btn {
    width: clamp(80px, 35vw, 120px);
  }
}
</style>
