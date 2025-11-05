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
        // Initialize empty inventory
        await setDoc(docRef, { items: [] })
        inventoryItems.value = []
      }
      
      console.log('✅ Inventory loaded:', inventoryItems.value.length, 'items')
    } catch (err) {
      error.value = err.message
      console.error('Error fetching inventory:', err)
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
      
      // Always add as new item (no quantity increase)
      await updateDoc(docRef, {
        items: arrayUnion(inventoryItem)
      })
      inventoryItems.value.push(inventoryItem)

      console.log('✅ Item purchased:', itemData.name)
      return { success: true, message: `${itemData.name} added to inventory!` }
    } catch (err) {
      error.value = err.message
      console.error('Error purchasing item:', err)
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
      // Decrease quantity
      item.quantity -= 1

      // Remove from inventory if quantity is 0
      if (item.quantity <= 0) {
        const docRef = doc(db, 'inventory', userStore.currentUserId)
        await updateDoc(docRef, {
          items: arrayRemove(item)
        })
        inventoryItems.value = inventoryItems.value.filter(i => i.itemId !== itemId)
      } else {
        // Update quantity in Firebase
        const docRef = doc(db, 'inventory', userStore.currentUserId)
        await updateDoc(docRef, {
          items: inventoryItems.value
        })
      }

      console.log('✅ Item used:', item.name)
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

      // Prevent deletion if item is in use
      if (item.inUse) {
        throw new Error('Cannot delete item that is currently equipped!')
      }

      try {
        const docRef = doc(db, 'inventory', userStore.currentUserId)
        await updateDoc(docRef, {
          items: arrayRemove(item)
        })
        
        inventoryItems.value = inventoryItems.value.filter(i => i.itemId !== itemId)
        console.log('✅ Item removed from inventory')
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
      
      console.log(`✅ Item ${inUse ? 'marked as in use' : 'freed'}`)
    } catch (err) {
      console.error('Error updating item usage:', err)
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
      // Get decoration details from aquariumStore
      const decoration = aquariumStore.decorationTypes[itemId]
      if (!decoration) {
        throw new Error('Decoration not found')
      }

      // Place in aquarium
      await aquariumStore.updateGridCell(gridIndex, {
        ...decoration,
        id: itemId
      })

      // Use the item (decrease quantity)
      await useItem(itemId)

      return { success: true, message: 'Decoration placed!' }
    } catch (err) {
      console.error('Error placing decoration:', err)
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
      // Equip the decoration
      const result = await fishDecoStore.equipDecoration(item.category, itemId)
      
      if (result.success) {
        // Use the item (decrease quantity)
        await useItem(itemId)
      }

      return result
    } catch (err) {
      console.error('Error equipping decoration:', err)
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
