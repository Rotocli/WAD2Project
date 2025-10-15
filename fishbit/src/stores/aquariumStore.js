import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  doc, 
  getDoc,
  setDoc, 
  updateDoc
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useUserStore } from './userStore'


export const useAquariumStore = defineStore('aquarium', () => {
  // State
  const settings = ref({
    substrate: 'sand',
    lighting: 'bright',
    decorations: []
  })
  // Grid always 12 cells - sync with decorations
  const grid = ref(Array.from({ length: 12 }, () => ({})))
  const loading = ref(false)
  const error = ref(null)

  // Available customization options
  const substrateOptions = {
    sand: {
      name: 'Sand',
      color: '#deb887',
      texture: 'fine',
      cost: 0 // Free default
    },
    gravel: {
      name: 'Gravel',
      color: '#8b7355',
      texture: 'coarse',
      cost: 100
    },
    pebbles: {
      name: 'Pebbles',
      color: '#696969',
      texture: 'smooth',
      cost: 150
    },
    blackSand: {
      name: 'Black Sand',
      color: '#2d2d2d',
      texture: 'fine',
      cost: 200
    },
    whiteSand: {
      name: 'White Sand',
      color: '#f5f5f5',
      texture: 'fine',
      cost: 150
    }
  }

  const lightingOptions = {
    bright: {
      name: 'Bright Daylight',
      gradient: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 20%, #2563eb 40%, #3b82f6 60%, #60a5fa 80%, #93c5fd 100%)',
      filter: 'brightness(1.1)',
      cost: 0 // Free default
    },
    dim: {
      name: 'Dim Evening',
      gradient: 'linear-gradient(180deg, #1e293b 0%, #334155 30%, #475569 60%, #64748b 90%, #94a3b8 100%)',
      filter: 'brightness(0.8)',
      cost: 100
    },
    sunset: {
      name: 'Sunset Glow',
      gradient: 'linear-gradient(180deg, #7c2d12 0%, #ea580c 30%, #fb923c 60%, #fdba74 90%, #fed7aa 100%)',
      filter: 'brightness(0.9) saturate(1.2)',
      cost: 200
    },
    moonlight: {
      name: 'Moonlight',
      gradient: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 30%, #3730a3 60%, #4338ca 90%, #6366f1 100%)',
      filter: 'brightness(0.7) contrast(1.1)',
      cost: 250
    },
    tropical: {
      name: 'Tropical',
      gradient: 'linear-gradient(180deg, #065f46 0%, #059669 30%, #10b981 60%, #34d399 90%, #6ee7b7 100%)',
      filter: 'brightness(1) saturate(1.3)',
      cost: 300
    }
  }

  const decorationTypes = {
    // Plants
    seaweed: {
      name: 'Seaweed',
      category: 'plant',
      icon: '🌿',
      size: { width: 30, height: 120 },
      cost: 50,
      effect: 'oxygen' // For future health mechanics
    },
    coral: {
      name: 'Coral',
      category: 'plant',
      icon: '🪸',
      size: { width: 60, height: 70 },
      cost: 150,
      effect: 'hiding'
    },
    kelp: {
      name: 'Kelp',
      category: 'plant',
      icon:  '🍃',
      size: { width: 25, height: 150 },
      cost: 75,
      effect: 'oxygen'
    },
    
    // Rocks/Structures
    rock: {
      name: 'Rock',
      category: 'structure',
      icon:  '🪨',
      size: { width: 80, height: 60 },
      cost: 100,
      effect: 'hiding'
    },
    castle: {
      name: 'Castle',
      category: 'structure',
      icon:  '🏰',
      size: { width: 100, height: 120 },
      cost: 300,
      effect: 'hiding'
    },
    treasure: {
      name: 'Treasure Chest',
      category: 'structure',
      icon:  '💰',
      size: { width: 70, height: 50 },
      cost: 200,
      effect: 'decoration'
    },
    
    // Special
    bubbler: {
      name: 'Bubble Stone',
      category: 'special',
      icon:  '💧',
      size: { width: 40, height: 30 },
      cost: 100,
      effect: 'oxygen'
    },
    shipwreck: {
      name: 'Shipwreck',
      category: 'structure',
      icon:  '🚢',
      size: { width: 150, height: 100 },
      cost: 400,
      effect: 'hiding'
    }
  }

  // Computed
  const currentSubstrate = computed(() => 
    substrateOptions[settings.value.substrate] || substrateOptions.sand
  )

  const currentLighting = computed(() => 
    lightingOptions[settings.value.lighting] || lightingOptions.bright
  )

  const decorationCount = computed(() => 
    settings.value.decorations.length
  )

  // Actions
  async function fetchSettings(userId) {
    if (!userId) {
      const userStore = useUserStore()
      userId = userStore.currentUserId
    }
    if (!userId) return

    loading.value = true
    error.value = null

    try {
      const docRef = doc(db, 'aquariumSettings', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        settings.value = docSnap.data()
      } else {
        // Create default settings
        const defaultSettings = {
          substrate: 'sand',
          lighting: 'bright',
          decorations: []
        }
        await setDoc(docRef, defaultSettings)
        settings.value = defaultSettings
      }
      loadGridFromDecorations()
    } catch (err) {
      error.value = err.message
      console.error('Error fetching aquarium settings:', err)
    } finally {
      loading.value = false
    }
  }

  async function updateSubstrate(substrateType) {
    const userStore = useUserStore()
    const userId = userStore.currentUserId
    if (!userId) throw new Error('User not authenticated')

    loading.value = true
    error.value = null

    try {
      const docRef = doc(db, 'aquariumSettings', userId)
      await updateDoc(docRef, { substrate: substrateType })
      settings.value.substrate = substrateType
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateLighting(lightingType) {
    const userStore = useUserStore()
    const userId = userStore.currentUserId
    if (!userId) throw new Error('User not authenticated')

    loading.value = true
    error.value = null

    try {
      const docRef = doc(db, 'aquariumSettings', userId)
      await updateDoc(docRef, { lighting: lightingType })
      settings.value.lighting = lightingType
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fill grid from decorations list
  function loadGridFromDecorations() {
    for (let i = 0; i < 12; i++) {
      grid.value[i] = settings.value.decorations[i] ? { decoration: settings.value.decorations[i] } : {}
    }
  }

  // Sync grid cells to decorations list (strip cells without decorations)
  function syncGridToDecorations() {
    settings.value.decorations = grid.value.map(cell => cell.decoration).filter(Boolean)
  }

  async function updateGridCell(idx, decoration) {
    try {
      grid.value[idx].decoration = decoration
      syncGridToDecorations()
      const userStore = useUserStore()
      const userId = userStore.currentUserId
      const docRef = doc(db, 'aquariumSettings', userId)
      await updateDoc(docRef, { decorations: settings.value.decorations })
    } catch(err) {
      error.value = err.message
      throw err
    }
  }
  
  // Remove decoration similarly
  async function removeDecoration(idx) {
    try {
      grid.value[idx].decoration = undefined
      syncGridToDecorations()
      const userStore = useUserStore()
      const userId = userStore.currentUserId
      const docRef = doc(db, 'aquariumSettings', userId)
      await updateDoc(docRef, { decorations: settings.value.decorations })
    } catch(err) {
      error.value = err.message
      throw err
    }
  }

  return {
    // State
    settings,
    grid,
    loading,
    error,
    
    // Options
    substrateOptions,
    lightingOptions,
    decorationTypes,
    
    // Computed
    currentSubstrate,
    currentLighting,
    decorationCount,
    
    // Actions
    fetchSettings,
    updateSubstrate,
    updateLighting,
    updateGridCell,
    loadGridFromDecorations,
    syncGridToDecorations,
    removeDecoration
  }
})
