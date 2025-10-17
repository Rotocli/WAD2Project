<template>
  <div class="calendar-view">
    <div class="container">
      <h2>Habit Calendar</h2>
      <p>Track your habits below:</p>

      <!-- ADD THIS: Navigation controls -->
      <div class="calendar-nav">
        <button @click="previousWeek" class="nav-btn">← Previous Week</button>
        <button @click="goToToday" class="today-btn">Today</button>
        <button @click="nextWeek" class="nav-btn">Next Week →</button>
      </div>

      <VueCal
        ref="vuecalRef"
        default-view="week"
        :time="false"
        :events="calendarEvents"
        :disable-views="['day', 'year', 'years']"
        :selected-date="selectedDate"
        style="height: 500px;"
        @cell-click="handleCellClick"
        @event-click="handleEventClick"
        hide-title-bar
      />

      <!-- ADD THIS: Modal for habit details -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeModal">×</button>
          <h3>{{ modalData.habitName }}</h3>
          <p class="modal-date">{{ formatDate(modalData.date) }}</p>
          
          <div class="modal-section">
            <strong>Description:</strong>
            <p>{{ modalData.description || 'No description available' }}</p>
          </div>
          
          <div class="modal-section">
            <strong>Status:</strong>
            <span :class="modalData.completed ? 'status-completed' : 'status-pending'">
              {{ modalData.completed ? '✓ Completed' : '○ Not Completed' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'

import { useUserStore } from '../stores/userStore'
import { useHabitStore } from '../stores/habitStore'

const userStore = useUserStore()
const habitStore = useHabitStore()
const vuecalRef = ref(null)

// ADD THESE: New reactive variables
const selectedDate = ref(new Date())
const showModal = ref(false)
const modalData = ref({})

const DAYS_TO_GENERATE = 365

onMounted(async () => {
  if (userStore.currentUserId) {
    await habitStore.fetchHabits(userStore.currentUserId)
    if (habitStore.fetchProgress) {
      await habitStore.fetchProgress(userStore.currentUserId)
    } else {
      console.warn("⚠️ habitStore.fetchProgress not found – make sure it's implemented.")
    }
  }
})

// ADD THESE: Navigation functions
function goToToday() {
  selectedDate.value = new Date()
  if (vuecalRef.value) {
    vuecalRef.value.switchView('week', new Date())
  }
}

function previousWeek() {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() - 7)
  selectedDate.value = newDate
  if (vuecalRef.value) {
    vuecalRef.value.previous()
  }
}

function nextWeek() {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() + 7)
  selectedDate.value = newDate
  if (vuecalRef.value) {
    vuecalRef.value.next()
  }
}

// ADD THIS: Handle clicks on events
function handleEventClick(event, e) {
  e.stopPropagation()
  
  // Find the habit from the event title
  const habit = habits.value.find(h => h.name === event.title)
  
  modalData.value = {
    habitName: event.title,
    date: event.start,
    description: habit?.description || 'No description',
    completed: event.class === 'habit-completed'
  }
  showModal.value = true
}

// ADD THIS: Handle clicks on empty cells
function handleCellClick(date, e) {
  // Only open modal if there's an event on this date
  const eventsOnDate = calendarEvents.value.filter(event => {
    const eventDate = new Date(event.start).toDateString()
    const clickedDate = new Date(date).toDateString()
    return eventDate === clickedDate
  })
  
  if (eventsOnDate.length > 0) {
    const event = eventsOnDate[0]
    const habit = habits.value.find(h => h.name === event.title)
    
    modalData.value = {
      habitName: event.title,
      date: event.start,
      description: habit?.description || 'No description',
      completed: event.class === 'habit-completed'
    }
    showModal.value = true
  }
}

// ADD THIS: Close modal
function closeModal() {
  showModal.value = false
}

// ADD THIS: Format date for display
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const habits = computed(() => habitStore.activeHabits || [])

function generateEventsFromHabits(habits, progress = []) {
  const events = []
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())

  habits.forEach(habit => {
    if (!habit.isActive) return

    const createdAt = habit.createdAt?.seconds
      ? new Date(habit.createdAt.seconds * 1000)
      : new Date(habit.createdAt)

    for (let i = 0; i < DAYS_TO_GENERATE; i++) {
      const currentDate = new Date(startOfWeek)
      currentDate.setDate(startOfWeek.getDate() + i)

      if (currentDate < createdAt) continue

      let shouldShow = false
      if (!habit.repeat) {
        const createdDayKey = createdAt.toISOString().split('T')[0]
        const currentDayKey = currentDate.toISOString().split('T')[0]
        if (createdDayKey === currentDayKey) shouldShow = true
      } else {
        switch (habit.frequency) {
          case 'daily':
            shouldShow = true
            break
          case 'weekly': {
            const creationWeekday = createdAt.getDay()
            if (currentDate.getDay() === creationWeekday) shouldShow = true
            break
          }
          case 'custom': {
            const daysSinceStart = Math.floor(
              (currentDate - createdAt) / (1000 * 60 * 60 * 24)
            )
            if (daysSinceStart >= 0 && daysSinceStart % habit.customFrequency === 0)
              shouldShow = true
            break
          }
        }
      }

      if (shouldShow) {
        const dateKey = currentDate.toISOString().split('T')[0]
        const isCompleted = progress.some(
          p => p.habitId === habit.id && p.date === dateKey && p.completed
        )

        events.push({
          start: new Date(currentDate),
          end: new Date(currentDate),
          title: habit.name,
          class: isCompleted ? 'habit-completed' : 'habit-pending'
        })
      }
    }
  })

  return events
}

const calendarEvents = ref([])

watch(
  [() => habitStore.activeHabits, () => habitStore.progress],
  ([habits, progress]) => {
    if (habits && progress) {
      calendarEvents.value = generateEventsFromHabits(habits, progress)
      console.log("🟢 calendarEvents updated:", calendarEvents.value.length)
    }
  },
  { deep: true, immediate: true }
)
</script>

<style>
/* Your existing styles stay exactly the same */
.vuecal__event.habit-completed,
.vuecal__event--habit-completed {
  background-color: #a8f0a3 !important;
  color: #000 !important;
}

.vuecal__event.habit-pending,
.vuecal__event--habit-pending {
  background-color: #f8c0c0 !important;
  color: #000 !important;
}

.vuecal__event {
  padding: 4px 6px !important;
  text-align: center !important;
  font-weight: 600 !important;
  cursor: pointer !important;
}

/* ADD THESE: New styles for navigation and modal */
.calendar-nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.nav-btn, .today-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.nav-btn {
  background-color: #e5e7eb;
  color: #374151;
}

.nav-btn:hover {
  background-color: #d1d5db;
}

.today-btn {
  background-color: #7c3aed;
  color: white;
}

.today-btn:hover {
  background-color: #6d28d9;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
}

.modal-close:hover {
  color: #374151;
}

.modal-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #111827;
}

.modal-date {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.modal-section {
  margin: 1rem 0;
}

.modal-section strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
}

.status-completed {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #a8f0a3;
  color: #000;
  border-radius: 6px;
  font-weight: 600;
}

.status-pending {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #f8c0c0;
  color: #000;
  border-radius: 6px;
  font-weight: 600;
}

.vuecal__cell {
  padding: 12px !important;
  min-height: 100px !important;
}

.vuecal__event:hover {
  transform: translateY(-4px) scale(1.05) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.vuecal__event {
  margin: 4px !important;
  padding: 12px 8px !important;
  border-radius: 8px !important;
  min-height: 50px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
</style>