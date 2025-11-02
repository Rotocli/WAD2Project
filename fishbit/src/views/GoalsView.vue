<template>
  <div class="goals-view">
    <div class="container-fluid p-4">
      <h2>🏆 Achievements</h2>
      <p>Track your progress and unlock badges!</p>

      <div class="stats-summary">
        <div class="stat-card">
          <span class="stat-number">{{ unlockedCount }}</span>
          <span class="stat-label">Unlocked</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ totalAchievements }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ progressPercentage }}%</span>
          <span class="stat-label">Complete</span>
        </div>
      </div>

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
    <transition name="fade">
      <div v-if="showCopyNotification" class="copy-notification">
        {{ shareMessage }}
      </div>
    </transition>

  </div>
</template>

<script setup>
import { useUserStore } from '../stores/userStore'
import { useHabitStore } from '../stores/habitStore'
import { computed, onMounted, ref, watch } from 'vue'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'


const userStore = useUserStore()
const habitStore = useHabitStore()
const userAchievements = ref({})

// Load user's unlocked achievements
onMounted(async () => {
  if (userStore.currentUserId) {
    await loadAchievements()
  }
})

async function loadAchievements() {
  try {
    const docRef = doc(db, 'achievements', userStore.currentUserId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      userAchievements.value = docSnap.data()
    }
  } catch (error) {
    console.error('Error loading achievements:', error)
  }
}

// Check and unlock achievements
async function checkAchievements() {
  if (!userStore.currentUserId) return

  const newUnlocks = []

  achievements.value.forEach(async (achievement) => {
    // If already unlocked, skip
    if (userAchievements.value[achievement.id]) return

    // If newly attained, unlock it
    if (achievement.attained) {
      newUnlocks.push(achievement.id)
      userAchievements.value[achievement.id] = {
        unlockedAt: new Date(),
        name: achievement.name
      }
    }
  })

  // Save to Firestore if there are new unlocks
  if (newUnlocks.length > 0) {
    try {
      await setDoc(
        doc(db, 'achievements', userStore.currentUserId),
        userAchievements.value,
        { merge: true }
      )
      console.log('🏆 New achievements unlocked:', newUnlocks)
    } catch (error) {
      console.error('Error saving achievements:', error)
    }
  }
}

// Watch for changes and check achievements
watch(
  () => [userStore.currentStreak, userStore.totalPoints, habitStore.habits],
  () => {
    checkAchievements()
  },
  { deep: true }
)

const achievements = computed(() => [
  {
    id: 'first-habit',
    name: 'Getting Started',
    description: 'Create your first habit',
    emoji: '🌱',
    attained: habitStore.habits.length >= 1,
    unlockedAt: userAchievements.value['first-habit']?.unlockedAt
  },
  {
    id: 'habit-5',
    name: 'Habit Builder',
    description: 'Create 5 habits',
    emoji: '🏗️',
    attained: habitStore.habits.length >= 5,
    unlockedAt: userAchievements.value['habit-5']?.unlockedAt
  },
  {
    id: 'first-complete',
    name: 'First Step',
    description: 'Complete your first habit',
    emoji: '✨',
    attained: habitStore.habits.some(h => h.completedCount >= 1),
    unlockedAt: userAchievements.value['first-complete']?.unlockedAt
  },
  {
    id: 'streak-3',
    name: 'On a Roll',
    description: 'Maintain a 3-day streak',
    emoji: '🔥',
    attained: userStore.currentStreak >= 3,
    unlockedAt: userAchievements.value['streak-3']?.unlockedAt
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    emoji: '⚡',
    attained: userStore.currentStreak >= 7,
    unlockedAt: userAchievements.value['streak-7']?.unlockedAt
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    emoji: '👑',
    attained: userStore.currentStreak >= 30,
    unlockedAt: userAchievements.value['streak-30']?.unlockedAt
  },
  {
    id: 'habit-50',
    name: 'Half Century',
    description: 'Complete any single habit 50 times',
    emoji: '💎',
    attained: habitStore.habits.some(h => h.completedCount >= 50),
    unlockedAt: userAchievements.value['habit-50']?.unlockedAt
  },
  {
    id: 'habit-100',
    name: 'Centurion',
    description: 'Complete any single habit 100 times',
    emoji: '🏆',
    attained: habitStore.habits.some(h => h.completedCount >= 100),
    unlockedAt: userAchievements.value['habit-100']?.unlockedAt
  },
  {
    id: 'points-100',
    name: 'Point Collector',
    description: 'Earn 100 total points',
    emoji: '💯',
    attained: userStore.totalPoints >= 100,
    unlockedAt: userAchievements.value['points-100']?.unlockedAt
  },
  {
    id: 'points-500',
    name: 'Point Hoarder',
    description: 'Earn 500 total points',
    emoji: '💰',
    attained: userStore.totalPoints >= 500,
    unlockedAt: userAchievements.value['points-500']?.unlockedAt
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete all habits before 9 AM',
    emoji: '🌅',
    attained: false, // TODO: Implement time tracking
    unlockedAt: userAchievements.value['early-bird']?.unlockedAt
  },
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'Complete all daily habits for 7 days straight',
    emoji: '⭐',
    attained: false, // TODO: Implement tracking
    unlockedAt: userAchievements.value['perfect-week']?.unlockedAt
  },
])

const unlockedCount = computed(() => 
  achievements.value.filter(a => a.attained).length
)

const totalAchievements = computed(() => achievements.value.length)

const progressPercentage = computed(() => 
  Math.round((unlockedCount.value / totalAchievements.value) * 100)
)

</script>

<style scoped>
.goals-view {
  min-height: calc(100vh - 70px);
  background: #f8f9fa;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  display: block;
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 0.5rem;
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
  border-radius: 12px;
  padding: 20px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  opacity: 0.5;
  transition: all 0.3s;
  border-left: 6px solid #e5e7eb;
  position: relative;
}

.achievement-row.attained {
  opacity: 1;
  border-left: 6px solid #10b981;
  transform: scale(1);
}

.achievement-row.attained:hover {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.emoji {
  font-size: 2.5rem;
  width: 3rem;
  flex-shrink: 0;
  margin-right: 1.5rem;
  filter: grayscale(100%);
  transition: filter 0.3s;
}

.achievement-row.attained .emoji {
  filter: grayscale(0%);
}

.info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.title {
  font-weight: 700;
  font-size: 1.2rem;
  color: #111827;
}

.desc {
  color: #6b7280;
  margin-top: 4px;
  font-size: 0.95rem;
}

.unlocked-date {
  color: #10b981;
  font-size: 0.85rem;
  margin-top: 6px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .stats-summary {
    grid-template-columns: 1fr;
  }

  .emoji {
    font-size: 2rem;
    width: 2.5rem;
  }

  .title {
    font-size: 1rem;
  }

  .achievement-row {
    padding: 16px 12px;
  }
}

/* Add to your <style scoped> */

.achievement-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
  margin-right: 1rem;
}

.share-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.share-btn:active {
  transform: translateY(0);
}

.copy-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #10b981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
  z-index: 9999;
  font-weight: 600;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive */
@media (max-width: 768px) {
  .achievement-row {
    flex-wrap: wrap;
  }

}
</style>