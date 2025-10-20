// src/services/notificationService.js
import { messaging } from './firebase'
import { getToken, onMessage } from 'firebase/messaging'

export const notificationService = {
  // Request permission and get FCM token
  async requestPermission() {
    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.error('Browser does not support notifications')
        return null
      }

      // Request notification permission
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        console.log('Notification permission denied')
        return null
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      console.log('✅ Service Worker registered:', registration)

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
      })

      if (token) {
        console.log('✅ FCM Token:', token)
        // TODO: Save this token to Firestore for the user
        // You'll need this to send notifications from backend
        return token
      } else {
        console.log('No registration token available')
        return null
      }
    } catch (error) {
      console.error('Error getting permission/token:', error)
      return null
    }
  },

  // Check if we have permission
  hasPermission() {
    return Notification.permission === 'granted'
  },

  // Listen for foreground messages (when app is open)
  onMessageListener() {
    return new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        console.log('📩 Foreground message received:', payload)
        resolve(payload)
      })
    })
  },

  // Send a local notification (still works for testing)
  sendNotification(title, options = {}) {
    if (!this.hasPermission()) {
      console.warn('No notification permission')
      return
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    return notification
  },

  // Schedule a habit reminder (local - for now)
  scheduleHabitReminder(habit, time) {
    const now = new Date()
    const testTime = new Date(now.getTime() + 1 * 60000) 
    
    const reminderTimes = [
  { hour: testTime.getHours(), minute: testTime.getMinutes() }
  ]

    const delay = reminderTime - now

    if (delay > 0) {
      setTimeout(() => {
        this.sendNotification(`Time for: ${habit.name}`, {
          body: habit.description || 'Complete your habit!',
          tag: `habit-${habit.id}`,
          requireInteraction: true
        })
      }, delay)
    }
  },
  
// FOR TESTING: Set reminder 2 minutes from now
scheduleDailyReminders(habits, progress) {
  // TEST MODE: Schedule for 2 minutes from now
  const now = new Date()
  const testTime = new Date(now.getTime() + 2 * 60000) // 2 minutes from now
  
  const reminderTimes = [
    { hour: testTime.getHours(), minute: testTime.getMinutes() }
    // For production, use:
    // { hour: 16, minute: 0 }, // 4:00 PM
    // { hour: 18, minute: 0 }  // 6:00 PM
  ]

  console.log(`🔔 Setting up reminders for ${testTime.toLocaleTimeString()}`)

  reminderTimes.forEach(time => {
    const now = new Date()
    const reminderTime = new Date()
    reminderTime.setHours(time.hour, time.minute, 0, 0)

    let delay = reminderTime - now
    
    if (delay <= 0) {
      reminderTime.setDate(reminderTime.getDate() + 1)
      delay = reminderTime - now
    }

    const delaySeconds = Math.floor(delay / 1000)
    console.log(`⏰ Next reminder in ${delaySeconds} seconds`)
    
    setTimeout(() => {
      console.log('🔔 Sending scheduled reminder!')
      this.checkAndSendReminder(habits, progress)
      
      // Reschedule for next day
      setInterval(() => {
        console.log('🔔 Sending scheduled reminder!')
        this.checkAndSendReminder(habits, progress)
      }, 24 * 60 * 60 * 1000)
    }, delay)
  })
},

sendTestReminder(habits, progress) {
    console.log('🧪 Sending test reminder now...')
    this.checkAndSendReminder(habits, progress)
  },

  checkAndSendReminder(habits, progress) {
    console.log('🔍 Checking habits for reminder...')
    
    const today = new Date().toISOString().split('T')[0]
    
    // Filter active habits
    const activeHabits = habits.filter(h => h.isActive)
    const totalHabits = activeHabits.length
    
    // Count completed habits today
    const completedToday = progress.filter(
      p => p.date === today && p.completed && activeHabits.some(h => h.id === p.habitId)
    ).length

    console.log(`📊 Progress: ${completedToday}/${totalHabits} habits completed`)

    // ONLY send if some habits are NOT done
    if (completedToday < totalHabits && totalHabits > 0) {
      const remaining = totalHabits - completedToday
      this.sendNotification('🔔 Habit Reminder', {
        body: `${completedToday}/${totalHabits} tasks done today! ${remaining} left to go! 💪`,
        requireInteraction: true
      })
      console.log('✅ Reminder sent!')
    } else if (totalHabits === 0) {
      console.log('ℹ️ No active habits - no reminder needed')
    } else {
      console.log('✅ All habits complete - no reminder needed')
    }
  },

  // Save FCM token to user's Firestore document
  async saveTokenToFirestore(userId, token) {
    try {
      const { db } = await import('./firebase')
      const { doc, setDoc } = await import('firebase/firestore')
      
      await setDoc(doc(db, 'users', userId), {
        fcmToken: token,
        tokenUpdatedAt: new Date()
      }, { merge: true })
      
      console.log('✅ FCM token saved to Firestore')
    } catch (error) {
      console.error('❌ Error saving token:', error)
    }
  }
}