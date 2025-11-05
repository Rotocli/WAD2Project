<template>
  <div class="profile-view">
    <div class="container-fluid p-4">
      <h2 class="mb-4">Profile Settings</h2>
      
      <div class="settings-section">
        <h3>🔔 Notifications</h3>
        
        <div class="setting-item">
          <div class="setting-info">
            <p>Push notifications for habit reminders</p>
            <small v-if="fcmToken" class="text-success d-block">✅ Notifications enabled</small>
            <small v-else class="text-muted d-block">❌ Notifications disabled</small>
          </div>
          
          <div class="btn-group">
            <button 
              v-if="!fcmToken"
              @click="enableNotifications" 
              class="btn btn-primary"
            >
              Enable Notifications
            </button>
            <button 
              v-else
              @click="disableNotifications" 
              class="btn btn-danger"
            >
              Disable Notifications
            </button>
          </div>
        </div>

        <!-- test button -->
        <div v-if="fcmToken" class="setting-item">
          <div class="setting-info">
            <p>Test notifications</p>
            <small class="text-muted d-block">Send test notifications instantly</small>
          </div>
          
          <div class="btn-group">
            <button @click="sendTestNotification" class="btn btn-success">
              Simple Test
            </button>
            <button @click="sendHabitReminder" class="btn btn-warning">
              Habit Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { notificationService } from '../services/notificationService'
import { useUserStore } from '../stores/userStore'
import { useHabitStore } from '../stores/habitStore'

const userStore = useUserStore()
const habitStore = useHabitStore()
const fcmToken = ref(null)

onMounted(async () => {
  // load saved token
  if (userStore.currentUserId) {
    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('../services/firebase')
      
      const userDoc = await getDoc(doc(db, 'users', userStore.currentUserId))
      if (userDoc.exists() && userDoc.data().fcmToken) {
        fcmToken.value = userDoc.data().fcmToken
        console.log('✅ Loaded saved FCM token')
      }
    } catch (error) {
      console.error('Error loading token:', error)
    }
  }

  // foreground messages
  notificationService.onMessageListener().then((payload) => {
    console.log('Received foreground message:', payload)
    notificationService.sendNotification(
      payload.notification.title,
      { body: payload.notification.body }
    )
  })
})

async function enableNotifications() {
  const token = await notificationService.requestPermission()
  
  if (token) {
    fcmToken.value = token
    
    if (userStore.currentUserId) {
      await notificationService.saveTokenToFirestore(userStore.currentUserId, token)
    }
    
    notificationService.sendNotification('Notifications Enabled! 🎉', {
      body: 'You will now receive habit reminders'
    })
    
    alert('✅ Notifications enabled successfully!')
  } else {
    alert('❌ Failed to enable notifications. Please check your browser settings.')
  }
}

// disabling notifs 
async function disableNotifications() {
  if (!confirm('Are you sure you want to disable notifications?')) return;

  try {
    if (userStore.currentUserId) {
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('../services/firebase')

      await updateDoc(doc(db, 'users', userStore.currentUserId), {
        fcmToken: null
      })
      fcmToken.value = null
      console.log('✅ Firestore token cleared')
    }

    // disabling notifs -> unregister firebase service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
      if (registration) {
        await registration.unregister()
        console.log('🧹 Firebase service worker unregistered')
      }
    }

    // disabling notifs -> delete fcm token
    const { getMessaging, deleteToken } = await import('firebase/messaging')
    const messaging = getMessaging()
    await deleteToken(messaging)
    console.log('🧹 FCM token deleted from device')

    alert('Notifications have been fully disabled.')
  } catch (error) {
    console.error('Error disabling notifications:', error)
    alert('Error disabling notifications.')
  }
}

function sendTestNotification() {
  notificationService.sendNotification('🧪 Test Notification', {
    body: 'This is a test from your Habit Tracker app!',
    requireInteraction: true
  })
}

function sendHabitReminder() {
  notificationService.sendTestReminder(
    habitStore.activeHabits,
    habitStore.progress
  )
}
</script>

<style scoped>

.profile-view {
  min-height: calc(100vh - 70px);
  background: #f8f9fa;
}

.settings-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-section h3 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-info {
  flex: 1;
}

.setting-info p {
  margin: 0;
  font-weight: 500;
  font-size: 1rem;
}

.setting-info small {
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-group {
  display: flex;
  gap: 0.5rem;
}

.btn-group .btn {
  padding: 0.625rem 1.25rem;
  font-size: 0.9rem;
}
</style>