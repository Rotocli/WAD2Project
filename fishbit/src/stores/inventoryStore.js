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

  // NEW: Fish food items
  const fishFoodItems = computed(() => 
    inventoryItems.value.filter(item => item.itemType === 'fishfood')
  )

  // NEW: Get total fish food count
  const totalFishFood = computed(() => {
    const fishFoodItem = inventoryItems.value.find(item => item.itemId === 'revival_food')
    return fishFoodItem ? fishFoodItem.quantity : 0
  })

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
      console.log('🍖 Fish food count:', totalFishFood.value)
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

      const docRef = doc(db, 'inventory', userStore.currentUserId)
      
      // Check if item already exists in inventory
      const existingItem = inventoryItems.value.find(item => item.itemId === itemData.itemId)
      
      if (existingItem) {
        // Increment quantity
        const updatedItems = inventoryItems.value.map(item => {
          if (item.itemId === itemData.itemId) {
            return { ...item, quantity: item.quantity + 1 }
          }
          return item
        })
        
        await updateDoc(docRef, { items: updatedItems })
        inventoryItems.value = updatedItems
        
        console.log(`🛒 Purchased ${itemData.name} - New quantity: ${existingItem.quantity + 1}`)
      } else {
        // Add new item with quantity 1
        const newItem = {
          itemId: itemData.itemId,
          name: itemData.name,
          icon: itemData.icon,
          itemType: itemData.itemType,
          category: itemData.category,
          quantity: 1,
          purchasedAt: new Date()
        }
        
        await updateDoc(docRef, {
          items: arrayUnion(newItem)
        })
        
        inventoryItems.value.push(newItem)
        console.log(`🛒 Purchased ${itemData.name} - New item added`)
      }

      // Deduct points
      await userStore.updatePoints(-itemData.cost)
      
      console.log(`✅ Purchase complete! Fish food count: ${totalFishFood.value}`)
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error purchasing item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // NEW: Use fish food to revive a fish
  async function useFishFood(fishId) {
    const userStore = useUserStore()
    if (!userStore.currentUserId) {
      throw new Error('User not authenticated')
    }

    console.log('🍖 [FISH FOOD] Attempting to use fish food on fish:', fishId)

    // Check if user has fish food
    if (totalFishFood.value <= 0) {
      console.warn('⚠️ [FISH FOOD] No fish food available!')
      throw new Error('No fish food available!')
    }

    loading.value = true
    error.value = null

    try {
      const docRef = doc(db, 'inventory', userStore.currentUserId)
      
      // Decrease fish food quantity
      const updatedItems = inventoryItems.value.map(item => {
        if (item.itemId === 'revival_food') {
          const newQuantity = Math.max(0, item.quantity - 1)
          console.log(`🍖 [FISH FOOD] Decreasing quantity from ${item.quantity} to ${newQuantity}`)
          return { ...item, quantity: newQuantity }
        }
        return item
      }).filter(item => item.quantity > 0) // Remove items with 0 quantity
      
      await updateDoc(docRef, { items: updatedItems })
      inventoryItems.value = updatedItems
      
      console.log(`✅ [FISH FOOD] Used fish food! Remaining: ${totalFishFood.value}`)
      return true
    } catch (err) {
      error.value = err.message
      console.error('❌ [FISH FOOD] Error using fish food:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function applyAquariumDecoration(itemId, decorationData) {
    const aquariumStore = useAquariumStore()
    const userStore = useUserStore()
    
    if (!userStore.currentUserId) {
      throw new Error('User not authenticated')
    }

    loading.value = true
    error.value = null

    try {
      // Add decoration to aquarium
      await aquariumStore.addDecoration(decorationData)
      
      console.log('✅ Applied aquarium decoration:', itemId)
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error applying decoration:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function removeItem(itemId) {
    const userStore = useUserStore()
    if (!userStore.currentUserId) {
      throw new Error('User not authenticated')
    }

    loading.value = true
    error.value = null

    try {
      const docRef = doc(db, 'inventory', userStore.currentUserId)
      const itemToRemove = inventoryItems.value.find(item => item.itemId === itemId)
      
      if (!itemToRemove) {
        throw new Error('Item not found in inventory')
      }

      await updateDoc(docRef, {
        items: arrayRemove(itemToRemove)
      })
      
      inventoryItems.value = inventoryItems.value.filter(item => item.itemId !== itemId)
      
      console.log('✅ Removed item from inventory:', itemId)
    } catch (err) {
      error.value = err.message
      console.error('Error removing item:', err)
      throw err
    } finally {
      loading.value = false
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
    fishFoodItems,
    totalFishFood,
    groupedFishDecorations,
    
    // Methods
    hasItem,
    getQuantity,
    fetchInventory,
    purchaseItem,
    useFishFood,
    applyAquariumDecoration,
    removeItem
  }
})
