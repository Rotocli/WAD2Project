import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  doc, 
  getDoc,
  setDoc, 
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useUserStore } from './userStore'
import { useAquariumStore } from './aquariumStore'
import { useFishDecoStore } from './fishDecoStore'

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const inventoryItems = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const aquariumDecorations = computed(() => 
    inventoryItems.value.filter(item => item.itemType === 'aquarium')
  )

  const fishDecorations = computed(() => 
    inventoryItems.value.filter(item => item.itemType === 'fish')
  )

  const groupedFishDecorations = computed(() => {
    const grouped = {
      head: [],
      eye: [],
      body: [],
      trail: []
    }
    
    fishDecorations.value.forEach(item => {
      if (grouped[item.category]) {
        grouped[item.category].push(item)
      }
    })
    
    return grouped
  })

  // Check if item is in inventory
  const hasItem = (itemId) => {
    return inventoryItems.value.some(item => item.itemId === itemId)
  }

  // Get item quantity
  const getQuantity = (itemId) => {
    const item = inventoryItems.value.find(item => item.itemId === itemId)
    return item ? item.quantity : 0
  }

  // Actions
  async function fetchInventory() {
    const userStore = useUserStore()
    if (!userStore.currentUserId) return

    loading.value = true
    error.value = null

    try {
      const docRef = doc(db, 'inventory', userStore.currentUserId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        inventoryItems.value = docSnap.data().items || []
      } else {
        await setDoc(docRef, { items: [] })
        inventoryItems.value = []
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  async function purchaseItem(itemData) {
    const userStore = useUserStore()
    if (!userStore.currentUserId) {
      throw new Error('User not authenticated')
    }

    loading.value = true
    error.value = null

    try {
      // Check if user has enough points
      if (userStore.totalPoints < itemData.cost) {
        throw new Error('Not enough points!')
      }

      // Deduct points from user
      await userStore.updatePoints(-itemData.cost)

      // Create inventory item (no quantity, each purchase = new slot)
      const inventoryItem = {
        itemId: itemData.id + '_' + Date.now(), // Unique ID for each purchase
        originalItemId: itemData.id, // Store original item ID
        itemType: itemData.type || 'aquarium',
        category: itemData.category || null,
        name: itemData.name,
        icon: itemData.icon,
        cost: itemData.cost,
        inUse: false, // Track if equipped
        purchasedAt: new Date()
      }

      const docRef = doc(db, 'inventory', userStore.currentUserId)

      await updateDoc(docRef, {
        items: arrayUnion(inventoryItem)
      })
      inventoryItems.value.push(inventoryItem)

      return { success: true, message: `${itemData.name} added to inventory!` }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  
  async function useItem(itemId) {
    const userStore = useUserStore()
    if (!userStore.currentUserId) return

    const item = inventoryItems.value.find(i => i.itemId === itemId)
    if (!item) {
      throw new Error('Item not found in inventory')
    }

    try {
      item.quantity -= 1

      if (item.quantity <= 0) {
        const docRef = doc(db, 'inventory', userStore.currentUserId)
        await updateDoc(docRef, {
          items: arrayRemove(item)
        })
        inventoryItems.value = inventoryItems.value.filter(i => i.itemId !== itemId)
      } else {
        const docRef = doc(db, 'inventory', userStore.currentUserId)
        await updateDoc(docRef, {
          items: inventoryItems.value
        })
      }

      return { success: true }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function removeItem(itemId) {
      const userStore = useUserStore()
      if (!userStore.currentUserId) return

      const item = inventoryItems.value.find(i => i.itemId === itemId)
      if (!item) return

      if (item.inUse) {
        throw new Error('Cannot delete item that is currently equipped!')
      }

      try {
        const docRef = doc(db, 'inventory', userStore.currentUserId)
        await updateDoc(docRef, {
          items: arrayRemove(item)
        })

        inventoryItems.value = inventoryItems.value.filter(i => i.itemId !== itemId)
      } catch (err) {
        error.value = err.message
        throw err
      }
    }
    async function markItemInUse(itemId, inUse = true) {
    const userStore = useUserStore()
    if (!userStore.currentUserId) return

    const item = inventoryItems.value.find(i => i.itemId === itemId)
    if (!item) return

    try {
      item.inUse = inUse

      const docRef = doc(db, 'inventory', userStore.currentUserId)
      await updateDoc(docRef, {
        items: inventoryItems.value
      })
    } catch (err) {
      throw err
    }
  }

  // ADD to return statement:
  

  async function placeAquariumDecoration(itemId, gridIndex) {
    const aquariumStore = useAquariumStore()
    const item = inventoryItems.value.find(i => i.itemId === itemId)
    
    if (!item || item.itemType !== 'aquarium') {
      throw new Error('Invalid aquarium decoration')
    }

    try {
      const decoration = aquariumStore.decorationTypes[itemId]
      if (!decoration) {
        throw new Error('Decoration not found')
      }

      await aquariumStore.updateGridCell(gridIndex, {
        ...decoration,
        id: itemId
      })

      await useItem(itemId)

      return { success: true, message: 'Decoration placed!' }
    } catch (err) {
      throw err
    }
  }

  async function equipFishDecoration(itemId, fishId) {
    const fishDecoStore = useFishDecoStore()
    const item = inventoryItems.value.find(i => i.itemId === itemId)
    
    if (!item || item.itemType !== 'fish') {
      throw new Error('Invalid fish decoration')
    }

    try {
      const result = await fishDecoStore.equipDecoration(item.category, itemId)

      if (result.success) {
        await useItem(itemId)
      }

      return result
    } catch (err) {
      throw err
    }
  }

  return {
    // State
    inventoryItems,
    loading,
    error,
    
    // Computed
    aquariumDecorations,
    fishDecorations,
    groupedFishDecorations,
    
    // Helpers
    hasItem,
    getQuantity,
    
    // Actions
    fetchInventory,
    purchaseItem,
    useItem,
    removeItem,
    placeAquariumDecoration,
    equipFishDecoration,
    markItemInUse
  }
})
