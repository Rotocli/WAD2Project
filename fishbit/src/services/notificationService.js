// src/services/notificationService.js

export const notificationService = {
  // Request permission from user
  async requestPermission() {
    if (!('Notification' in window)) {
      console.error('Browser does not support notifications')
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  },

  // Check if we have permission
  hasPermission() {
    return Notification.permission === 'granted'
  },

  // Send a notification
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

  // Schedule a habit reminder
  scheduleHabitReminder(habit, time) {
    const now = new Date()
    const reminderTime = new Date(time)
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
  }
}