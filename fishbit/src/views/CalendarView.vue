<!-- src/views/CalendarView.vue -->
<template>
  <div class="calendar-view">
    <div class="container">
      <h2>Habit Calendar</h2>
      <p>Track your habits below:</p>

      <VueCal
        default-view="week"
        :time="false"
        :events="calendarEvents"
        :disable-views="['day', 'year', 'years']"
        style="height: 500px;"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'

import { useUserStore } from '../stores/userStore'
import { useHabitStore } from '../stores/habitStore'

const userStore = useUserStore()
const habitStore = useHabitStore()

onMounted(async () => {
  if (userStore.currentUserId) {
    habitStore.fetchHabits(userStore.currentUserId)
  }
})

const habits = computed(() => habitStore.activeHabits)

function generateEventsFromHabits(habits) {
  const events = []
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday

  habits.forEach(habit => {
    if (!habit.isActive) return

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek)
      currentDate.setDate(startOfWeek.getDate() + i)

      const createdAt = habit.createdAt?.seconds
        ? new Date(habit.createdAt.seconds * 1000)
        : new Date(habit.createdAt)

      let shouldShow = false

      switch (habit.frequency) {
        case 'daily':
          shouldShow = true
          break

        case 'weekly': {
          const creationWeekday = createdAt.getDay()
          if (currentDate.getDay() === creationWeekday) {
            shouldShow = true
          }
          break
        }

        case 'custom': {
          const daysSinceStart = Math.floor((currentDate - createdAt) / (1000 * 60 * 60 * 24))
          if (daysSinceStart >= 0 && daysSinceStart % habit.customFrequency === 0) {
            shouldShow = true
          }
          break
        }
      }

      if (shouldShow) {
        events.push({
          start: new Date(currentDate),
          end: new Date(currentDate),
          title: habit.name,
          class: habit.name.toLowerCase().replace(/\s+/g, "-"),
          background: "#d3f9d8"
        })
      }
    }
  })

  return events
}

const calendarEvents = computed(() => generateEventsFromHabits(habits.value))
</script>

<style scoped>
.calendar-view {
  min-height: calc(100vh - 70px);
  background: #f8f9fa;
  padding: 1rem;
}

.container {
  max-width: 1000px;
  margin: auto;
}

h2 {
  margin-bottom: 0.5rem;
}
</style>
