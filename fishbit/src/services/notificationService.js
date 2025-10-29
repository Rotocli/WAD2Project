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
      { hour: 18, minute: 0 },  // TEST TIME
    ]

    console.log('🔔 Setting up daily reminders...')

    reminderTimes.forEach(time => {
      const now = new Date()
      const reminderTime = new Date()
      reminderTime.setHours(time.hour, time.minute, 0, 0)

      let delay = reminderTime - now
      
      if (delay <= 0) {
        reminderTime.setDate(reminderTime.getDate() + 1)
        delay = reminderTime - now
      }

      const delayMinutes = Math.floor(delay / 1000 / 60)
      console.log(`⏰ Reminder scheduled for ${reminderTime.toLocaleString()} (in ${delayMinutes} minutes)`)
      
      setTimeout(async () => {  // ← MAKE THIS ASYNC
        console.log('🔔 Time to send scheduled reminder!')
        
        // ← FIX: FETCH FRESH DATA FROM STORES
        const { useHabitStore } = await import('../stores/habitStore')
        const habitStore = useHabitStore()
        
        // Get fresh habits and progress
        const freshHabits = habitStore.activeHabits
        const freshProgress = habitStore.progress
        
        console.log('🔄 Fetched fresh data:', {
          habits: freshHabits.length,
          progress: freshProgress.length
        })
        
        this.checkAndSendReminder(freshHabits, freshProgress)
        
        // Reschedule for next day
        setInterval(async () => {
          console.log('🔔 Daily reminder triggered!')
          const freshHabits = habitStore.activeHabits
          const freshProgress = habitStore.progress
          this.checkAndSendReminder(freshHabits, freshProgress)
        }, 24 * 60 * 60 * 1000)
      }, delay)
    })

    this._remindersScheduled = true
    console.log('✅ Reminders scheduled successfully')
  },

  checkAndSendReminder(habits, progress) {
    console.log('🔍 ========== CHECKING HABITS FOR REMINDER ==========');
    console.log('📋 ALL Habits received:', habits);
    console.log('📊 ALL Progress received:', progress);
    
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const todayDayOfWeek = today.getDay();
    
    console.log('📅 Today string:', todayString);
    console.log('📅 Today day of week:', todayDayOfWeek);

    // Filter today's habits
    const todaysHabits = habits.filter(h => {
      if (!h.isActive) {
        console.log(`  ❌ ${h.name} - not active`);
        return false;
      }
      
      const createdAt = h.createdAt?.seconds
        ? new Date(h.createdAt.seconds * 1000)
        : new Date(h.createdAt);

      if (today < createdAt) {
        console.log(`  ❌ ${h.name} - not started yet`);
        return false;
      }

      if (!h.repeat) {
        const createdDayKey = createdAt.toISOString().split('T')[0];
        const matches = createdDayKey === todayString;
        console.log(`  ${matches ? '✅' : '❌'} ${h.name} - one-time habit (${createdDayKey})`);
        return matches;
      }

      switch (h.frequency) {
        case 'daily':
          console.log(`  ✅ ${h.name} - daily habit`);
          return true;
        case 'weekly': {
          const creationWeekday = createdAt.getDay();
          const matches = todayDayOfWeek === creationWeekday;
          console.log(`  ${matches ? '✅' : '❌'} ${h.name} - weekly habit (day ${creationWeekday})`);
          return matches;
        }
        case 'custom': {
          const daysSinceStart = Math.floor(
            (today - createdAt) / (1000 * 60 * 60 * 24)
          );
          const matches = daysSinceStart >= 0 && daysSinceStart % h.customFrequency === 0;
          console.log(`  ${matches ? '✅' : '❌'} ${h.name} - custom habit (every ${h.customFrequency} days, ${daysSinceStart} days since start)`);
          return matches;
        }
        default:
          console.log(`  ❌ ${h.name} - unknown frequency`);
          return false;
      }
    });

    console.log('✅ TODAY\'S HABITS:', todaysHabits.map(h => h.name));
    const totalHabits = todaysHabits.length;

    // Check each habit's progress
    console.log('🔍 Checking progress for each habit:');
    const completedToday = todaysHabits.filter(habit => {
      console.log(`  Checking habit: ${habit.name} (ID: ${habit.id})`);
      
      const matchingProgress = progress.filter(p => {
        let progressDate;
        if (typeof p.date === 'string') {
          progressDate = p.date.split('T')[0];
        } else if (p.date?.seconds) {
          progressDate = new Date(p.date.seconds * 1000).toISOString().split('T')[0];
        } else {
          progressDate = new Date(p.date).toISOString().split('T')[0];
        }
        
        console.log(`    Progress entry: habitId=${p.habitId}, date=${progressDate}, completed=${p.completed}`);
        
        return (
          progressDate === todayString &&
          String(p.habitId) === String(habit.id)
        );
      });
      
      console.log(`    Found ${matchingProgress.length} progress entries for today`);
      
      const isCompleted = matchingProgress.some(p => p.completed === true);
      console.log(`    Final: ${isCompleted ? '✅ COMPLETED' : '❌ NOT COMPLETED'}`);
      
      return isCompleted;
    }).length;

    const remaining = totalHabits - completedToday;
    
    console.log('📊 ========== FINAL RESULTS ==========');
    console.log(`Total habits today: ${totalHabits}`);
    console.log(`Completed: ${completedToday}`);
    console.log(`Remaining: ${remaining}`);
    console.log('====================================');

    // Send notification
    if (totalHabits > 0 && remaining > 0) {
      this.sendNotification('🔔 Habit Reminder', {
        body: `${completedToday}/${totalHabits} tasks done today! ${remaining} left to go! 💪`,
        requireInteraction: true,
        tag: 'habit-reminder-today',
        silent: false
      })
      console.log('✅ Reminder notification sent!')
    } else if (totalHabits > 0 && remaining === 0) {
      console.log('🎉 All habits completed - no reminder needed!')
    } else {
      console.log('ℹ️ No habits scheduled for today')
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