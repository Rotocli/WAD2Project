// useHabitStore.js
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
import { timeService } from '../services/timeService'
import { useAchievements } from '../services/useAchievements'

export const useHabitStore = defineStore('habit', () => {
  // ========================================
  // TIME HELPERS - Use these throughout the store
  // These ensure Time Machine works correctly
  // ========================================
  
  /**
   * Get current date (respects Time Machine)
   * @returns {Date} - Current date (real or simulated)
   */
  const getCurrentDate = () => timeService.now()
  
  /**
   * Get today's date string in YYYY-MM-DD format (respects Time Machine)
   * @returns {string} - Today's date
   */
  const getTodayString = () => timeService.getTodayString()
  
  /**
   * Get yesterday's date string in YYYY-MM-DD format (respects Time Machine)
   * @returns {string} - Yesterday's date
   */
  const getYesterdayString = () => timeService.getYesterdayString()

  // State
  const habits = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedHabit = ref(null)
  const progress = ref([]) // ← store all progress entries

  // Computed
  const activeHabits = computed(() => 
    habits.value.filter(h => h.isActive && !h.isArchived)
  )

  const archivedHabits = computed(() =>
    habits.value.filter(h => h.isArchived)
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
    const today = getCurrentDate().getDay() // Day of week (0-6)
    const todayDate = getCurrentDate() // Full date object
    
    return habits.value.filter(habit => {
      const createdAtDate = habit.createdAt.seconds 
        ? new Date(habit.createdAt.seconds * 1000)
        : new Date(habit.createdAt)

      // Don't show archived habits
      if (habit.isArchived) return false
        
      if (habit.repeat === false) {
        const isSameDay =
          createdAtDate.getFullYear() === todayDate.getFullYear() &&
          createdAtDate.getMonth() === todayDate.getMonth() &&
          createdAtDate.getDate() === todayDate.getDate()
        return isSameDay
      }
      else {
        if (habit.frequency === 'daily') return true
        if (habit.frequency === 'weekly' && habit.daysOfWeek?.includes(today)) return true
        if (habit.frequency === 'custom') {
          // Calculate number of days since creation
          const diffTime = todayDate - createdAtDate
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

          // Check if today is a multiple of customFrequency
          if (diffDays % habit.customFrequency === 0) return true
        }
      
        return false
      }
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
        createdAt: getCurrentDate(),
        isActive: true,
        isArchived: false,
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

      try {
        const { useFishStore } = await import('./fishStore')
        const fishStore = useFishStore()

        const species = ['clownfish', 'blueTang', 'yellowTang', 'angelfish', 'neonTetra', 'goldfish', 'betta', 'guppy']
        const randomSpecies = species[Math.floor(Math.random() * species.length)]

        await fishStore.createFish({
          habitId: docRef.id,
          habitName: habitData.name,
          species: randomSpecies,
          decorations:{
            head:'',
            eye: '',
            body: '',
            trail: ''
          }
        })

        await fishStore.fetchFish(userStore.currentUserId)
      } catch (fishErr) {
        // Fish creation failed
      }

      try {
      const { checkAchievements } = useAchievements()
      await checkAchievements()
    } catch (achErr) {
      // Achievement check failed
    }

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

      try {
        const { useFishStore } = await import('./fishStore')
        const fishStore = useFishStore()
        const associatedFish = fishStore.fish.filter(f => f.habitId === habitId)

        for (const fish of associatedFish) {
          await fishStore.deleteFish(fish.id)
        }
      } catch (fishErr) {
        // Could not delete associated fish
      }

      habits.value = habits.value.filter(h => h.id !== habitId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function archiveHabit(habitId) {
    loading.value = true
    error.value = null

    try {
      await updateDoc(doc(db, 'habits', habitId), {
        isArchived: true,
        archivedAt: getCurrentDate()
      })

      const index = habits.value.findIndex(h => h.id === habitId)
      if (index !== -1) {
        habits.value[index].isArchived = true
        habits.value[index].archivedAt = getCurrentDate()
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function unarchiveHabit(habitId) {
    loading.value = true
    error.value = null

    try {
      await updateDoc(doc(db, 'habits', habitId), {
        isArchived: false,
        archivedAt: null
      })

      const index = habits.value.findIndex(h => h.id === habitId)
      if (index !== -1) {
        habits.value[index].isArchived = false
        habits.value[index].archivedAt = null
      }
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

    const today = getTodayString()

    try {
      const progressDoc = await getDoc(
        doc(db, 'progress', `${habitId}_${today}`)
      )

      if (progressDoc.exists()) {
        const progressRef = doc(db, 'progress', `${habitId}_${today}`)
        await updateDoc(progressRef, { completed: true })
        throw new Error('Habit already completed today!')
      }

      await setDoc(doc(db, 'progress', `${habitId}_${today}`), {
        habitId,
        userId: userStore.currentUserId,
        date: today,
        completed: true,
        timestamp: getCurrentDate(),
        pointsEarned: 10
      })

      addProgressEntry({
        habitId,
        userId: userStore.currentUserId,
        date: today,
        completed: true
      })

      const newStreak = calculateStreak(habit)
      await updateHabit(habitId, {
        lastCompleted: getCurrentDate(),
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, habit.bestStreak || 0),
        completedCount: (habit.completedCount || 0) + 1
      })
      
      const progressTodaySnapshot = await getDocs(
        query(
          collection(db, 'progress'),
          where('userId', '==', userStore.currentUserId),
          where('completed', '==', true),
          where('date', '==', today)
        )
      )

      let newUserStreak = 1
      if (progressTodaySnapshot.size > 1) {
        newUserStreak = userStore.userProfile.currentStreak || 1
      } else {
        const yesterdayStr = getYesterdayString()

        const progressYesterdaySnapshot = await getDocs(
          query(
            collection(db, 'progress'),
            where('userId', '==', userStore.currentUserId),
            where('completed', '==', true),
            where('date', '==', yesterdayStr)
          )
        )

        newUserStreak =
          progressYesterdaySnapshot.size > 0
            ? (userStore.userProfile.currentStreak || 0) + 1
            : 1
      }

      // Update user profile streak
      await userStore.updateStreak(newUserStreak)
      

      // Award points
      await userStore.updatePoints(10)

      // Bonus points for streaks
      if (newStreak === 7) {
        await userStore.updatePoints(50) // Week streak bonus
      } else if (newStreak === 30) {
        await userStore.updatePoints(200) // Month streak bonus
      }

      try {
      const { checkAchievements } = useAchievements()
      await checkAchievements()
    } catch (achErr) {
      // Achievement check failed
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
    const today = getCurrentDate()
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

  async function fetchProgress(userId) {
    if (!userId) return
    try {
      const q = query(collection(db, 'progress'), where('userId', '==', userId))
      const snapshot = await getDocs(q)
      progress.value = snapshot.docs.map(doc => doc.data())
    } catch (err) {
      // Error fetching progress
    }
  }

  function addProgressEntry(entry) {
    progress.value.push(entry)
  }

  async function getCompleted() {
    const userStore = useUserStore()
    if (!userStore.currentUserId) return

    loading.value = true
    error.value = null
    const today = getTodayString()

    const q = query(
        collection(db, 'progress'),
        where('userId', '==', userStore.currentUserId),
        where('completed','==',true)
    )

    const querySnapshot = await getDocs(q)

    const todaysCompleted = querySnapshot.docs
        .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
        .filter(progress => {
            return progress.date == today
        })

    return todaysCompleted
  }
  
  async function undoHabit(habitId) {
    const userStore = useUserStore()
    if (!userStore.currentUserId) return

    loading.value = true
    error.value = null

    try {
      const today = getTodayString()
      const progressRef = doc(db, 'progress', `${habitId}_${today}`)

      const progressDoc = await getDoc(progressRef)
      if (!progressDoc.exists()) {
        return
      }

      await updateDoc(progressRef, { completed: false })
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }


  return {
    // State
    habits,
    loading,
    error,
    selectedHabit,
    progress,
    
    // Computed
    activeHabits,
    archivedHabits,
    habitsByFrequency,
    todaysHabits,
    
    // Actions
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    unarchiveHabit,
    completeHabit,
    getCompleted,
    undoHabit,
    

    //progress
    
    fetchProgress,
    addProgressEntry
  }
})