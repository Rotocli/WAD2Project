// src/services/timeService.js
// Centralized time management service for FishBit
// Supports both real time and simulated time (for developer testing)

class TimeService {
  constructor() {
    this.timeOffset = 0 // milliseconds to add to real time
    this.callbacks = [] // Functions to call when time jumps
    this.lastCheckDate = null // Track last daily check
    
    // Load saved offset from localStorage (persists across refreshes)
    const savedOffset = localStorage.getItem('fishbit_timeOffset')
    if (savedOffset) {
      this.timeOffset = parseInt(savedOffset, 10)
      console.log('⏰ Loaded time offset from storage:', this.timeOffset, 'ms')
    }
  }

  /**
   * Get current time (real or simulated)
   * @returns {Date} - Current date/time
   */
  now() {
    return new Date(Date.now() + this.timeOffset)
  }

  /**
   * Get today's date string (YYYY-MM-DD format)
   * @returns {string} - Today's date
   */
  getTodayString() {
    return this.now().toISOString().split('T')[0]
  }

  /**
   * Get yesterday's date string (YYYY-MM-DD format)
   * @returns {string} - Yesterday's date
   */
  getYesterdayString() {
    const yesterday = new Date(this.now())
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }

  /**
   * Get date string for N days ago
   * @param {number} daysAgo - Number of days in the past
   * @returns {string} - Date string
   */
  getDateString(daysAgo = 0) {
    const date = new Date(this.now())
    date.setDate(date.getDate() - daysAgo)
    return date.toISOString().split('T')[0]
  }

  /**
   * Fast forward time by hours (developer feature)
   * @param {number} hours - Hours to jump forward
   */
  fastForward(hours) {
    if (!hours || hours < 0) return
    
    const oldTime = this.now()
    this.timeOffset += hours * 60 * 60 * 1000
    const newTime = this.now()
    
    // Save to localStorage
    localStorage.setItem('fishbit_timeOffset', this.timeOffset.toString())
    
    console.log(`⏰ Fast-forwarded ${hours} hours`)
    console.log(`Old time: ${oldTime.toLocaleString()}`)
    console.log(`New time: ${newTime.toLocaleString()}`)
    
    // Calculate how many days were crossed
    const daysCrossed = this.calculateDaysCrossed(oldTime, newTime)
    
    // Trigger time jump callbacks
    this.triggerTimeJump(hours, daysCrossed)
  }

  /**
   * Calculate how many midnight crossings occurred
   * @param {Date} startTime - Start time
   * @param {Date} endTime - End time
   * @returns {number} - Number of days crossed
   */
  calculateDaysCrossed(startTime, endTime) {
    const startDay = startTime.toISOString().split('T')[0]
    const endDay = endTime.toISOString().split('T')[0]
    
    if (startDay === endDay) return 0
    
    // Calculate actual days crossed
    const timeDiff = endTime - startTime
    const daysCrossed = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    
    return daysCrossed > 0 ? daysCrossed : 1
  }

  /**
   * Reset time to real time (remove simulation)
   */
  resetToRealTime() {
    const hadOffset = this.timeOffset !== 0
    this.timeOffset = 0
    localStorage.removeItem('fishbit_timeOffset')
    
    if (hadOffset) {
      console.log('🔄 Time reset to real time')
      this.triggerTimeJump(0, 0)
    }
  }

  /**
   * Register a callback for time jump events
   * @param {Function} callback - Function to call (receives hours and days crossed)
   */
  onTimeJump(callback) {
    if (typeof callback === 'function') {
      this.callbacks.push(callback)
    }
  }

  /**
   * Trigger all registered time jump callbacks
   * @param {number} hoursJumped - Hours that were jumped
   * @param {number} daysCrossed - Number of days crossed
   */
  triggerTimeJump(hoursJumped, daysCrossed) {
    console.log(`🔔 Triggering ${this.callbacks.length} time jump callbacks`)
    console.log(`Hours jumped: ${hoursJumped}, Days crossed: ${daysCrossed}`)
    
    this.callbacks.forEach(callback => {
      try {
        callback(hoursJumped, daysCrossed)
      } catch (error) {
        console.error('Error in time jump callback:', error)
      }
    })
  }

  /**
   * Check if it's a new day since last check
   * @returns {boolean} - True if new day detected
   */
  isNewDay() {
    const today = this.getTodayString()
    
    if (this.lastCheckDate === null) {
      this.lastCheckDate = today
      return false
    }
    
    if (this.lastCheckDate !== today) {
      console.log('📅 New day detected!', `Last: ${this.lastCheckDate}, Today: ${today}`)
      this.lastCheckDate = today
      return true
    }
    
    return false
  }

  /**
   * Mark that we've done today's check
   */
  markDailyCheckDone() {
    this.lastCheckDate = this.getTodayString()
  }

  /**
   * Get formatted time offset for display
   * @returns {string} - Human readable offset
   */
  getOffsetString() {
    if (this.timeOffset === 0) return 'No offset (real time)'
    
    const hours = Math.floor(this.timeOffset / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    
    if (days > 0) {
      return `+${days}d ${remainingHours}h`
    }
    return `+${hours}h`
  }

  /**
   * Check if currently in simulated time
   * @returns {boolean}
   */
  isSimulated() {
    return this.timeOffset !== 0
  }
}

// Export singleton instance
export const timeService = new TimeService()

// Export utility functions
export function getCurrentTime() {
  return timeService.now()
}

export function getTodayString() {
  return timeService.getTodayString()
}

export function getYesterdayString() {
  return timeService.getYesterdayString()
}

