// useUserStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../services/firebase'


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
  const isDeveloper = computed(() => userProfile.value?.isDeveloper === true) // ← NEW

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
        isDeveloper: false, // ← NEW: Default to false for new users
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

  async function loginWithGoogle() {
    try {
      error.value = null
      const credential = await signInWithPopup(auth, googleProvider)

      // Check if user profile exists, if not create one
      const userDocRef = doc(db, 'users', credential.user.uid)
      const userDocSnap = await getDoc(userDocRef)

      if (!userDocSnap.exists()) {
        // First time Google login - create profile
        const userDoc = {
          userId: credential.user.uid,
          email: credential.user.email,
          username: credential.user.displayName || 'User',
          createdAt: new Date(),
          totalPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          isDeveloper: false,
          preferences: {
            emailReminders: true,
            reminderTime: '09:00'
          }
        }
        await setDoc(userDocRef, userDoc)
        userProfile.value = userDoc
      } else {
        await fetchUserProfile(credential.user.uid)
      }

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
        
        // ← NEW: Log developer status for debugging
        if (userProfile.value?.isDeveloper) {
          console.log('🔧 Developer account detected:', userProfile.value.email)
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
    }
  }

  async function addPoints(points) {
  if (!currentUserId.value) return
  
  try {
    const newPoints = totalPoints.value + points
    await updateDoc(doc(db, 'users', currentUserId.value), {
      totalPoints: newPoints
    })
    userProfile.value.totalPoints = newPoints
    console.log(`💰 Added ${points} points. Total: ${newPoints}`)
  } catch (err) {
    console.error('Error adding points:', err)
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
  console.log("🔐 userStore: Initializing auth listener...")
  onAuthStateChanged(auth, async (firebaseUser) => {
    console.log("🔐 userStore: Auth state changed:", firebaseUser ? firebaseUser.uid : "No user")

    user.value = firebaseUser
    if (firebaseUser) {
      await fetchUserProfile(firebaseUser.uid)
      const { useHabitStore } = await import('./habitStore.js')
      const habitStore = useHabitStore()
      await habitStore.fetchHabits()
      await habitStore.fetchProgress(firebaseUser.uid)
      console.log("✅ userStore: All user data loaded")
    } else {
      userProfile.value = null
    }
    loading.value = false
  })
}



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
    isDeveloper, 
    
    // Actions
    login,
    register,
    loginWithGoogle,
    logout,
    fetchUserProfile,
    addPoints,
    updatePoints,
    updateStreak,
    initAuthListener
  }
})
