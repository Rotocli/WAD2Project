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
    // Simple health calculation based on last feeding time
    // In future, this can factor in aquarium conditions
    if (!lastFed) return 100
    
    const lastFedDate = new Date(lastFed.seconds ? lastFed.seconds * 1000 : lastFed)
    const now = new Date()
    const hoursSinceFeeding = (now - lastFedDate) / (1000 * 60 * 60)
    
    // Health decreases 5% per day without feeding
    const healthDecrease = (hoursSinceFeeding / 24) * 5
    return Math.max(0, Math.min(100, 100 - healthDecrease))
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
        console.log('🐟 Processing fish:', doc.id, data.customName, 'isAlive:', data.isAlive)
        return {
          id: doc.id,
          ...data,
          // Calculate dynamic properties
          age: calculateFishAge(data.createdAt),
          currentSize: calculateFishSize(data.createdAt, data.species),
          health: calculateFishHealth(data.lastFed, data.createdAt)
        }
      })
      
      console.log('✅ fishStore.fetchFish: Fish array updated. Total fish:', fish.value.length, 'Active fish:', fish.value.filter(f => f.isAlive).length)
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
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function feedFish(fishId) {
    try {
      await updateFish(fishId, {
        lastFed: new Date()
      })
      return true
    } catch (err) {
      console.error('Error feeding fish:', err)
      throw err
    }
  }

  async function customizeFish(fishId, customization) {
    // Customization can include: baseColor, stripeColor, pattern, customName
    try {
      await updateFish(fishId, customization)
      return true
    } catch (err) {
      console.error('Error customizing fish:', err)
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
    
    // Helpers (exposed for components to use)
    calculateFishAge,
    calculateFishSize,
    calculateFishHealth
  }
})
