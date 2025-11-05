<template>
  <div class="shop-view">
    <div class="container-fluid p-4">
      <!-- Search Bar -->
      <h2>Shop</h2>
      <p>Look for your next favourite item:</p>
      
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
                  
                  <span ><img class="search-item-icon" :src="item.icon" alt=""></span>
                  <span class="search-item-name">{{ item.name }}</span>
                  <span class="search-item-price">💰 {{ item.cost }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Points Display -->
      <div class="coins-display">
        <span class="coin-icon">💰</span>
        <span class="coin-amount">{{ userStore.totalPoints || 0 }}</span>
      </div>

      <!-- Category Filter Buttons -->
      <div class="category-filters">
        <button 
          class="filter-btn"
          :class="{ active: activeCategory === 'aquarium' }"
          @click="activeCategory = 'aquarium'; activeDecoCategory = []"
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

      <!-- Sub-category Fish Deco buttons -->
      <div v-if="activeCategory === 'fish'" class="category-filters">
        <button 
          v-for="(decos, cat) in fishDecoStore.fishDecorations"
          :key="cat"
          class="filter-btn sub-filter"
          :class="{ active: activeDecoCategory.includes(cat) }"
          @click="toggleDecoCategory(cat)"
        >
          {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
        </button>
      </div>

      <!-- Carousel -->
      <div class="carousel-section">
        <div class="carousel-container">
          <!-- Left Item -->
          <div class="custom-carousel-item carousel-item-left" @click="previousItem">
            <div class="item-preview">
              <span><img class="item-icon small" :src="getPreviousItem().icon" alt=""></span>
            </div>
          </div>

          <!-- Center Item -->
          <div class="custom-carousel-item carousel-item-center">
            <div class="item-card">
              <div class="item-display">
                <span class="item-icon large"><img class="item-icon large" :src="getCurrentItem().icon" alt=""></span>
              </div>
              <div class="item-info">
                <h3 class="item-name">{{ getCurrentItem().name }}</h3>
                <div class="item-price">
                  <span class="coin-icon">💰</span>
                  <span class="price-amount">{{ getCurrentItem().cost }}</span>
                </div>
                <div v-if="inventoryStore.hasItem(getCurrentItem().id)" class="owned-badge">
                  ✓ Owned ({{ inventoryStore.getQuantity(getCurrentItem().id) }})
                </div>
              </div>
            </div>
          </div>

          <!-- Right Item -->
          <div class="custom-carousel-item carousel-item-right" @click="nextItem">
            <div class="item-preview">
              <span><img class="item-icon small" :src="getNextItem().icon" alt=""></span>
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
          {{ inventoryStore.hasItem(getCurrentItem().id) ? 'Buy Another' : 'Buy' }}
        </button>
      </div>

      <!-- Inventory Section -->
      <div class="inventory-section">
        <h2>Inventory</h2>
        <div class="inventory-grid">
          <div 
            v-for="(item, index) in inventorySlots" 
            :key="index"
            class="inventory-slot"
            :class="{ 
              'has-item': item,
              'selected': editMode && selectedSlots.includes(index)
            }"
            @click="handleSlotClick(index)"
          >
            <div v-if="item" class="inventory-item py-1 pt-3" :class="{ 'in-use': item.inUse }">
              <span ><img class="inventory-icon mb-3 mt-1 mx-auto d-block text-center" :src="item.icon" alt=""></span>
              <span class="d-block text-center ">{{ item.name }}</span>
              
              <button 
                v-if="editMode && !item.inUse" 
                class="delete-slot-btn" 
                @click.stop="removeFromSlot(index)"
              >
                &times;
              </button>
              <div v-if="item.inUse" class="in-use-badge">In Use</div>
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
import { useFishDecoStore } from '../stores/fishDecoStore';
import { useInventoryStore } from '../stores/inventoryStore';

const fishDecoStore = useFishDecoStore();
const aquariumStore = useAquariumStore();
const userStore = useUserStore();
const inventoryStore = useInventoryStore();

// Search
const searchQuery = ref('');
const showSearchResults = ref(false);

// Category
const activeCategory = ref('aquarium');
const activeDecoCategory = ref([]);
const inventoryTab = ref('all');

// Carousel
const currentIndex = ref(0);

// Inventory - using original slot-based system
const inventorySlots = ref([]);
const editMode = ref(false);
const selectedSlots = ref([]);

// Load inventory on mount
onMounted(async () => {
  await inventoryStore.fetchInventory();
  loadInventoryIntoSlots();
  
  // Close search on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-section')) {
      showSearchResults.value = false;
    }
  });
});

// Load inventory items into slots (15 slots total)
function loadInventoryIntoSlots() {
  inventorySlots.value = Array.from({ length: 30 }, () => null);
  inventoryStore.inventoryItems.forEach((item, index) => {
    if (index < 30) {
      inventorySlots.value[index] = item;
    }
  });
}

// Toggle deco category filter
function toggleDecoCategory(cat) {
  const index = activeDecoCategory.value.indexOf(cat);
  if (index > -1) {
    activeDecoCategory.value.splice(index, 1);
  } else {
    activeDecoCategory.value.push(cat);
  }
  // Reset carousel to first item when filter changes
  currentIndex.value = 0;
}

// Shop Items
const shopItems = computed(() => {
  if (activeCategory.value === 'aquarium') {
    return Object.entries(aquariumStore.decorationTypes).map(([key, value]) => ({
      id: key,
      type: 'aquarium',
      ...value
    }));
  } else {
    const allFishDecos = Object.entries(fishDecoStore.fishDecorations).flatMap(([category, decos]) =>
      Object.entries(decos)
        .filter(([_, value]) => value.name !== 'None')
        .map(([key, value]) => ({
          id: key,
          type: 'fish',
          category,
          name: value.name,
          icon: value.icon,
          cost: value.cost
        }))
    );

    if (activeDecoCategory.value.length === 0) {
      return allFishDecos;
    } else {
      return allFishDecos.filter(item => 
        activeDecoCategory.value.includes(item.category)
      );
    }
  }
});

// Inventory Display
const displayedInventory = computed(() => {
  if (inventoryTab.value === 'all') {
    return inventoryStore.inventoryItems;
  } else if (inventoryTab.value === 'aquarium') {
    return inventoryStore.aquariumDecorations;
  } else {
    return inventoryStore.fishDecorations;
  }
});

// Search functionality
const filteredSearchResults = computed(() => {
  if (!searchQuery.value) return [];
  
  const query = searchQuery.value.toLowerCase();
  const allItems = [
    ...Object.entries(aquariumStore.decorationTypes).map(([key, value]) => ({
      id: key,
      category: 'aquarium',
      type: 'aquarium',
      ...value
    })),
    ...Object.entries(fishDecoStore.fishDecorations).flatMap(([category, decos]) =>
      Object.entries(decos)
        .filter(([_, value]) => value.name !== 'None')
        .map(([key, value]) => ({
          id: key,
          category: 'fish',
          type: 'fish',
          name: value.name,
          icon: value.icon,
          cost: value.cost
        }))
    )
  ];

  return allItems.filter(item => 
    item.name.toLowerCase().includes(query)
  );
});

function getSearchResultsByCategory(category) {
  return filteredSearchResults.value.filter(item => item.type === category);
}

function selectSearchItem(item) {
  activeCategory.value = item.type;
  const categoryItems = shopItems.value;
  const index = categoryItems.findIndex(i => i.id === item.id);
  if (index !== -1) {
    currentIndex.value = index;
  }
  showSearchResults.value = false;
  searchQuery.value = '';
}

// Carousel Navigation
function getCurrentItem() {
  return shopItems.value[currentIndex.value] || { name: 'No items', icon: '❓', cost: 0, id: '' };
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

async function buyItem() {
  if (!canBuy.value) {
    alert('Not enough coins!');
    return;
  }

  const item = getCurrentItem();
  
  try {
    const result = await inventoryStore.purchaseItem(item);
    alert(result.message);
    // Reload inventory into slots after purchase
    loadInventoryIntoSlots();
  } catch (err) {
    alert(err.message);
  }
}

// Inventory management - original style
function handleSlotClick(index) {
  if (!editMode.value) return;

  const slotIndex = selectedSlots.value.indexOf(index);
  if (slotIndex > -1) {
    selectedSlots.value.splice(slotIndex, 1);
  } else {
    selectedSlots.value.push(index);
  }
}

async function removeFromSlot(index) {
  const item = inventorySlots.value[index];
  if (!item) return;

  try {
    await inventoryStore.removeItem(item.itemId);
    inventorySlots.value[index] = null;
  } catch (err) {
    alert('Error removing item: ' + err.message);
  }
}

function enterEditMode() {
  editMode.value = true;
  selectedSlots.value = [];
}

function saveInventory() {
  editMode.value = false;
  selectedSlots.value = [];
  alert('Inventory saved!');
}
</script>

<style scoped>
.shop-view {
  min-height: calc(100vh - 70px);
  background: linear-gradient(#d3faf5,#489eea);
}

/* Coins Display */
.coins-display {
  position: fixed;
  top: 80px;
  right: 20px;
  background: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  z-index: 99;
}

.coin-amount {
  color: black;
}

/* Search Section */
.search-section {
  padding: 1rem;
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
  border-color: #81c1e9;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.search-icon {
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.3rem;
  color: #81c1e9;
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
  background: transparent;
  backdrop-filter: blur(20px);
  border: 2px solid #e5e7eb;
  border-radius: 15px;
  margin-top: 0.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 50;
}

.search-empty {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.search-category-header {
  padding: 0.75rem 1.5rem;
  background: #81c1e9;
  font-weight: bold;
  color: #ffffff;
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
  background: rgba(26, 85, 78, 0.1);
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
  color: black;
}

/* Category Filters */
.category-filters {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
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

.filter-btn.sub-filter {
  padding: 0.5rem 1.5rem;
  font-size: 0.95rem;
}

.filter-btn:hover {
  border-color: #c18159;
  background-color: #9e5e36;
  color: white;
}

.filter-btn.active {
  background: #c18159;
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
  display: flex;
  align-items: center;
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
  min-width: 100%;
}

.item-icon.large {
  font-size: 5rem;
  min-width: 100%;
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
  color: black;
}

.coin-icon {
  font-size: 1.8rem;
}

.price-amount {
  font-size: 2rem;
}

.owned-badge {
  background: #10b981;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
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
  background: #81c1e9;
  color: white;
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
  background: #81c1e9;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 92, 185, 0.4);
}

.buy-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(16, 109, 185, 0.5);
}

.buy-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Inventory Section */
.inventory-section {
  background: #c18159;
  border-radius: 30px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.inventory-section h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 600;
  color: white;
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
  border: 3px solid #834721;
  border-radius: 12px;
  background: #9e5e36;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.inventory-slot:hover {
  border-color: #834721;
  transform: scale(1.05);
}

.inventory-slot.has-item {
  background: #9e5e36;
  border-color: #834721;
}

.inventory-slot.selected {
  background: #e1986add;
  border-color: rgb(247, 170, 121);
}

.inventory-item {
  width: 100%;
  height: 100%;
  display: flex;
  color: white;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  text-align: center;
  font-size: 1rem;
  bottom: 0;
}

.inventory-icon {
  font-size: 2.8rem; 
  width: 100%;
  height: 200%;
  max-width: 300px;
  max-height: 300px;
  margin-bottom: 1.5rem;
  position: relative;
  top: -35px;
  object-fit: contain;
}

.delete-slot-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #fff9f9;
  color: rgb(252, 118, 92);
  border: 2px solid rgb(252, 118, 92);
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
  background: #dc6326;
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
  background: #9e5e36;
  color: white;
}

.edit-btn:hover {
  background: #834721;
  transform: translateY(-2px);
}

.save-btn {
  background: #9e5e36 ;
  color: white;
}

.save-btn:hover {
  background:#834721;;
  transform: translateY(-2px);
}

.inventory-item.in-use {
  opacity: 0.6;
  filter: grayscale(0.5);
}

.in-use-badge {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  background: rgb(252, 118, 92);
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: bold;
  white-space: nowrap;
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
}

@media (max-width: 768px) {
  .coins-display {
    top: 70px;
    right: 10px;
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  .search-bar {
    font-size: 1rem;
    padding: 0.875rem 0.875rem 0.875rem 2.75rem;
  }

  .filter-btn {
    padding: 0.625rem 1.5rem;
    font-size: 1rem;
  }

  .carousel-item-left,
  .carousel-item-right {
    display: none;
  }

  .inventory-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .coins-display {
    top: 70px;
    right: 10px;
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  .search-bar {
    font-size: 1rem;
    padding: 0.875rem 0.875rem 0.875rem 2.75rem;
  }

  .filter-btn {
    padding: 0.625rem 1.5rem;
    font-size: 1rem;
  }

  .carousel-item-left,
  .carousel-item-right {
    display: none;
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