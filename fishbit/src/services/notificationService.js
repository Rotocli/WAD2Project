import { messaging } from './firebase'
import { getToken, onMessage } from 'firebase/messaging'

export const notificationService = {
  _remindersScheduled: false,

  async requestPermission() {
    try {
      if (!('Notification' in window)) {
        return null
      }

      const permission = await Notification.requestPermission()

      if (permission !== 'granted') {
        return null
      }

      let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')

      if (!registration) {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      }

      if (registration.installing || registration.waiting) {
        await new Promise((resolve) => {
          const worker = registration.installing || registration.waiting
          worker.addEventListener('statechange', (e) => {
            if (e.target.state === 'activated') {
              resolve()
            }
          })
        })
      }

      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
      })

      if (token) {
        return token
      } else {
        return null
      }
    } catch (error) {
      return null
    }
  },

  hasPermission() {
    return Notification.permission === 'granted'
  },

  onMessageListener() {
    return new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        resolve(payload)
      })
    })
  },

  sendNotification(title, options = {}) {
    if (!this.hasPermission()) {
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

  scheduleDailyReminders(habits, progress) {
    if (this._remindersScheduled) {
      return
    }

    const reminderTimes = [
      { hour: 18, minute: 0 },
    ]

    reminderTimes.forEach(time => {
      const now = new Date()
      const reminderTime = new Date()
      reminderTime.setHours(time.hour, time.minute, 0, 0)

      let delay = reminderTime - now

      if (delay <= 0) {
        reminderTime.setDate(reminderTime.getDate() + 1)
        delay = reminderTime - now
      }

      setTimeout(async () => {
        const { useHabitStore } = await import('../stores/habitStore')
        const habitStore = useHabitStore()

        const freshHabits = habitStore.activeHabits
        const freshProgress = habitStore.progress

        this.checkAndSendReminder(freshHabits, freshProgress)

        setInterval(async () => {
          const freshHabits = habitStore.activeHabits
          const freshProgress = habitStore.progress
          this.checkAndSendReminder(freshHabits, freshProgress)
        }, 24 * 60 * 60 * 1000)
      }, delay)
    })

    this._remindersScheduled = true
  },

  checkAndSendReminder(habits, progress) {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const todayDayOfWeek = today.getDay();

    const todaysHabits = habits.filter(h => {
      if (!h.isActive) {
        return false;
      }

      const createdAt = h.createdAt?.seconds
        ? new Date(h.createdAt.seconds * 1000)
        : new Date(h.createdAt);

      if (today < createdAt) {
        return false;
      }

      if (!h.repeat) {
        const createdDayKey = createdAt.toISOString().split('T')[0];
        const matches = createdDayKey === todayString;
        return matches;
      }

      switch (h.frequency) {
        case 'daily':
          return true;
        case 'weekly': {
          const creationWeekday = createdAt.getDay();
          const matches = todayDayOfWeek === creationWeekday;
          return matches;
        }
        case 'custom': {
          const daysSinceStart = Math.floor(
            (today - createdAt) / (1000 * 60 * 60 * 24)
          );
          const matches = daysSinceStart >= 0 && daysSinceStart % h.customFrequency === 0;
          return matches;
        }
        default:
          return false;
      }
    });

    const totalHabits = todaysHabits.length;

    const completedToday = todaysHabits.filter(habit => {
      const matchingProgress = progress.filter(p => {
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
          String(p.habitId) === String(habit.id)
        );
      });

      const isCompleted = matchingProgress.some(p => p.completed === true);

      return isCompleted;
    }).length;

    const remaining = totalHabits - completedToday;

    if (totalHabits > 0 && remaining > 0) {
      this.sendNotification('🔔 Habit Reminder', {
        body: `${completedToday}/${totalHabits} tasks done today! ${remaining} left to go! 💪`,
        requireInteraction: true,
        tag: 'habit-reminder-today',
        silent: false
      })
    }
  },

  sendTestReminder(habits, progress) {
    this.checkAndSendReminder(habits, progress)
  },

  async saveTokenToFirestore(userId, token) {
    try {
      const { db } = await import('./firebase')
      const { doc, setDoc } = await import('firebase/firestore')

      await setDoc(doc(db, 'users', userId), {
        fcmToken: token,
        tokenUpdatedAt: new Date()
      }, { merge: true })
    } catch (error) {
    }
  }
}