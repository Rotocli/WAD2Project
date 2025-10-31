<template>
  <div class="shop-view">
    <div class="container-fluid p-4">
      <!-- Search Bar -->
      <div class="search-section">
        <div class="search-bar-container">
          <input 
            type="text" 
            class="search-bar" 
            v-model="searchQuery"
            @focus="showSearchResults = true"
            placeholder="Search shop items..."
          />
          <i class="bi bi-search search-icon"></i>
        </div>

        <!-- Search Results Dropdown -->
        <div v-if="showSearchResults && searchQuery" class="search-results">
          <div v-if="filteredSearchResults.length === 0" class="search-empty">
            No items found
          </div>
          <div v-else>
            <div v-for="category in ['aquarium', 'fish']" :key="category">
              <div v-if="getSearchResultsByCategory(category).length > 0">
                <div class="search-category-header">
                  {{ category === 'aquarium' ? 'Aquarium Decorations' : 'Fish Decorations' }}
                </div>
                <div 
                  v-for="item in getSearchResultsByCategory(category)" 
                  :key="item.id"
                  class="search-result-item"
                  @click="selectSearchItem(item)"
                >
                  <span class="search-item-icon">{{ item.icon }}</span>
                  <span class="search-item-name">{{ item.name }}</span>
                  <span class="search-item-price">💰 {{ item.cost }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Filter Buttons -->
      <div class="category-filters">
        <button 
          class="filter-btn"
          :class="{ active: activeCategory === 'aquarium' }"
          @click="activeCategory = 'aquarium'"
        >
          Aquarium
        </button>
        <button 
          class="filter-btn"
          :class="{ active: activeCategory === 'fish' }"
          @click="activeCategory = 'fish'"
        >
          Fish
        </button>
      </div>

      <!-- Category Fish Deco buttons -->
       <div v-if="activeCategory==='fish'" class="category-filters">
        <button 
          v-for="(deco,cat) in fishDecoStore.fishDecorations"
          
          :key="deco"
          class="filter-btn"
          :class="{ active: activeDecoCategory.includes(cat)}"
          @click="addDecoCategory(cat)"
          
          
        >
          {{cat}}
        </button>
        
        
        


       </div>

      <!-- Carousel -->
      <div class="carousel-section">
        <div class="carousel-container">
          <!-- Left Item (Smaller, Opaque) -->
          <div class="custom-carousel-item carousel-item-left" @click="previousItem">
            <div class="item-preview">
              <span class="item-icon small">{{ getPreviousItem().icon }}</span>
            </div>
          </div>

          <!-- Center Item (Main Display) -->
          <div class="custom-carousel-item carousel-item-center">
            <div class="item-card">
              <div class="item-display">
                <span class="item-icon large">{{ getCurrentItem().icon }}</span>
              </div>
              <div class="item-info">
                <h3 class="item-name">{{ getCurrentItem().name }}</h3>
                <div class="item-price">
                  <span class="coin-icon">💰</span>
                  <span class="price-amount">{{ getCurrentItem().cost }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Item (Smaller, Opaque) -->
          <div class="custom-carousel-item carousel-item-right" @click="nextItem">
            <div class="item-preview">
              <span class="item-icon large">{{ getNextItem().icon }}</span>
            </div>
          </div>

          <!-- Navigation Arrows -->
          <button class="carousel-nav carousel-nav-left" @click="previousItem">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button class="carousel-nav carousel-nav-right" @click="nextItem">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>

        <!-- Buy Button -->
        <button class="buy-button" @click="buyItem" :disabled="!canBuy">
          <i class="bi bi-plus-circle"></i>
          Buy
        </button>
      </div>

      <!-- Inventory Section -->

      <div class="inventory-section">
        <h2>Inventory</h2>
        <div class="inventory-grid">
          <div 
            v-for="(slot, index) in inventorySlots" 
            :key="index"
            class="inventory-slot"
            :class="{ 
              'has-item': slot.item,
              'selected': editMode && selectedSlots.includes(index)
            }"
            @click="handleSlotClick(index)"
          >
            <div v-if="slot.item" class="inventory-item">
              <span class="inventory-icon">{{ slot.item.icon }}</span>
              <button 
                v-if="editMode" 
                class="delete-slot-btn" 
                @click.stop="removeFromSlot(index)"
              >
                &times;
              </button>
            </div>
          </div>
        </div>

        <!-- Inventory Actions -->
        <div class="inventory-actions">
          <button v-if="!editMode" class="edit-btn" @click="enterEditMode">
            Edit
          </button>
          <button v-if="editMode" class="save-btn" @click="saveInventory">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAquariumStore } from '../stores/aquariumStore';
import { useUserStore } from '../stores/userStore';
import { useFishDecoStore} from '../stores/fishDecoStore';

const fishDecoStore=useFishDecoStore();
const aquariumStore = useAquariumStore();
const userStore = useUserStore();



// Search
const searchQuery = ref('');
const showSearchResults = ref(false);

// Category
const activeCategory = ref('aquarium');


// Carousel
const currentIndex = ref(0);

// Inventory
const inventorySlots = ref(Array.from({ length: 15 }, () => ({ item: null })));
const editMode = ref(false);
const selectedSlots = ref([]);

// Shop Items
const activeDecoCategory=ref([])

function addDecoCategory(cat){
  if (activeDecoCategory.value.includes(cat)){
    activeDecoCategory.value=activeDecoCategory.value.filter(item=>item !==cat);
    
  }
  else{
    activeDecoCategory.value.push(cat)

  }
}

const shopItems = computed(() => {
  if (activeCategory.value === 'aquarium') {
    return Object.entries(aquariumStore.decorationTypes).map(([key, value]) => ({
      id: key,
      type: 'decoration',
      ...value
    }));
  } else {
    if (activeDecoCategory.value.length==0){
      const fishDecorations = 
      Object.entries(fishDecoStore.fishDecorations).flatMap(([category, decos]) =>
      Object.entries(decos)
        .filter(([_, value]) => value.name !== 'None') 
        .map(([key, value]) => ({
          id: key,
          category,  // e.g. 'head', 'eye'
          name: value.name,
          icon: value.icon,
          cost: value.cost
        }))

      );

      return fishDecorations
      


    
    
    // Fish decorations - blank templates for now
    
  }
  else{
    
      const fishDecorations = 
      Object.entries(fishDecoStore.fishDecorations).filter(([key,vaue1])=>activeDecoCategory.value.includes(key)).flatMap(([category, decos]) =>
      Object.entries(decos)
        .filter(([_, value]) => value.name !== 'None') 
        .map(([key, value]) => ({
          id: key,
          category,  // e.g. 'head', 'eye'
          name: value.name,
          icon: value.icon,
          cost: value.cost
        }))

      );

      return fishDecorations

      
      
    
  }
}});



// Search functionality
const filteredSearchResults = computed(() => {
  if (!searchQuery.value) return [];
  
  const query = searchQuery.value.toLowerCase();
  const allItems = [
    ...Object.entries(aquariumStore.decorationTypes).map(([key, value]) => ({
      id: key,
      category: 'aquarium',
      type: 'decoration',
      ...value
    })),
    { id: 'fish-deco-1', name: 'Fish Decoration 1', icon: '🐠', cost: 100, category: 'fish', type: 'fish' },
    { id: 'fish-deco-2', name: 'Fish Decoration 2', icon: '🐟', cost: 150, category: 'fish', type: 'fish' },
    { id: 'fish-deco-3', name: 'Fish Decoration 3', icon: '🐡', cost: 200, category: 'fish', type: 'fish' },
  ];

  return allItems.filter(item => 
    item.name.toLowerCase().includes(query)
  );
});

function getSearchResultsByCategory(category) {
  return filteredSearchResults.value.filter(item => item.category === category);
}

function selectSearchItem(item) {
  activeCategory.value = item.category;
  const categoryItems = shopItems.value;
  const index = categoryItems.findIndex(i => i.id === item.id);
  if (index !== -1) {
    currentIndex.value = index;
  }
  showSearchResults.value = false;
  searchQuery.value = '';
}

// Close search results when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-section')) {
      showSearchResults.value = false;
    }
  });
});

// Carousel Navigation
function getCurrentItem() {
  return shopItems.value[currentIndex.value] || { name: 'No items', icon: '❓', cost: 0 };
}

function getPreviousItem() {
  const prevIndex = currentIndex.value === 0 
    ? shopItems.value.length - 1 
    : currentIndex.value - 1;
  return shopItems.value[prevIndex] || { name: '', icon: '❓', cost: 0 };
}

function getNextItem() {
  const nextIndex = (currentIndex.value + 1) % shopItems.value.length;
  return shopItems.value[nextIndex] || { name: '', icon: '❓', cost: 0 };
}

function previousItem() {
  if (shopItems.value.length === 0) return;
  currentIndex.value = currentIndex.value === 0 
    ? shopItems.value.length - 1 
    : currentIndex.value - 1;
}

function nextItem() {
  if (shopItems.value.length === 0) return;
  currentIndex.value = (currentIndex.value + 1) % shopItems.value.length;
}

// Buy functionality
const canBuy = computed(() => {
  const item = getCurrentItem();
  return userStore.totalPoints >= item.cost;
});

function buyItem() {
  if (!canBuy.value) {
    alert('Not enough points!');
    return;
  }

  const item = getCurrentItem();
  
  // Find first empty slot
  const emptySlotIndex = inventorySlots.value.findIndex(slot => !slot.item);
  
  if (emptySlotIndex === -1) {
    alert('Inventory is full!');
    return;
  }

  // Add to inventory
  inventorySlots.value[emptySlotIndex].item = { ...item };
  
  // Deduct points (you'll need to implement this in userStore)
  // userStore.deductPoints(item.cost);
  
  alert(`${item.name} added to inventory!`);
}

// Inventory management
function handleSlotClick(index) {
  if (!editMode.value) return;

  const slotIndex = selectedSlots.value.indexOf(index);
  if (slotIndex > -1) {
    selectedSlots.value.splice(slotIndex, 1);
  } else {
    selectedSlots.value.push(index);
  }
}

function removeFromSlot(index) {
  inventorySlots.value[index].item = null;
}

function enterEditMode() {
  editMode.value = true;
  selectedSlots.value = [];
}

function saveInventory() {
  editMode.value = false;
  selectedSlots.value = [];
  // Save to database if needed
  alert('Inventory saved!');
}
</script>

<style scoped>
.shop-view {
  min-height: calc(100vh - 70px);
  background: #f8f9fa;
}

/* Search Section */
.search-section {
  position: relative;
  margin-bottom: 2rem;
}

.search-bar-container {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.search-bar {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  font-size: 1.1rem;
  border: 2px solid #e5e7eb;
  border-radius: 50px;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-bar:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.search-icon {
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.3rem;
  color: #6b7280;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  max-height: 400px;
  overflow-y: auto;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 15px;
  margin-top: 0.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.search-empty {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.search-category-header {
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  font-weight: bold;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.search-result-item {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.search-result-item:hover {
  background: #f9fafb;
}

.search-item-icon {
  font-size: 1.8rem;
  min-width: 40px;
  text-align: center;
}

.search-item-name {
  flex: 1;
  font-weight: 500;
  color: #1f2937;
}

.search-item-price {
  font-weight: 600;
  color: #667eea;
}

/* Category Filters */
.category-filters {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.filter-btn {
  padding: 0.75rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  border-radius: 50px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* Carousel Section */
.carousel-section {
  margin-bottom: 4rem;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 3rem 1rem;
  min-height: 400px;
}

.custom-carousel-item {
  transition: all 0.4s ease;
  display: flex; /* ADD THIS */
  align-items: center; /* ADD THIS */
  justify-content: center;

}

.carousel-item-left,
.carousel-item-right {
  opacity: 0.4;
  transform: scale(0.7);
  cursor: pointer;
  

}

.carousel-item-left:hover,
.carousel-item-right:hover {
  opacity: 0.6;
  transform: scale(0.75);
}

.item-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.carousel-item-center {
  transform: scale(1);
  z-index: 2;
  
}

.item-card {
  background: white;
  border-radius: 25px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  text-align: center;
}

.item-display {
  margin-bottom: 1.5rem;
}

.item-icon {
  display: inline-block;
}

.item-icon.small {
  font-size: 3rem;
}

.item-icon.large {
  font-size: 5rem;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-name {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

.item-price {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.coin-icon {
  font-size: 1.8rem;
}

.price-amount {
  font-size: 2rem;
}

/* Carousel Navigation */
.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.5rem;
  color: #6b7280;
  z-index: 10;
}

.carousel-nav:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-50%) scale(1.1);
}

.carousel-nav-left {
  left: 1rem;
}

.carousel-nav-right {
  right: 1rem;
}

/* Buy Button */
.buy-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 0 auto;
  padding: 1rem 3rem;
  font-size: 1.3rem;
  font-weight: bold;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.buy-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
}

.buy-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.buy-button i {
  font-size: 1.5rem;
}

/* Inventory Section */
.inventory-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.inventory-section h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #1f2937;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto 2rem;
}

.inventory-slot {
  aspect-ratio: 1;
  border: 3px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.inventory-slot:hover {
  border-color: #cbd5e1;
  transform: scale(1.05);
}

.inventory-slot.has-item {
  background: white;
  border-color: #667eea;
}

.inventory-slot.selected {
  background: #eef2ff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.inventory-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.inventory-icon {
  font-size: 2.5rem;
}

.delete-slot-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border: 2px solid white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.2s ease;
  padding: 0;
  line-height: 1;
}

.delete-slot-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

/* Inventory Actions */
.inventory-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.edit-btn,
.save-btn {
  padding: 0.75rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #667eea;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.edit-btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.save-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

/* Responsive */
@media (max-width: 992px) {
  .carousel-container {
    gap: 1rem;
    padding: 2rem 0.5rem;
  }

  .item-preview {
    width: 100px;
    height: 100px;
  }

  .item-icon.small {
    font-size: 2rem;
  }

  .item-card {
    min-width: 250px;
    padding: 2rem;
  }

  .item-icon.large {
    font-size: 4rem;
  }

  .inventory-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .search-bar {
    font-size: 1rem;
    padding: 0.875rem 0.875rem 0.875rem 2.75rem;
  }

  .filter-btn {
    padding: 0.625rem 2rem;
    font-size: 1rem;
  }

  .carousel-item-left,
  .carousel-item-right {
    display: none;
  }

  .carousel-nav {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .item-card {
    min-width: 220px;
    padding: 1.5rem;
  }

  .item-name {
    font-size: 1.5rem;
  }

  .buy-button {
    padding: 0.875rem 2.5rem;
    font-size: 1.1rem;
  }

  .inventory-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .inventory-icon {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .carousel-nav-left {
    left: 0.5rem;
  }

  .carousel-nav-right {
    right: 0.5rem;
  }

  .inventory-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
}
</style>