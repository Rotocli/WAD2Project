import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  doc, 
  setDoc,  
  getDocs,
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useUserStore } from './userStore'

export const useFishStore = defineStore('fish', () => {
  // State
  const fish = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedFish = ref(null)

  // Fish species templates with customization options
  const fishSpecies = {
    clownfish: {
      name: 'Clownfish',
      baseColor: '#ff6b35',
      stripeColor: '#ffffff',
      size: { min: 0.6, max: 1.0 },
      swimSpeed: 'medium',
      emoji: '🐠'
    },
    blueTang: {
      name: 'Blue Tang',
      baseColor: '#3b82f6',
      stripeColor: '#fbbf24',
      size: { min: 0.6, max: 1.2 },
      swimSpeed: 'fast',
      emoji: '🐟'
    },
    yellowTang: {
      name: 'Yellow Tang',
      baseColor: '#fbbf24',
      stripeColor: '#fcd34d',
      size: { min: 0.5, max: 0.9 },
      swimSpeed: 'medium',
      emoji: '🐡'
    },
    angelfish: {
      name: 'Angelfish',
      baseColor: '#ec4899',
      stripeColor: '#f9a8d4',
      size: { min: 0.7, max: 1.1 },
      swimSpeed: 'slow',
      emoji: '🐠'
    },
    neonTetra: {
      name: 'Neon Tetra',
      baseColor: '#06b6d4',
      stripeColor: '#ef4444',
      size: { min: 0.4, max: 0.6 },
      swimSpeed: 'fast',
      emoji: '🐟'
    },
    goldfish: {
      name: 'Goldfish',
      baseColor: '#f97316',
      stripeColor: '#fed7aa',
      size: { min: 0.8, max: 1.3 },
      swimSpeed: 'slow',
      emoji: '🐠'
    },
    betta: {
      name: 'Betta Fish',
      baseColor: '#8b5cf6',
      stripeColor: '#c4b5fd',
      size: { min: 0.6, max: 0.9 },
      swimSpeed: 'medium',
      emoji: '🐟'
    },
    guppy: {
      name: 'Guppy',
      baseColor: '#10b981',
      stripeColor: '#6ee7b7',
      size: { min: 0.4, max: 0.7 },
      swimSpeed: 'fast',
      emoji: '🐠'
    }
  }

  // Computed
  const activeFish = computed(() => 
    fish.value.filter(f => f.isAlive)
  )

  const fishByHabit = computed(() => {
    const grouped = {}
    fish.value.forEach(f => {
      if (!grouped[f.habitId]) {
        grouped[f.habitId] = []
      }
      grouped[f.habitId].push(f)
    })
    return grouped
  })

  // Helper Functions
  function calculateFishAge(createdAt) {
    if (!createdAt) return 0
    const created = new Date(createdAt.seconds ? createdAt.seconds * 1000 : createdAt)
    const now = new Date()
    const diffTime = Math.abs(now - created)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  function calculateFishSize(createdAt, species) {
    const age = calculateFishAge(createdAt)
    const speciesData = fishSpecies[species] || fishSpecies.clownfish
    
    // Growth formula: starts at min size, grows to max over 30 days
    const growthRate = (speciesData.size.max - speciesData.size.min) / 30
    const currentSize = Math.min(
      speciesData.size.max,
      speciesData.size.min + (age * growthRate)
    )
    
    return currentSize
  }

  function calculateFishHealth(lastFed, createdAt) {
    // Health calculation based on last feeding time
    // Fish need to be fed regularly by completing habits
    if (!lastFed) {
      console.log('🐟 [HEALTH] No lastFed time found, assuming full health')
      return 100
    }
    
    const lastFedDate = new Date(lastFed.seconds ? lastFed.seconds * 1000 : lastFed)
    const now = new Date()
    const hoursSinceFeeding = (now - lastFedDate) / (1000 * 60 * 60)
    
    // Health decreases 5% per day without feeding
    // Fish dies after 20 days without feeding (100% / 5% = 20 days)
    const healthDecrease = (hoursSinceFeeding / 24) * 5
    const health = Math.max(0, Math.min(100, 100 - healthDecrease))
    
    console.log(`🐟 [HEALTH] Fish health calculated:`, {
      hoursSinceFeeding: hoursSinceFeeding.toFixed(2),
      healthDecrease: healthDecrease.toFixed(2),
      currentHealth: health.toFixed(2)
    })
    
    return health
  }

  /**
   * Check if a fish should die based on its health
   * If health reaches 0, marks the fish as dead
   */
  async function checkAndUpdateFishHealth(fishId) {
    console.log(`🩺 [HEALTH CHECK] Checking health for fish: ${fishId}`)
    
    const fishToCheck = fish.value.find(f => f.id === fishId)
    if (!fishToCheck) {
      console.warn(`⚠️ [HEALTH CHECK] Fish ${fishId} not found in local state`)
      return
    }

    const currentHealth = calculateFishHealth(fishToCheck.lastFed, fishToCheck.createdAt)
    console.log(`🩺 [HEALTH CHECK] Fish "${fishToCheck.customName}" health: ${currentHealth.toFixed(2)}%`)

    // If fish is alive but health is 0 or below, mark as dead
    if (fishToCheck.isAlive && currentHealth <= 0) {
      console.warn(`💀 [DEATH] Fish "${fishToCheck.customName}" has died from neglect!`)
      
      try {
        await updateDoc(doc(db, 'fish', fishId), {
          isAlive: false,
          deathDate: new Date(),
          deathReason: 'starvation'
        })

        // Update local state
        const index = fish.value.findIndex(f => f.id === fishId)
        if (index !== -1) {
          fish.value[index].isAlive = false
          fish.value[index].deathDate = new Date()
          fish.value[index].deathReason = 'starvation'
          console.log(`💀 [DEATH] Local state updated for fish "${fishToCheck.customName}"`)
        }
      } catch (err) {
        console.error('❌ [DEATH] Error marking fish as dead:', err)
      }
    } else if (currentHealth > 0 && currentHealth <= 20) {
      console.warn(`⚠️ [WARNING] Fish "${fishToCheck.customName}" is in critical condition! (${currentHealth.toFixed(2)}% health)`)
    } else {
      console.log(`✅ [HEALTH CHECK] Fish "${fishToCheck.customName}" is healthy (${currentHealth.toFixed(2)}% health)`)
    }
  }

  /**
   * Check for fish with pending revival and revive them
   */
  async function checkPendingRevivals(userId) {
    console.log('🔄 [REVIVAL CHECK] Checking for pending fish revivals...')
    
    if (!userId) {
      const userStore = useUserStore()
      userId = userStore.currentUserId
    }

    if (!userId) return

    try {
      // Find fish with revivalPending flag
      const pendingRevivalFish = fish.value.filter(f => f.revivalPending && !f.isAlive)
      
      if (pendingRevivalFish.length === 0) {
        console.log('✅ [REVIVAL CHECK] No pending revivals')
        return
      }

      console.log(`🐠 [REVIVAL CHECK] Found ${pendingRevivalFish.length} fish to revive`)

      for (const fishToRevive of pendingRevivalFish) {
        console.log(`✨ [REVIVAL] Reviving fish: "${fishToRevive.customName}"`)
        
        // Revive the fish
        await updateDoc(doc(db, 'fish', fishToRevive.id), {
          isAlive: true,
          lastFed: new Date(), // Feed them so they start with full health
          deathDate: null,
          deathReason: null,
          revivalPending: false,
          revivedAt: new Date()
        })

        // Update local state
        const index = fish.value.findIndex(f => f.id === fishToRevive.id)
        if (index !== -1) {
          fish.value[index].isAlive = true
          fish.value[index].lastFed = new Date()
          fish.value[index].deathDate = null
          fish.value[index].deathReason = null
          fish.value[index].revivalPending = false
          fish.value[index].revivedAt = new Date()
          fish.value[index].health = 100
        }

        console.log(`🎉 [REVIVAL] Fish "${fishToRevive.customName}" has been revived!`)
      }
    } catch (error) {
      console.error('❌ [REVIVAL CHECK] Error checking pending revivals:', error)
    }
  }

  /**
   * Check health of all fish belonging to a user
   * This should be called periodically (e.g., on app load, daily checks)
   * IMPORTANT: Excludes fish from archived habits (they should not lose health)
   */
  async function checkAllFishHealth(userId) {
    console.log('🏥 [HEALTH CHECK ALL] Starting health check for all fish...')
    
    if (!userId) {
      const userStore = useUserStore()
      userId = userStore.currentUserId
    }

    if (!userId) {
      console.warn('⚠️ [HEALTH CHECK ALL] No userId provided')
      return
    }

    // Get habit store to check archived status
    const { useHabitStore } = await import('./habitStore')
    const habitStore = useHabitStore()
    
    // Filter fish: alive AND their habit is not archived
    const userFish = fish.value.filter(f => {
      if (!f.isAlive || f.userId !== userId) return false
      
      // Find the associated habit
      const habit = habitStore.habits.find(h => h.id === f.habitId)
      
      // Skip if habit is archived
      if (habit && habit.isArchived) {
        console.log(`⏸️ [HEALTH CHECK] Skipping fish "${f.customName}" - habit is archived`)
        return false
      }
      
      return true
    })
    
    console.log(`🏥 [HEALTH CHECK ALL] Found ${userFish.length} alive fish with active habits to check`)

    for (const fishItem of userFish) {
      await checkAndUpdateFishHealth(fishItem.id)
    }

    console.log('✅ [HEALTH CHECK ALL] Health check completed for all fish')
  }

  // Actions
  async function fetchFish(userId) {
    if (!userId) {
      const userStore = useUserStore()
      userId = userStore.currentUserId
    }
    
    console.log('🐠 fishStore.fetchFish called with userId:', userId)
    
    if (!userId) {
      console.warn('⚠️ fishStore.fetchFish: No userId provided, aborting')
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log('📡 fishStore.fetchFish: Querying Firestore for fish...')
      const q = query(
        collection(db, 'fish'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      console.log('📦 fishStore.fetchFish: Query returned', querySnapshot.docs.length, 'documents')
      
      fish.value = querySnapshot.docs.map(doc => {
        const data = doc.data()
        const health = calculateFishHealth(data.lastFed, data.createdAt)
        console.log('🐟 Processing fish:', doc.id, data.customName, 'isAlive:', data.isAlive, 'health:', health.toFixed(2))
        
        return {
          id: doc.id,
          ...data,
          // Calculate dynamic properties
          age: calculateFishAge(data.createdAt),
          currentSize: calculateFishSize(data.createdAt, data.species),
          health: health
        }
      })
      
      console.log('✅ fishStore.fetchFish: Fish array updated. Total fish:', fish.value.length, 'Active fish:', fish.value.filter(f => f.isAlive).length)
      
      // Check for pending revivals and process them
      await checkPendingRevivals(userId)
      
      // After fetching, check all fish health
      await checkAllFishHealth(userId)
    } catch (err) {
      error.value = err.message
      console.error('❌ fishStore.fetchFish: Error fetching fish:', err)
    } finally {
      loading.value = false
    }
  }

  async function createFish(fishData) {
    const userStore = useUserStore()
    const userId = userStore.currentUserId
    if (!userId) throw new Error('User not authenticated')

    loading.value = true
    error.value = null

    try {
      // Generate default fish name if not provided
      const speciesData = fishSpecies[fishData.species] || fishSpecies.clownfish
      const defaultName = fishData.habitName 
        ? `${fishData.habitName}'s ${speciesData.name}`
        : speciesData.name

      const newFish = {
        userId,
        habitId: fishData.habitId,
        species: fishData.species || 'clownfish',
        customName: fishData.customName || defaultName,
        createdAt: new Date(),
        isAlive: true,
        lastFed: new Date(),
        decorations:fishData.decorations,
        
        // Customization properties
        baseColor: fishData.baseColor || speciesData.baseColor,
        stripeColor: fishData.stripeColor || speciesData.stripeColor,
        pattern: fishData.pattern || 'default', // default, stripes, spots, solid
        
        // Position for aquarium (randomized for variety)
        position: {
          x: Math.random() * 70 + 10, // 10-80% of aquarium width
          y: Math.random() * 45 + 20, // 20-65% of aquarium height (avoid top/bottom)
          layer: Math.floor(Math.random() * 3) // 0-2 depth layers
        },
        
        // Swimming behavior with variation
        swimDirection: Math.random() > 0.5 ? 'right' : 'left',
        swimSpeed: speciesData.swimSpeed,
        speedVariation: 0.8 + Math.random() * 0.4 // 80-120% of base speed
      }

      const docRef = doc(collection(db, 'fish'))
      await setDoc(docRef, newFish)
      
      console.log(`🐠 [CREATE] Created new fish "${newFish.customName}" for habit ${fishData.habitId}`)
      
      // Add to local state with calculated properties
      const fishWithId = {
        id: docRef.id,
        ...newFish,
        age: 0,
        currentSize: speciesData.size.min,
        health: 100
      }
      
      fish.value.unshift(fishWithId)

      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateFish(fishId, updates) {
    loading.value = true
    error.value = null

    try {
      await updateDoc(doc(db, 'fish', fishId), updates)
      
      const index = fish.value.findIndex(f => f.id === fishId)
      if (index !== -1) {
        fish.value[index] = { 
          ...fish.value[index], 
          ...updates,
          // Recalculate dynamic properties
          currentSize: calculateFishSize(
            fish.value[index].createdAt, 
            updates.species || fish.value[index].species
          ),
          health: calculateFishHealth(
            updates.lastFed || fish.value[index].lastFed,
            fish.value[index].createdAt
          )
        }
        
        console.log(`🔄 [UPDATE] Fish ${fishId} updated`, updates)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteFish(fishId) {
    loading.value = true
    error.value = null

    try {
      await deleteDoc(doc(db, 'fish', fishId))
      fish.value = fish.value.filter(f => f.id !== fishId)
      console.log(`🗑️ [DELETE] Fish ${fishId} deleted`)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function feedFish(fishId) {
    console.log(`🍽️ [FEED] Feeding fish: ${fishId}`)
    
    try {
      await updateFish(fishId, {
        lastFed: new Date()
      })
      
      const fedFish = fish.value.find(f => f.id === fishId)
      if (fedFish) {
        console.log(`✅ [FEED] Fish "${fedFish.customName}" fed successfully! Health restored to 100%`)
      }
      
      return true
    } catch (err) {
      console.error('❌ [FEED] Error feeding fish:', err)
      throw err
    }
  }

  async function customizeFish(fishId, customization) {
    // Customization can include: baseColor, stripeColor, pattern, customName
    try {
      await updateFish(fishId, customization)
      console.log(`🎨 [CUSTOMIZE] Fish ${fishId} customized`)
      return true
    } catch (err) {
      console.error('❌ [CUSTOMIZE] Error customizing fish:', err)
      throw err
    }
  }

  function getFishByHabitId(habitId) {
    return fish.value.filter(f => f.habitId === habitId)
  }

  function selectFish(fishId) {
    selectedFish.value = fish.value.find(f => f.id === fishId) || null
  }

  return {
    // State
    fish,
    loading,
    error,
    selectedFish,
    fishSpecies,
    
    // Computed
    activeFish,
    fishByHabit,
    
    // Actions
    fetchFish,
    createFish,
    updateFish,
    deleteFish,
    feedFish,
    customizeFish,
    getFishByHabitId,
    selectFish,
    checkAndUpdateFishHealth,
    checkAllFishHealth,
    checkPendingRevivals,
    
    // Helpers (exposed for components to use)
    calculateFishAge,
    calculateFishSize,
    calculateFishHealth
  }
})
