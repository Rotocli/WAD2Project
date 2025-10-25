// src/services/notificationService.js
import { messaging } from './firebase'
import { getToken, onMessage } from 'firebase/messaging'

export const notificationService = {
  _remindersScheduled: false,

  // Request permission and get FCM token
  async requestPermission() {
    try {
      if (!('Notification' in window)) {
        console.error('Browser does not support notifications')
        return null
      }

      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        console.log('Notification permission denied')
        return null
      }

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      console.log('✅ Service Worker registered:', registration)

      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
      })

      if (token) {
        console.log('✅ FCM Token:', token)
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

  hasPermission() {
    return Notification.permission === 'granted'
  },

  onMessageListener() {
    return new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        console.log('📩 Foreground message received:', payload)
        resolve(payload)
      })
    })
  },

  sendNotification(title, options = {}) {
    if (!this.hasPermission()) {
      console.warn('No notification permission')
      return
    }

    const notification = new Notification(title, {
      ...options
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    return notification
  },

  //put time for daily reminder
  scheduleDailyReminders(habits, progress) {
    // Prevent duplicate scheduling
    if (this._remindersScheduled) {
      console.log('⚠️ Reminders already scheduled, skipping...')
      return
    }

    // Set your reminder times here
    const reminderTimes = [
      { hour: 1, minute: 51 },  
      // { hour: 16, minute: 0 }, // 4:00 PM - PRODUCTION
      // { hour: 18, minute: 0 }  // 6:00 PM - PRODUCTION
    ]

    console.log('🔔 Setting up daily reminders...')

    reminderTimes.forEach(time => {
      const now = new Date()
      const reminderTime = new Date()
      reminderTime.setHours(time.hour, time.minute, 0, 0)

      let delay = reminderTime - now
      
      // If time already passed today, schedule for tomorrow
      if (delay <= 0) {
        reminderTime.setDate(reminderTime.getDate() + 1)
        delay = reminderTime - now
      }

      const delayMinutes = Math.floor(delay / 1000 / 60)
      console.log(`⏰ Reminder scheduled for ${reminderTime.toLocaleString()} (in ${delayMinutes} minutes)`)
      
      setTimeout(() => {
        console.log('🔔 Time to send scheduled reminder!')
        this.checkAndSendReminder(habits, progress)
        
        // Reschedule for next day
        setInterval(() => {
          console.log('🔔 Daily reminder triggered!')
          this.checkAndSendReminder(habits, progress)
        }, 24 * 60 * 60 * 1000)
      }, delay)
    })

    // Mark as scheduled
    this._remindersScheduled = true
    console.log('✅ Reminders scheduled successfully')
  },

  checkAndSendReminder(habits, progress) {
  console.log('🔍 Checking habits for reminder...');
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const todayDayOfWeek = today.getDay();

  // These are only habits active AND scheduled for TODAY
  const todaysHabits = habits.filter(h => {
    if (!h.isActive) return false;
    const createdAt = h.createdAt?.seconds
      ? new Date(h.createdAt.seconds * 1000)
      : new Date(h.createdAt);

    if (today < createdAt) return false;

    if (!h.repeat) {
      const createdDayKey = createdAt.toISOString().split('T')[0];
      return createdDayKey === todayString;
    }

    switch (h.frequency) {
      case 'daily': return true;
      case 'weekly': {
        const creationWeekday = createdAt.getDay();
        return todayDayOfWeek === creationWeekday;
      }
      case 'custom': {
        const daysSinceStart = Math.floor(
          (today - createdAt) / (1000 * 60 * 60 * 24)
        );
        return daysSinceStart >= 0 && daysSinceStart % h.customFrequency === 0;
      }
      default: return false;
    }
  });

  const totalHabits = todaysHabits.length;

  // Only counts progressed records for today, for habits in today's list, and only if completed
  const completedToday = todaysHabits.filter(habit => {
    return progress.some(p => {
      let progressDate;
      if (typeof p.date === 'string') {
        progressDate = p.date.split('T')[0];
      } else if (p.date?.seconds) {
        progressDate = new Date(p.date.seconds * 1000).toISOString().split('T')[0];
      } else {
        progressDate = new Date(p.date).toISOString().split('T')[0];
      }
      return (
        progressDate === todayString &&
        p.completed === true &&
        String(p.habitId) === String(habit.id)
      );
    });
  }).length;

  const remaining = totalHabits - completedToday;

  // Notification only if there's something left to do
  if (totalHabits > 0 && remaining > 0) {
    this.sendNotification('🔔 Habit Reminder', {
      body: `${completedToday}/${totalHabits} tasks done today! ${remaining} left to go! 💪`,
      requireInteraction: true,
      tag: 'habit-reminder-today'
    });
    console.log('✅ Reminder notification sent!');
  } else if (totalHabits > 0 && remaining === 0) {
    console.log('🎉 All habits completed - no reminder needed!');
  } else {
    console.log('ℹ️ No habits scheduled for today - skipping reminder');
  }
},

  // Manual test function
  sendTestReminder(habits, progress) {
    console.log('🧪 Sending test reminder now...')
    this.checkAndSendReminder(habits, progress)
  },

  // Save FCM token to Firestore
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