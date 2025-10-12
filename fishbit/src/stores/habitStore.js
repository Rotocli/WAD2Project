import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useUserStore } from './userStore'

export const useHabitStore = defineStore('habit', () => {
  // State
  const habits = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedHabit = ref(null)

  // Computed
  const activeHabits = computed(() => 
    habits.value.filter(h => h.isActive)
  )


  const habitsByFrequency = computed(() => {
    const grouped = {
      daily: [],
      weekly: [],
      custom: []
    }
    
    habits.value.forEach(habit => {
      if (grouped[habit.frequency]) {
        grouped[habit.frequency].push(habit)
      }
    })
    
    return grouped
  })

  const todaysHabits = computed(() => {
    const today = new Date().getDay()
    const todayDate=new Date()
    return habits.value.filter(habit => {
        
      if (habit.repeat===false){
        if (!habit.lastCompleted){
          return true
        }
      }
      if (habit.frequency === 'daily') return true
      if (habit.frequency === 'weekly' && habit.daysOfWeek?.includes(today)) return true
      if (habit.frequency==='custom'){
        const createdAtDate = habit.createdAt.seconds 
        ? new Date(habit.createdAt.seconds * 1000)
        : new Date(habit.createdAt)

        // Calculate number of days since creation
        const diffTime = todayDate - createdAtDate
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        // Check if today is a multiple of customFrequency
        if (diffDays % habit.customFrequency === 0) return true




      }
      
      return false
    })
  })

  // Actions
  async function fetchHabits() {
    const userStore = useUserStore()
    if (!userStore.currentUserId) return

    loading.value = true
    error.value = null

    try {
      const q = query(
        collection(db, 'habits'),
        where('userId', '==', userStore.currentUserId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      habits.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      error.value = err.message
      console.error('Error fetching habits:', err)
    } finally {
      loading.value = false
    }
  }

  async function createHabit(habitData) {
    const userStore = useUserStore()
    if (!userStore.currentUserId) return

    loading.value = true
    error.value = null

    try {
      const newHabit = {
        ...habitData,
        userId: userStore.currentUserId,
        createdAt: new Date(),
        isActive: true,
        currentStreak: 0,
        bestStreak: 0,
        completedCount: 0,
        lastCompleted: null
      }

      const docRef = doc(collection(db, 'habits'))
      await setDoc(docRef, newHabit)
      
      habits.value.unshift({
        id: docRef.id,
        ...newHabit
      })

      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateHabit(habitId, updates) {
    loading.value = true
    error.value = null

    try {
      await updateDoc(doc(db, 'habits', habitId), updates)
      
      const index = habits.value.findIndex(h => h.id === habitId)
      if (index !== -1) {
        habits.value[index] = { ...habits.value[index], ...updates }
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteHabit(habitId) {
    loading.value = true
    error.value = null

    try {
      await deleteDoc(doc(db, 'habits', habitId))
      habits.value = habits.value.filter(h => h.id !== habitId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function completeHabit(habitId) {
    const userStore = useUserStore()
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return

    const today = new Date().toISOString().split('T')[0]
    
    try {
      // Check if already completed today
      const progressDoc = await getDoc(
        doc(db, 'progress', `${habitId}_${today}`)
      )
      
      if (progressDoc.exists()) {
        throw new Error('Habit already completed today!')
      }

      // Create progress entry
      await setDoc(doc(db, 'progress', `${habitId}_${today}`), {
        habitId,
        userId: userStore.currentUserId,
        date: today,
        completed: true,
        timestamp: new Date(),
        pointsEarned: 10
      })

      // Update habit stats
      const newStreak = calculateStreak(habit)
      await updateHabit(habitId, {
        lastCompleted: new Date(),
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, habit.bestStreak || 0),
        completedCount: (habit.completedCount || 0) + 1
      })

      // Award points
      await userStore.updatePoints(10)

      // Bonus points for streaks
      if (newStreak === 7) {
        await userStore.updatePoints(50) // Week streak bonus
      } else if (newStreak === 30) {
        await userStore.updatePoints(200) // Month streak bonus
      }

      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  function calculateStreak(habit) {
    if (!habit.lastCompleted) return 1
    
    const lastDate = new Date(habit.lastCompleted.seconds ? 
      habit.lastCompleted.seconds * 1000 : habit.lastCompleted)
    const today = new Date()
    const diffTime = Math.abs(today - lastDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return (habit.currentStreak || 0) + 1
    } else if (diffDays === 0) {
      return habit.currentStreak || 1
    } else {
      return 1
    }
  }

  return {
    // State
    habits,
    loading,
    error,
    selectedHabit,
    
    // Computed
    activeHabits,
    habitsByFrequency,
    todaysHabits,
    
    // Actions
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    completeHabit
  }
})