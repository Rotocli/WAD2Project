<template>
  <div id="app">
    <!-- Developer Mode Banner - Shows at top for dev accounts -->
    <DeveloperBadge />
    
    <NavBar v-if="isAuthenticated" />
    <main class="main-content" :class="{ 'dev-mode': userStore.isDeveloper }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- Time Machine - Only visible for developer accounts -->
    <TimeMachine />
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

/**
 * Perform daily checks for streak breaks and resets
 */
async function performDailyChecks() {
  if (!userStore.currentUserId) return
  
  devLog('🔍 Checking if daily checks needed...')
  
  // Check if it's a new day since last check
  if (timeService.isNewDay()) {
    devLog('📅 New day detected! Running daily checks...')
    
    try {
      const results = await dailyCheckService.performDailyChecks(
        userStore.currentUserId,
        habitStore,
        userStore
      )
      
      devLog('✅ Daily check results:', results)
      
      // Show notification if streaks were broken (optional)
      if (results.userStreakBroken) {
        console.log('💔 Your streak was broken due to inactivity')
      }
      
      if (results.habitStreaksBroken.length > 0) {
        console.log(`💔 ${results.habitStreaksBroken.length} habit streak(s) broken`)
      }
      
      // Mark that we've done today's check
      timeService.markDailyCheckDone()
      
      // Refresh habit data
      await habitStore.fetchHabits()
      
    } catch (error) {
      console.error('Error performing daily checks:', error)
    }
  } else {
    devLog('ℹ️ Already checked today, skipping daily checks')
  }
}

/**
 * Check for multiple missed days (when user returns after being away)
 */
async function checkMultipleMissedDays() {
  if (!userStore.currentUserId) return
  
  const lastCheckDate = localStorage.getItem('fishbit_lastCheckDate')
  const today = timeService.getTodayString()
  
  if (!lastCheckDate) {
    // First time - just mark today
    localStorage.setItem('fishbit_lastCheckDate', today)
    return
  }
  
  // Calculate days since last check
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
      
      if (results.streaksBroken) {
        console.log(`💔 Streaks reset due to ${results.missedDays.length} missed day(s)`)
      }
      
      // Refresh data
      await habitStore.fetchHabits()
      await userStore.fetchUserProfile(userStore.currentUserId)
      
    } catch (error) {
      console.error('Error checking multiple missed days:', error)
    }
  }
  
  // Update last check date
  localStorage.setItem('fishbit_lastCheckDate', today)
}

/**
 * Register time jump callback for Time Machine
 */
function setupTimeJumpCallback() {
  timeService.onTimeJump(async (hoursJumped, daysCrossed) => {
    devLog(`⏰ Time jump detected: ${hoursJumped}h (${daysCrossed} days crossed)`)
    
    if (daysCrossed > 0) {
      // Time jumped across day boundary - run daily checks
      devLog('Running daily checks due to time jump...')
      
      // Simulate each day that was crossed
      for (let i = 0; i < daysCrossed; i++) {
        await performDailyChecks()
      }
      
      // Refresh all data
      await habitStore.fetchHabits()
      await userStore.fetchUserProfile(userStore.currentUserId)
    }
  })
}

onMounted(() => {
  // Initialize auth listener
  userStore.initAuthListener()
  
  // Set up time jump callback for Time Machine integration
  setupTimeJumpCallback()
  
  // Watch for authentication and perform checks when user logs in
  watch(
    () => userStore.currentUserId,
    async (userId) => {
      if (userId) {
        devLog('User authenticated, performing initial checks...')
        
        // Wait a bit for stores to initialize
        setTimeout(async () => {
          // Check for multiple missed days first
          await checkMultipleMissedDays()
          
          // Then perform daily checks
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-content {
  padding-top: 70px; /* Standard navbar height */
  min-height: calc(100vh - 70px);
  transition: padding-top 0.3s ease;
}

/* Add extra padding when developer banner is shown */
.main-content.dev-mode {
  padding-top: 106px; /* 70px nav + 36px dev banner */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
