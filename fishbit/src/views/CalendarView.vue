<template>
  <div class="calendar-view">
    <div class="container">
      <h2>Habit Calendar</h2>
      <p>Track your habits below:</p>

      <div class="calendar-nav">
        <button @click="previousWeek" class="nav-btn">
          <span class="mobile-text">←</span>
          <span class="desktop-text">← Previous Week</span>
        </button>
        <button @click="goToToday" class="today-btn">Today</button>
        <button @click="nextWeek" class="nav-btn">
          <span class="mobile-text">→</span>
          <span class="desktop-text">Next Week →</span>
        </button>
      </div>

      <VueCal
        ref="vuecalRef"
        default-view="week"
        :time="false"
        :events="calendarEvents"
        :disable-views="['day', 'year', 'years']"
        :selected-date="selectedDate"
        class="responsive-calendar"
        @cell-click="handleCellClick"
        @event-click="handleEventClick"
        hide-title-bar
      />

      <!-- Modal for habit details -->
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
  startOfWeek.setDate(today.getDate() - 365)

  const DAYS_TO_GENERATE = 730
  
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
      console.log("calendarEvents updated:", calendarEvents.value.length)
    }
  },
  { deep: true, immediate: true }
)
</script>

<style>
.calendar-view {
  color: white;
  background: #547da7;
}
.vuecal__event.habit-completed,
.vuecal__event--habit-completed {
  background-color: rgb(96, 162, 106) !important;
  color: white !important;
}

.vuecal__event.habit-pending,
.vuecal__event--habit-pending {
  background-color: rgb(190, 105, 105) !important;
  color: white;
}

.vuecal__event {
  padding: 12px 8px !important;
  text-align: center !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  margin: 4px !important;
  border-radius: 8px !important;
  min-height: 50px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
}

.vuecal__event:hover {
  transform: translateY(-4px) scale(1.05) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.vuecal__cell {
  padding: 12px !important;
  min-height: 100px !important;
}

.responsive-calendar {
  height: 500px;
  width: 100%;
  color: black;
  background-color: rgba(255, 255, 255, 0.5);
}

.calendar-nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.nav-btn, .today-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 1rem;
}

.nav-btn {
  background: #e5e7eb;
  color: #000000;
  box-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(255, 255, 255, 0.15);
}

.today-btn {
  background: #223243;
  color: white;
}

.today-btn:hover {
  background: #223243;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(95, 171, 229, 0.4);
}

.mobile-text {
  display: none;
}

.desktop-text {
  display: inline;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
  padding: 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  padding: 2.5rem;
  border-radius: 24px;
  max-width: 550px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: slideUp 0.3s ease;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: #f3f4f6;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-content h3 {
  margin: 0 0 0.75rem 0;
  font-size: 2rem;
  color: #111827;
  font-weight: 700;
  padding-right: 2rem;
}

.modal-date {
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-radius: 12px;
  display: inline-block;
}

.modal-section {
  margin: 1.5rem 0;
}

.modal-section strong {
  display: block;
  margin-bottom: 0.75rem;
  color: black;
  font-size: 1.1rem;
  font-weight: 600;
}

.modal-section p {
  background: #547da7;
  padding: 1.25rem;
  border-radius: 16px;
  color: white;
  line-height: 1.6;
  margin: 0;
}

.status-completed {
  display: inline-block;
  padding: 0.625rem 1.25rem;
  background: #68b08f;
  color: #fff;
  border-radius: 12px;
  font-weight: 600;
   font-size: 1.1rem;
}

.status-pending {
  display: inline-block;
  padding: 0.625rem 1.25rem;
  background: #db7979;
  color: #fff;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem;
}

.container h2 {
  margin-bottom: 0.5rem;
}

.container > p {
  margin-bottom: 2rem;
}

/* 768px  */
@media (max-width: 768px) {
  .calendar-view {
    padding: 1rem;
  }

  .container {
    padding: 1.5rem;
    border-radius: 16px;
  }

  .container h2 {
    font-size: 1.75rem;
  }

  .container > p {
    font-size: 0.95rem;
  }

  .mobile-text {
    display: inline;
  }

  .desktop-text {
    display: none;
  }

  .nav-btn, .today-btn {
    padding: 0.625rem 1rem;
    font-size: 0.9rem;
  }

  .responsive-calendar {
    height: 400px !important;
  }

  .vuecal__event {
    padding: 8px 4px !important;
    min-height: 40px !important;
    font-size: 0.85rem !important;
  }

  .vuecal__cell {
    min-height: 80px !important;
    padding: 8px !important;
  }

  .modal-content {
    padding: 1.5rem;
    border-radius: 16px;
  }

  .modal-content h3 {
    font-size: 1.5rem;
  }

  .modal-section p {
    padding: 1rem;
    font-size: 0.95rem;
  }

  .status-completed,
  .status-pending {
    font-size: 1rem;
    padding: 0.5rem 1rem;
  }
}

/* 480px */
@media (max-width: 480px) {
  .calendar-view {
    padding: 0.5rem;
  }

  .container {
    padding: 1rem;
  }

  .container h2 {
    font-size: 1.5rem;
  }

  .calendar-nav {
    gap: 0.5rem;
  }

  .nav-btn, .today-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .responsive-calendar {
    height: 350px !important;
  }

  .vuecal__event {
    padding: 6px 4px !important;
    min-height: 35px !important;
    font-size: 0.75rem !important;
    margin: 2px !important;
  }

  .vuecal__cell {
    min-height: 70px !important;
    padding: 4px !important;
  }

  .modal-content {
    padding: 1.25rem;
  }

  .modal-content h3 {
    font-size: 1.25rem;
  }

  .modal-close {
    width: 32px;
    height: 32px;
    font-size: 1.5rem;
  }
}

@media (max-width: 360px) {
  .responsive-calendar {
    height: 300px !important;
  }

  .vuecal__event {
    font-size: 0.7rem !important;
    padding: 4px 2px !important;
  }
}
</style>