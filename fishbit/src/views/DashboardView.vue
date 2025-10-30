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

    <!-- Fish Detail Modal -->
    <div v-if="selectedFish" class="fish-modal-overlay" @click="closeFishModal">
      <div class="fish-modal-content" @click.stop>
        <button class="modal-close-btn" @click="closeFishModal">&times;</button>
        
        <div class="fish-modal-card">
          <div class="modal-habit-title">
            {{ habitStore.habits.find(h => h.id === selectedFish.habitId)?.name || '-' }}
          </div>
          <div class="modal-fish-content">
            <div class="modal-fish-details">
              <div><b>Name:</b> {{ selectedFish.customName }}</div>
              <div>
                <b>Colour:</b>
                <span
                  :style="{
                    display:'inline-block',
                    verticalAlign:'middle',
                    width:'18px',
                    height:'18px',
                    background: selectedFish.baseColor,
                    borderRadius:'3px',
                    border:'1px solid #bbb',
                    marginLeft: '8px'
                  }"
                ></span>
              </div>
            </div>
            <div class="modal-fish-img">
              <svg 
                width="80" 
                height="60" 
                viewBox="0 0 80 60"
                class="fish-svg-modal"
              >
                <ellipse 
                  cx="40" 
                  cy="30" 
                  rx="30" 
                  ry="18" 
                  :fill="selectedFish.baseColor"
                />
                <g v-if="selectedFish.pattern === 'stripes' || selectedFish.pattern === 'default'">
                  <ellipse cx="25" cy="30" rx="8" ry="12" :fill="selectedFish.stripeColor || selectedFish.baseColor" opacity="0.8"/>
                  <ellipse cx="45" cy="30" rx="8" ry="12" :fill="selectedFish.stripeColor || selectedFish.baseColor" opacity="0.8"/>
                </g>
                <circle cx="55" cy="26" r="5" fill="white"/>
                <circle cx="55" cy="26" r="3" fill="#000"/>
                <ellipse 
                  cx="12" 
                  cy="30" 
                  rx="15" 
                  ry="12" 
                  :fill="selectedFish.baseColor"
                  opacity="0.9"
                />
                <path 
                  d="M 8 20 L 0 30 L 8 40 Q 5 30 8 20" 
                  :fill="selectedFish.baseColor"
                  opacity="0.7"
                />
                <ellipse 
                  cx="40" 
                  cy="12" 
                  rx="15" 
                  ry="6" 
                  :fill="selectedFish.stripeColor || selectedFish.baseColor"
                  opacity="0.7"
                />
                <ellipse 
                  cx="40" 
                  cy="48" 
                  rx="15" 
                  ry="6" 
                  :fill="selectedFish.stripeColor || selectedFish.baseColor"
                  opacity="0.7"
                />
                <path 
                  d="M 75 30 L 78 28 L 75 26" 
                  stroke="#000" 
                  stroke-width="1" 
                  fill="none"
                  opacity="0.5"
                />
              </svg>
            </div>
          </div>
          <button class="btn btn-primary mt-3 w-100" @click="editSelectedFish">Edit Fish</button>
        </div>
      </div>
    </div>

    <!-- Edit Fish Modal -->
    <div v-if="editingFish" class="modal-mask">
      <div class="modal-dialog">
        <div class="modal-content-edit">
          <h4>Edit Fish</h4>
          <div class="form-group">
            <label>Name:</label>
            <input v-model="editFishData.customName" class="form-control" />
          </div>
          <div class="form-group">
            <label>Habit:</label>
            <select v-model="editFishData.habitId" class="form-control">
              <option v-for="h in habitStore.habits" :value="h.id" :key="h.id">
                {{ h.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Species:</label>
            <select v-model="editFishData.species" class="form-control">
              <option v-for="(details, sp) in fishStore.fishSpecies" :key="sp" :value="sp">
                {{ details.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Colour:</label>
            <input type="color" v-model="editFishData.baseColor" class="form-control" style="height: 50px;" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-success" @click="confirmEdit">Save</button>
            <button class="btn btn-secondary" @click="closeEditModal">Cancel</button>
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

watch(
  () => userStore.currentUserId,
  (uid) => {
    if (uid) fishStore.fetchFish(uid)
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
const selectedFish = ref(null)
const editingFish = ref(false)
const editFishData = ref({
  customName: "",
  habitId: "",
  species: "",
  baseColor: ""
})

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
  selectedFish.value = fish
}

function closeFishModal() {
  selectedFish.value = null
}

function editSelectedFish() {
  if (selectedFish.value) {
    editFishData.value = {
      customName: selectedFish.value.customName,
      habitId: selectedFish.value.habitId,
      species: selectedFish.value.species,
      baseColor: selectedFish.value.baseColor
    }
    editingFish.value = true
  }
}

async function confirmEdit() {
  if (selectedFish.value) {
    await fishStore.updateFish(selectedFish.value.id, { ...editFishData.value })
    selectedFish.value = null
    editingFish.value = false
  }
}

function closeEditModal() {
  editingFish.value = false
}

// FIXED: Single onMounted with all initialization
onMounted(() => {
  console.log('🚀 Dashboard mounted')

  // Set random motivational quote
  motivationalQuote.value = quotes[Math.floor(Math.random() * quotes.length)]

  // Schedule reminders when habits AND progress are loaded
  const unwatchReminders = watch(
    () => [userStore.currentUserId, habitStore.activeHabits, habitStore.progress],
    async ([userId, habits, progress]) => {
      if (userId && habits.length > 0) {
        // Ensure progress is loaded before scheduling reminders
        if (!progress || progress.length === 0) {
          console.log('⏳ Waiting for progress to load...')
          await habitStore.fetchProgress(userId)
          console.log('✅ Progress loaded:', habitStore.progress.length, 'entries')
        }

        if (notificationService.hasPermission()) {
          console.log(
            '✅ Scheduling daily reminders with',
            habits.length, 'habits and',
            habitStore.progress.length, 'progress entries'
          )
          notificationService.scheduleDailyReminders(habits, habitStore.progress)

          // Stop watching after first successful schedule
          unwatchReminders()
        }
      }
    },
    { immediate: true }
  )
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

/* Fish Modal Overlay */
.fish-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fish-modal-content {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
}

.modal-close-btn:hover {
  background: #e11d48;
  color: white;
  transform: rotate(90deg);
}

.fish-modal-card {
  background: #fff;
  border: 2px solid #e0e7ff;
  border-radius: 15px;
  padding: 1.5rem;
}

.modal-habit-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #1e3a8a;
  text-align: center;
}

.modal-fish-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin: 1rem 0;
}

.modal-fish-details {
  width: 100%;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
}

.modal-fish-details > div {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.modal-fish-img {
  width: 100px;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 10px;
}

.fish-svg-modal {
  filter: drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.3));
}

/* Edit Modal */
.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  backdrop-filter: blur(5px);
}

.modal-dialog {
  background: #fff;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  min-width: 320px;
  max-width: 500px;
  width: 90%;
}

.modal-content-edit h4 {
  margin-bottom: 1.5rem;
  color: #1e3a8a;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
}

.modal-footer {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #4b5563;
}

</style>