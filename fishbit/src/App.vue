<template>
  <div id="app">
    <DeveloperBadge />

    <NavBar v-if="isAuthenticated" />
    <main class="main-content" :class="{ 'dev-mode': userStore.isDeveloper }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <TimeMachine />

    <div v-if="userStore.loading" class="loading-screen">
      <div class="loading-content">
         <div class="loading-fish">
          <span class="fish">🐠</span>
          <span class="fish">🐟</span>
          <span class="fish">🐡</span>
          </div>
          <h2 class="loading-title">Habit Aquarium</h2>
          <p class="loading-text">Setting up your tank...</p>

          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
            </div>
          </div>
        </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useUserStore } from './stores/userStore'
import { useHabitStore } from './stores/habitStore'
import NavBar from './components/common/NavBar.vue'
import DeveloperBadge from './components/developer/DeveloperBadge.vue'
import TimeMachine from './components/developer/TimeMachine.vue'
import { timeService } from './services/timeService'
import { dailyCheckService } from './services/dailyCheckService'
import { devLog } from './utils/devUtils'

const userStore = useUserStore()
const habitStore = useHabitStore()
const isAuthenticated = computed(() => userStore.isAuthenticated)

async function performDailyChecks() {
  if (!userStore.currentUserId) return

  devLog('🔍 Checking if daily checks needed...')

  if (timeService.isNewDay()) {
    devLog('📅 New day detected! Running daily checks...')

    try {
      const results = await dailyCheckService.performDailyChecks(
        userStore.currentUserId,
        habitStore,
        userStore
      )

      devLog('✅ Daily check results:', results)

      timeService.markDailyCheckDone()
      await habitStore.fetchHabits()

    } catch (error) {
      devLog('Error performing daily checks:', error)
    }
  } else {
    devLog('ℹ️ Already checked today, skipping daily checks')
  }
}

async function checkMultipleMissedDays() {
  if (!userStore.currentUserId) return

  const lastCheckDate = localStorage.getItem('fishbit_lastCheckDate')
  const today = timeService.getTodayString()

  if (!lastCheckDate) {
    localStorage.setItem('fishbit_lastCheckDate', today)
    return
  }

  const lastDate = new Date(lastCheckDate)
  const currentDate = new Date(today)
  const daysSinceLastCheck = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24))

  if (daysSinceLastCheck > 1) {
    devLog(`⚠️ User hasn't opened app in ${daysSinceLastCheck} days, checking for missed habits...`)

    try {
      const results = await dailyCheckService.checkMultipleDays(
        userStore.currentUserId,
        habitStore,
        userStore,
        daysSinceLastCheck
      )

      devLog('Multiple days check results:', results)

      await habitStore.fetchHabits()
      await userStore.fetchUserProfile(userStore.currentUserId)

    } catch (error) {
      devLog('Error checking multiple missed days:', error)
    }
  }

  localStorage.setItem('fishbit_lastCheckDate', today)
}

function setupTimeJumpCallback() {
  timeService.onTimeJump(async (hoursJumped, daysCrossed) => {
    devLog(`⏰ Time jump detected: ${hoursJumped}h (${daysCrossed} days crossed)`)

    if (daysCrossed > 0) {
      devLog('Running daily checks due to time jump...')

      for (let i = 0; i < daysCrossed; i++) {
        await performDailyChecks()
      }

      await habitStore.fetchHabits()
      await userStore.fetchUserProfile(userStore.currentUserId)
    }
  })
}

onMounted(() => {
  userStore.initAuthListener()
  setupTimeJumpCallback()

  watch(
    () => userStore.currentUserId,
    async (userId) => {
      if (userId) {
        devLog('User authenticated, performing initial checks...')

        setTimeout(async () => {
          await checkMultipleMissedDays()
          await performDailyChecks()
        }, 1000)
      }
    },
    { immediate: true }
  )
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background: none;
  padding: 0;
  border: none;
}

.main-content {
  padding-top: 54px; 
  min-height: calc(100vh - 70px);
  transition: padding-top 0.3s ease;
  background: none;
  border: none;
}

/* Add extra padding when developer banner is shown */
.main-content.dev-mode {
  padding-top: 106px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #547da7;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
  }

.loading-content {
  text-align: center;
  color: white;
  }

.loading-fish {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  font-size: 3rem;
  }

.fish {
  animation: swim 2s ease-in-out infinite;
  display: inline-block;
}

.fish:nth-child(1) {
  animation-delay: 0s;
  }

.fish:nth-child(2) {
  animation-delay: 0.3s;
  }

.fish:nth-child(3) {
  animation-delay: 0.6s;
  }
  </style>
