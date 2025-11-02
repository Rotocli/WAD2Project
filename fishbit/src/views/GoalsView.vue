<template>
  <div class="goals-view">
    <div class="container-fluid p-4">
      <h2>Goals</h2>
      <p>View your badges below!</p>

      <div class="achievement-list">
        <div
          v-for="achievement in achievements"
          :key="achievement.id"
          class="achievement-row"
          :class="{ attained: achievement.attained }"
        >
          <span class="emoji">{{ achievement.emoji }}</span>
          <div class="info">
            <div class="title">{{ achievement.name }}</div>
            <div class="desc">{{ achievement.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Example imports; update to your actual paths
import { useUserStore } from '../stores/userStore'
import { useHabitStore } from '../stores/habitStore'
import { computed } from 'vue'

const userStore = useUserStore()
const habitStore = useHabitStore()

const achievements = computed(() => [
  {
    id: 'week-streak',
    name: 'Week Streak',
    description: 'Log in for 7 days in a row',
    emoji: '🔥',
    attained: userStore.streak >= 7,
  },
  {
    id: 'habit-century',
    name: 'Habit Hunter',
    description: 'Complete any single habit 100 times',
    emoji: '🏆',
    attained: habitStore.habits.some(h => h.completedCount >= 100),
  },
  {
    id: 'all-in-week',
    name: 'All-Star Routine',
    description: 'Complete every habit tracked each day for one week',
    emoji: '⭐',
    attained: habitStore.didAllHabitsForAWeek, // Example; tweak using your store logic
  },
  // ... add more
])
</script>

<style scoped>
.goals-view {
  min-height: calc(100vh - 70px);
  background: #f8f9fa;
}
.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.achievement-row {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 8px;
  padding: 20px 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.03);
  opacity: 0.55;
  transition: opacity 0.2s, border-color 0.2s;
  border-left: 6px solid transparent;
}
.achievement-row.attained {
  opacity: 1;
  border-left: 6px solid #4caf50;
}
.emoji {
  font-size: 2rem;
  width: 2.5rem;
  flex-shrink: 0;
  margin-right: 1.5rem;
}
.info {
  display: flex;
  flex-direction: column;
}
.title {
  font-weight: 600;
  font-size: 1.1rem;
}
.desc {
  color: #666;
  margin-top: 3px;
}
</style>
