import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'


export const useUserStore = defineStore('user', () => {
  // State
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const userProfile = ref(null)

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const currentUserId = computed(() => user.value?.uid || null)
  const totalPoints = computed(() => userProfile.value?.totalPoints || 0)
  const currentStreak = computed(() => userProfile.value?.currentStreak || 0)

  // Actions
  async function login(email, password) {
    try {
      error.value = null
      const credential = await signInWithEmailAndPassword(auth, email, password)
      await fetchUserProfile(credential.user.uid)
      return credential.user
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function register(email, password, username) {
    try {
      error.value = null
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user profile in Firestore
      const userDoc = {
        userId: credential.user.uid,
        email: email,
        username: username,
        createdAt: new Date(),
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        preferences: {
          emailReminders: true,
          reminderTime: '09:00'
        }
      }
      
      await setDoc(doc(db, 'users', credential.user.uid), userDoc)
      userProfile.value = userDoc
      
      return credential.user
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function logout() {
    try {
      await signOut(auth)
      user.value = null
      userProfile.value = null
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function fetchUserProfile(uid) {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        userProfile.value = docSnap.data()
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
    }
  }

  async function updatePoints(points) {
    if (!currentUserId.value) return
    
    try {
      const newPoints = totalPoints.value + points
      await updateDoc(doc(db, 'users', currentUserId.value), {
        totalPoints: newPoints
      })
      userProfile.value.totalPoints = newPoints
    } catch (err) {
      console.error('Error updating points:', err)
    }
  }

  async function updateStreak(newStreak) {
    if (!currentUserId.value) return
    
    try {
      const updates = {
        currentStreak: newStreak
      }
      
      // Update longest streak if necessary
      if (newStreak > (userProfile.value?.longestStreak || 0)) {
        updates.longestStreak = newStreak
      }
      
      await updateDoc(doc(db, 'users', currentUserId.value), updates)
      Object.assign(userProfile.value, updates)
    } catch (err) {
      console.error('Error updating streak:', err)
    }
  }

  // Initialize auth listener
  function initAuthListener() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid)
        const { useHabitStore } = await import('./habitStore.js')
        const habitStore = useHabitStore()

      
        await habitStore.fetchHabits()
      } else {
        userProfile.value = null
      }
      loading.value = false
    })
  }
  // TEMPORARY: Mock user for development
  user.value = { uid: 'mock-user-123', email: 'test@example.com' }
  userProfile.value = {
    username: 'TestUser',
    totalPoints: 250,
    currentStreak: 5,
    longestStreak: 15,
    email: 'test@example.com'
  }
  loading.value = false

  return {
    // State
    user,
    loading,
    error,
    userProfile,
    
    // Computed
    isAuthenticated,
    currentUserId,
    totalPoints,
    currentStreak,
    
    // Actions
    login,
    register,
    logout,
    fetchUserProfile,
    updatePoints,
    updateStreak,
    initAuthListener
  }
})
