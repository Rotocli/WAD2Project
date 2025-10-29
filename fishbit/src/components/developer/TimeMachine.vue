<template>
  <!-- Only show if user is a developer -->
  <div v-if="userStore.isDeveloper">
    <!-- Floating trigger button -->
    <button 
      v-if="!showModal" 
      @click="showModal = true" 
      class="time-machine-trigger"
      :class="{ simulated: timeService.isSimulated() }"
      title="Developer Time Machine"
    >
      ⏰
    </button>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="showModal = false">
        <div class="time-machine-modal" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <h3>🛠️ Developer Time Machine</h3>
            <button @click="showModal = false" class="close-btn">×</button>
          </div>

          <!-- Content -->
          <div class="modal-body">
            <!-- Current Time Display -->
            <div class="section time-display">
              <div class="time-card" :class="{ simulated: timeService.isSimulated() }">
                <label>🕐 Current Time</label>
                <div class="time-value">{{ currentTime }}</div>
                <small v-if="timeService.isSimulated()" class="warning">
                  ⚠️ SIMULATED TIME ACTIVE
                </small>
              </div>
              <div v-if="timeService.isSimulated()" class="time-card offset">
                <label>⏱️ Time Offset</label>
                <div class="time-value">{{ timeService.getOffsetString() }}</div>
              </div>
            </div>

            <!-- Quick Time Jumps -->
            <div class="section">
              <h4>⏰ Quick Time Jumps</h4>
              <div class="button-grid">
                <button @click="fastForward(1)" class="action-btn">+1 Hour</button>
                <button @click="fastForward(6)" class="action-btn">+6 Hours</button>
                <button @click="fastForward(24)" class="action-btn">+1 Day</button>
                <button @click="fastForward(168)" class="action-btn">+1 Week</button>
              </div>
              
              <!-- Custom Time Jump -->
              <div class="custom-jump">
                <input 
                  v-model.number="customHours" 
                  type="number" 
                  placeholder="Hours"
                  class="custom-input"
                  min="1"
                  max="8760"
                />
                <button @click="fastForward(customHours)" class="action-btn">Jump</button>
              </div>
            </div>

            <!-- System Status -->
            <div class="section">
              <h4>📊 System Status</h4>
              <div class="status-grid">
                <div class="status-item">
                  <span class="status-label">Current Date:</span>
                  <span class="status-value">{{ timeService.getTodayString() }}</span>
                </div>
                <div class="status-item">
                  <span class="status-label">Yesterday:</span>
                  <span class="status-value">{{ timeService.getYesterdayString() }}</span>
                </div>
                <div class="status-item">
                  <span class="status-label">User Streak:</span>
                  <span class="status-value">{{ userStore.currentStreak }} days 🔥</span>
                </div>
                <div class="status-item">
                  <span class="status-label">Active Habits:</span>
                  <span class="status-value">{{ habitStore.activeHabits.length }}</span>
                </div>
              </div>
            </div>

            <!-- Manual Triggers -->
            <div class="section">
              <h4>Manual Triggers</h4>
              <div class="button-grid">
                <button @click="triggerDailyChecks" class="action-btn warning">
                  Run Daily Checks
                </button>
                <button @click="testNotification" class="action-btn">
                  Test Notification
                </button>
                <button @click="testHabitReminder" class="action-btn">
                  Test Habit Reminder
                </button>
                <button @click="refreshData" class="action-btn">
                  Refresh Data
                </button>
              </div>
            </div>
            <!-- Event Log -->
            <div class="section">
              <h4>📋 Event Log</h4>
              <div class="event-log">
                <div 
                  v-for="(event, index) in eventLog" 
                  :key="index" 
                  class="event-item"
                  :class="event.type"
                >
                  <span class="event-time">{{ event.time }}</span>
                  <span class="event-message">{{ event.message }}</span>
                </div>
                <div v-if="eventLog.length === 0" class="no-events">
                  No events yet
                </div>
              </div>
            </div>

            <!-- Reset Button -->
            <div class="section">
              <button @click="resetToRealTime" class="action-btn reset">
                🔄 Reset to Real Time
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { notificationService } from '@/services/notificationService'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useHabitStore } from '@/stores/habitStore'
import { timeService } from '@/services/timeService'
import { dailyCheckService } from '@/services/dailyCheckService'
import { devLog } from '@/utils/devUtils'

const userStore = useUserStore()
const habitStore = useHabitStore()

// State
const showModal = ref(false)
const customHours = ref(1)
const currentTime = ref(timeService.now().toLocaleString())
const eventLog = ref([])

let clockInterval = null

// Methods
function fastForward(hours) {
  if (!hours || hours < 0) return
  
  addEvent('time', `Fast-forwarding ${hours} hour${hours !== 1 ? 's' : ''}...`)
  
  // Use timeService to handle the jump
  timeService.fastForward(hours)
  
  addEvent('success', `Jumped ${hours} hours successfully`)
}

async function triggerDailyChecks() {
  addEvent('system', 'Triggering manual daily checks...')
  
  try {
    const results = await dailyCheckService.performDailyChecks(
      userStore.currentUserId,
      habitStore,
      userStore
    )
    
    if (results.userStreakBroken) {
      addEvent('warning', '💔 User streak was broken')
    }
    
    if (results.habitStreaksBroken.length > 0) {
      addEvent('warning', `💔 ${results.habitStreaksBroken.length} habit streak(s) broken`)
    } else if (!results.userStreakBroken) {
      addEvent('success', '✅ All streaks intact')
    }
    
    addEvent('system', `Checked ${results.habitsChecked} habits`)
    
    // Refresh data
    await refreshData()
    
  } catch (error) {
    addEvent('error', `Error: ${error.message}`)
  }
}

async function testNotification() {
  addEvent('Testing notification system...', 'system')
  
  // Check permission
  if (!notificationService.hasPermission()) {
    addEvent('Requesting notification permission...', 'system')
    const token = await notificationService.requestPermission()
    
    if (!token) {
      addEvent('Notification permission denied', 'error')
      return
    }
    
    addEvent('Notification permission granted', 'system')
  }

  // Send simple test
  notificationService.sendNotification('FishBit Test', {
    body: 'Notification system is working!',
    icon: '/favicon.ico',
    requireInteraction: true
  })
  
  addEvent('Test notification sent successfully', 'system')
}

async function testHabitReminder() {
  addEvent('Testing habit reminder notification...', 'system')
  
  // Check permission first
  if (!notificationService.hasPermission()) {
    addEvent('Requesting notification permission...', 'system')
    const token = await notificationService.requestPermission()
    
    if (!token) {
      addEvent('Notification permission denied', 'error')
      return
    }
  }

  // Make sure progress is loaded
  await habitStore.fetchProgress(userStore.currentUserId)
  
  // Send reminder with actual habit data
  notificationService.sendTestReminder(
    habitStore.habits,
    habitStore.progress
  )
  
  addEvent('Habit reminder notification sent', 'system')
}

async function refreshData() {
  addEvent('system', 'Refreshing data...')
  
  try {
    await habitStore.fetchHabits()
    await userStore.fetchUserProfile(userStore.currentUserId)
    addEvent('success', 'Data refreshed')
  } catch (error) {
    addEvent('error', `Refresh failed: ${error.message}`)
  }
}

function resetToRealTime() {
  addEvent('system', 'Resetting to real time...')
  timeService.resetToRealTime()
  addEvent('success', 'Time reset to real time')
}

function addEvent(type, message) {
  eventLog.value.unshift({
    type,
    time: new Date().toLocaleTimeString(),
    message
  })
  
  // Keep only last 50 events
  if (eventLog.value.length > 50) {
    eventLog.value = eventLog.value.slice(0, 50)
  }
}

function updateClock() {
  currentTime.value = timeService.now().toLocaleString()
}

// Register time jump callback
function setupTimeJumpCallback() {
  timeService.onTimeJump((hoursJumped, daysCrossed) => {
    if (daysCrossed > 0) {
      addEvent('warning', `Crossed ${daysCrossed} day${daysCrossed !== 1 ? 's' : ''} - Daily checks triggered`)
    }
  })
}

// Lifecycle
onMounted(() => {
  devLog('Time Machine initialized')
  addEvent('system', 'Time Machine initialized')
  
  // Set up time jump callback
  setupTimeJumpCallback()
  
  // Update clock every second
  clockInterval = setInterval(updateClock, 1000)
  
  // Check if we're already in simulated time
  if (timeService.isSimulated()) {
    addEvent('warning', `Loaded with time offset: ${timeService.getOffsetString()}`)
  }
})

onUnmounted(() => {
  if (clockInterval) {
    clearInterval(clockInterval)
  }
})
</script>

<style scoped>
/* Floating Trigger Button */
.time-machine-trigger {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 28px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  z-index: 1000;
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
}

.time-machine-trigger.simulated {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  animation: pulse-warning 1s infinite;
}

.time-machine-trigger:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  50% {
    box-shadow: 0 4px 25px rgba(102, 126, 234, 0.6);
  }
}

@keyframes pulse-warning {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(245, 87, 108, 0.6);
  }
  50% {
    box-shadow: 0 4px 30px rgba(245, 87, 108, 0.9);
  }
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

/* Modal Container */
.time-machine-modal {
  background: white;
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Modal Body */
.modal-body {
  padding: 25px;
  overflow-y: auto;
}

/* Sections */
.section {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.section h4 {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  color: #333;
}

/* Time Display */
.time-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  background: white;
  border: 2px solid #667eea;
}

.time-card {
  padding: 15px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
}

.time-card.simulated {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  border: 2px solid #ff9800;
}

.time-card.offset {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
}

.time-card label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 5px;
  font-weight: 600;
}

.time-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

.warning {
  display: block;
  color: #d32f2f;
  font-weight: 600;
  margin-top: 5px;
}

/* Button Grid */
.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

/* Status Grid */
.status-grid {
  display: grid;
  gap: 10px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-radius: 6px;
}

.status-label {
  color: #666;
  font-weight: 600;
}

.status-value {
  color: #333;
  font-weight: bold;
}

/* Action Buttons */
.action-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 0.95rem;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.action-btn.warning {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
}

.action-btn.reset {
  background: linear-gradient(135deg, #868e96 0%, #495057 100%);
  width: 100%;
}

/* Custom Jump */
.custom-jump {
  display: flex;
  gap: 10px;
}

.custom-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.95rem;
}

.custom-input:focus {
  outline: none;
  border-color: #667eea;
}

/* Event Log */
.event-log {
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border-radius: 8px;
  padding: 10px;
}

.event-item {
  display: flex;
  gap: 10px;
  padding: 8px 10px;
  margin-bottom: 5px;
  border-radius: 6px;
  font-size: 0.9rem;
  border-left: 3px solid #dee2e6;
}

.event-item.time {
  background: #e3f2fd;
  border-left-color: #2196f3;
}

.event-item.system {
  background: #fff3e0;
  border-left-color: #ff9800;
}

.event-item.success {
  background: #e8f5e9;
  border-left-color: #4caf50;
}

.event-item.warning {
  background: #fff3e0;
  border-left-color: #ff9800;
}

.event-item.error {
  background: #ffebee;
  border-left-color: #f44336;
}

.event-time {
  font-weight: 600;
  color: #666;
  min-width: 80px;
}

.event-message {
  flex: 1;
  color: #333;
}

.no-events {
  text-align: center;
  padding: 20px;
  color: #999;
  font-style: italic;
}

/* Scrollbar Styling */
.event-log::-webkit-scrollbar {
  width: 6px;
}

.event-log::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.event-log::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.event-log::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Responsive */
@media (max-width: 768px) {
  .time-machine-trigger {
    width: 50px;
    height: 50px;
    font-size: 24px;
    bottom: 20px;
    right: 20px;
  }

  .time-machine-modal {
    max-width: 95%;
    margin: 10px;
  }

  .modal-header {
    padding: 15px 20px;
  }

  .modal-header h3 {
    font-size: 1.2rem;
  }

  .modal-body {
    padding: 15px;
  }

  .button-grid {
    grid-template-columns: 1fr 1fr;
  }

  .time-display {
    grid-template-columns: 1fr;
  }
}
</style>
