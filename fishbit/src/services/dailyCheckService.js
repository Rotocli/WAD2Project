// src/services/dailyCheckService.js
// Handles daily checks for streak breaks, habit resets, fish health, and time-based logic

import { timeService } from './timeService'
import { devLog, devWarn } from '@/utils/devUtils'
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore'
import { db } from './firebase'

class DailyCheckService {
  constructor() {
    this.isChecking = false
    this.lastCheckResult = null
  }

  /**
   * Main daily check function - runs all daily checks
   * @param {string} userId - Current user ID
   * @param {Object} habitStore - Habit store instance
   * @param {Object} userStore - User store instance
   * @param {Object} fishStore - Fish store instance (NEW)
   * @returns {Object} - Results of checks
   */
  async performDailyChecks(userId, habitStore, userStore, fishStore = null) {
    if (this.isChecking) {
      devWarn('Daily check already in progress, skipping...')
      return this.lastCheckResult
    }

    this.isChecking = true
    devLog('🔍 Starting daily checks...')

    try {
      const results = {
        timestamp: timeService.now().toISOString(),
        userStreakBroken: false,
        habitStreaksBroken: [],
        habitsChecked: 0,
        fishHealthChecked: 0,
        fishDied: [],
        errors: []
      }

      // Check if user's overall streak should break
      const userStreakCheck = await this.checkUserStreak(userId, userStore)
      results.userStreakBroken = userStreakCheck.broken
      
      // Check individual habit streaks
      const habitStreakCheck = await this.checkHabitStreaks(userId, habitStore)
      results.habitStreaksBroken = habitStreakCheck.brokenHabits
      results.habitsChecked = habitStreakCheck.totalChecked

      // ========================================
      // 🐟 NEW: CHECK FISH HEALTH
      // ========================================
      if (fishStore) {
        devLog('🐟 Checking fish health...')
        const fishHealthCheck = await this.checkFishHealth(userId, fishStore, habitStore)
        results.fishHealthChecked = fishHealthCheck.totalChecked
        results.fishDied = fishHealthCheck.fishDied
        devLog(`✅ Fish health check complete: ${fishHealthCheck.totalChecked} fish checked, ${fishHealthCheck.fishDied.length} died`)
      }

      this.lastCheckResult = results
      devLog('✅ Daily checks complete:', results)
      
      return results
    } catch (error) {
      console.error('❌ Error in daily checks:', error)
      return {
        error: error.message,
        timestamp: timeService.now().toISOString()
      }
    } finally {
      this.isChecking = false
    }
  }

  /**
   * Check if user's overall streak should break
   * User streak breaks if they didn't complete ANY habit yesterday
   * @param {string} userId - User ID
   * @param {Object} userStore - User store instance
   * @returns {Object} - Result of check
   */
  async checkUserStreak(userId, userStore) {
    try {
      const yesterday = timeService.getYesterdayString()
      const currentStreak = userStore.currentStreak
      
      devLog(`Checking user streak... Current: ${currentStreak}, Yesterday: ${yesterday}`)

      // If streak is already 0, nothing to break
      if (currentStreak === 0) {
        devLog('User streak already 0, skipping check')
        return { broken: false, reason: 'already_zero' }
      }

      // Check if user completed ANY habit yesterday
      const progressQuery = query(
        collection(db, 'progress'),
        where('userId', '==', userId),
        where('date', '==', yesterday),
        where('completed', '==', true)
      )

      const progressSnapshot = await getDocs(progressQuery)

      if (progressSnapshot.empty) {
        // User didn't complete anything yesterday - BREAK STREAK!
        devWarn(`💔 User streak broken! No habits completed on ${yesterday}`)
        await userStore.updateStreak(0)
        
        return { 
          broken: true, 
          previousStreak: currentStreak,
          reason: 'no_habits_completed',
          date: yesterday
        }
      }

      devLog(`✅ User streak intact (${progressSnapshot.size} habits completed yesterday)`)
      return { 
        broken: false, 
        habitsCompleted: progressSnapshot.size,
        reason: 'habits_completed'
      }

    } catch (error) {
      console.error('Error checking user streak:', error)
      return { broken: false, error: error.message }
    }
  }

  /**
   * Check all habits for streak breaks
   * @param {string} userId - User ID
   * @param {Object} habitStore - Habit store instance
   * @returns {Object} - Results of habit checks
   */
  async checkHabitStreaks(userId, habitStore) {
    try {
      const yesterday = timeService.getYesterdayString()
      const habits = habitStore.habits.filter(h => h.isActive && !h.isArchived)
      
      devLog(`Checking ${habits.length} active habits for streak breaks...`)

      const brokenHabits = []

      for (const habit of habits) {
        // Only check habits that have a streak to break
        if (!habit.currentStreak || habit.currentStreak === 0) continue

        // Check if this habit was supposed to occur yesterday
        const wasExpectedYesterday = this.wasHabitExpectedOnDate(habit, yesterday)
        
        if (!wasExpectedYesterday) {
          devLog(`Habit "${habit.name}" not expected on ${yesterday}, skipping`)
          continue
        }

        // Check if habit was completed yesterday
        const progressDoc = await getDoc(
          doc(db, 'progress', `${habit.id}_${yesterday}`)
        )

        if (!progressDoc.exists()) {
          // Habit was expected but not completed - BREAK STREAK!
          devWarn(`💔 Habit streak broken: "${habit.name}" (was ${habit.currentStreak})`)
          
          await this.breakHabitStreak(habit.id)
          
          brokenHabits.push({
            habitId: habit.id,
            habitName: habit.name,
            previousStreak: habit.currentStreak,
            date: yesterday
          })
        } else {
          devLog(`✅ Habit "${habit.name}" completed yesterday, streak safe`)
        }
      }

      return {
        totalChecked: habits.length,
        brokenHabits,
        timestamp: timeService.now().toISOString()
      }

    } catch (error) {
      console.error('Error checking habit streaks:', error)
      return {
        totalChecked: 0,
        brokenHabits: [],
        error: error.message
      }
    }
  }

  /**
   * Check if a habit was expected to occur on a specific date
   * @param {Object} habit - Habit object
   * @param {string} dateString - Date in YYYY-MM-DD format
   * @returns {boolean} - True if habit was expected
   */
  wasHabitExpectedOnDate(habit, dateString) {
    const date = new Date(dateString + 'T00:00:00')
    const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
    
    const createdAtDate = habit.createdAt?.seconds 
      ? new Date(habit.createdAt.seconds * 1000)
      : new Date(habit.createdAt)

    // If habit created after this date, it wasn't expected
    if (date < createdAtDate) return false

    // Non-repeating habits only expected on creation day
    if (habit.repeat === false) {
      const createdDay = createdAtDate.toISOString().split('T')[0]
      return createdDay === dateString
    }

    // Daily habits always expected
    if (habit.frequency === 'daily') return true

    // Weekly habits expected on specific days
    if (habit.frequency === 'weekly') {
      return habit.daysOfWeek?.includes(dayOfWeek) || false
    }

    // Custom frequency habits
    if (habit.frequency === 'custom' && habit.customFrequency) {
      const daysSinceCreation = Math.floor(
        (date - createdAtDate) / (1000 * 60 * 60 * 24)
      )
      return daysSinceCreation >= 0 && daysSinceCreation % habit.customFrequency === 0
    }

    return false
  }

  /**
   * Break a habit's streak
   * @param {string} habitId - Habit ID
   */
  async breakHabitStreak(habitId) {
    try {
      await updateDoc(doc(db, 'habits', habitId), {
        currentStreak: 0,
        lastStreakBreak: timeService.now()
      })
      devLog(`Streak broken for habit: ${habitId}`)
    } catch (error) {
      console.error('Error breaking habit streak:', error)
      throw error
    }
  }

  /**
   * NEW: Check health of all user's fish and mark dead ones
   * IMPORTANT: Excludes fish from archived habits (they should not lose health)
   * @param {string} userId - User ID
   * @param {Object} fishStore - Fish store instance
   * @param {Object} habitStore - Habit store instance (optional, for checking archived status)
   * @returns {Object} - Results of fish health checks
   */
  async checkFishHealth(userId, fishStore, habitStore = null) {
    console.log('🏥 [DAILY CHECK] Starting fish health check for user:', userId)
    
    try {
      // Get all alive fish for this user
      let aliveFish = fishStore.fish.filter(f => f.userId === userId && f.isAlive)
      
      // If habitStore provided, exclude fish from archived habits
      if (habitStore) {
        aliveFish = aliveFish.filter(fish => {
          const habit = habitStore.habits.find(h => h.id === fish.habitId)
          
          // Skip if habit is archived
          if (habit && habit.isArchived) {
            console.log(`⏸️ [DAILY CHECK] Skipping fish "${fish.customName}" - habit is archived`)
            return false
          }
          
          return true
        })
      }
      
      console.log(`🐠 [DAILY CHECK] Found ${aliveFish.length} alive fish with active habits to check`)

      const fishDied = []

      for (const fish of aliveFish) {
        const health = fishStore.calculateFishHealth(fish.lastFed, fish.createdAt)
        console.log(`🩺 [DAILY CHECK] Fish "${fish.customName}" health: ${health.toFixed(2)}%`)

        // If health is 0 or below, mark fish as dead
        if (health <= 0) {
          console.warn(`💀 [DAILY CHECK] Fish "${fish.customName}" has died from neglect!`)
          
          try {
            await updateDoc(doc(db, 'fish', fish.id), {
              isAlive: false,
              deathDate: timeService.now(),
              deathReason: 'starvation'
            })

            // Update local state
            const fishIndex = fishStore.fish.findIndex(f => f.id === fish.id)
            if (fishIndex !== -1) {
              fishStore.fish[fishIndex].isAlive = false
              fishStore.fish[fishIndex].deathDate = timeService.now()
              fishStore.fish[fishIndex].deathReason = 'starvation'
            }

            fishDied.push({
              fishId: fish.id,
              fishName: fish.customName,
              habitId: fish.habitId,
              lastFed: fish.lastFed,
              health: health
            })
          } catch (err) {
            console.error(`❌ [DAILY CHECK] Error marking fish ${fish.id} as dead:`, err)
          }
        } else if (health <= 20) {
          console.warn(`⚠️ [DAILY CHECK] Fish "${fish.customName}" is in critical condition! (${health.toFixed(2)}% health)`)
        } else {
          console.log(`✅ [DAILY CHECK] Fish "${fish.customName}" is healthy (${health.toFixed(2)}% health)`)
        }
      }

      return {
        totalChecked: aliveFish.length,
        fishDied,
        timestamp: timeService.now().toISOString()
      }

    } catch (error) {
      console.error('❌ [DAILY CHECK] Error checking fish health:', error)
      return {
        totalChecked: 0,
        fishDied: [],
        error: error.message
      }
    }
  }

  /**
   * Check for multiple missed days and handle accordingly
   * Useful when user hasn't opened app in days
   * @param {string} userId - User ID
   * @param {Object} habitStore - Habit store instance
   * @param {Object} userStore - User store instance
   * @param {Object} fishStore - Fish store instance (NEW)
   * @param {number} daysToCheck - Number of past days to check
   */
  async checkMultipleDays(userId, habitStore, userStore, fishStore = null, daysToCheck = 7) {
    devLog(`📅 Checking last ${daysToCheck} days for missed habits...`)
    
    const results = {
      daysChecked: daysToCheck,
      missedDays: [],
      streaksBroken: false,
      fishDied: []
    }

    // Check each day going backwards
    for (let i = 1; i <= daysToCheck; i++) {
      const checkDate = timeService.getDateString(i)
      
      // Check if any habits were completed on this day
      const progressQuery = query(
        collection(db, 'progress'),
        where('userId', '==', userId),
        where('date', '==', checkDate),
        where('completed', '==', true)
      )

      const progressSnapshot = await getDocs(progressQuery)
      
      if (progressSnapshot.empty) {
        results.missedDays.push(checkDate)
      }
    }

    // If there are consecutive missed days, break streaks
    if (results.missedDays.length > 0) {
      devWarn(`Found ${results.missedDays.length} missed days, breaking streaks`)
      
      // Break user streak
      if (userStore.currentStreak > 0) {
        await userStore.updateStreak(0)
        results.streaksBroken = true
      }

      // Break all habit streaks
      const habits = habitStore.habits.filter(h => h.currentStreak > 0)
      for (const habit of habits) {
        await this.breakHabitStreak(habit.id)
      }
    }

    // Check fish health after multiple days
    if (fishStore) {
      const fishHealthCheck = await this.checkFishHealth(userId, fishStore, habitStore)
      results.fishDied = fishHealthCheck.fishDied
    }

    return results
  }

  /**
   * Get summary of user's current status
   * @param {string} userId - User ID
   * @param {Object} habitStore - Habit store instance
   * @param {Object} fishStore - Fish store instance (NEW)
   * @returns {Object} - Status summary
   */
  async getUserStatus(userId, habitStore, fishStore = null) {
    const today = timeService.getTodayString()
    
    // Get today's habits
    const todaysHabits = habitStore.todaysHabits
    
    // Get today's completed habits
    const completedQuery = query(
      collection(db, 'progress'),
      where('userId', '==', userId),
      where('date', '==', today),
      where('completed', '==', true)
    )
    
    const completedSnapshot = await getDocs(completedQuery)
    
    const status = {
      date: today,
      totalHabits: todaysHabits.length,
      completedHabits: completedSnapshot.size,
      remainingHabits: todaysHabits.length - completedSnapshot.size,
      completionRate: todaysHabits.length > 0 
        ? Math.round((completedSnapshot.size / todaysHabits.length) * 100) 
        : 0
    }

    // Add fish statistics if fishStore provided
    if (fishStore) {
      const userFish = fishStore.fish.filter(f => f.userId === userId)
      const aliveFish = userFish.filter(f => f.isAlive)
      const criticalFish = aliveFish.filter(f => {
        const health = fishStore.calculateFishHealth(f.lastFed, f.createdAt)
        return health <= 20 && health > 0
      })

      status.totalFish = userFish.length
      status.aliveFish = aliveFish.length
      status.deadFish = userFish.length - aliveFish.length
      status.criticalFish = criticalFish.length
    }

    return status
  }
}

// Export singleton instance
export const dailyCheckService = new DailyCheckService()