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
import { ref, computed, onMounted, watch } from 'vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'

import { useUserStore } from '../stores/userStore'
import { useHabitStore } from '../stores/habitStore'

const userStore = useUserStore()
const habitStore = useHabitStore()

// generate up to one year of events
const DAYS_TO_GENERATE = 365

// fetch habits + progress when mounted
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

// computed list of active habits
const habits = computed(() => habitStore.activeHabits || [])

// generate events based on habits & progress
function generateEventsFromHabits(habits, progress = []) {
  const events = []
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay()) // start from Sunday

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

// reactive computed events
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

console.log(calendarEvents.value?.find(e => e.title === 'mewing') || calendarEvents.value?.[0])

</script>

<style>
/* These penetrate VueCal’s shadow DOM & dynamic class generation */

.vuecal__event.habit-completed,
.vuecal__event--habit-completed {
  background-color: #a8f0a3 !important; /* green */
  color: #000 !important;

}

.vuecal__event.habit-pending,
.vuecal__event--habit-pending {
  background-color: #f8c0c0 !important; /* red */
  color: #000 !important;
}

/* optional cosmetics */
.vuecal__event {
  padding: 4px 6px !important;
  text-align: center !important;
  font-weight: 600 !important;
}
</style>

