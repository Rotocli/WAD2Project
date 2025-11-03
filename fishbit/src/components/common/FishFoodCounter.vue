<template>
  <div 
    class="fish-food-counter"
    :class="{ 'dragging': isDragging }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    :title="`Fish Food - Revive dead fish! (${fishFoodCount} available)`"
  >
    <div class="fish-food-icon">🍖</div>
    <div class="fish-food-count" v-if="fishFoodCount > 0">{{ fishFoodCount }}</div>
    <div class="fish-food-label">Fish Food</div>
    
    <!-- Tooltip on hover -->
    <div class="fish-food-tooltip">
      Drag & drop on dead fish to revive them!
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useInventoryStore } from '../../stores/inventoryStore'

const inventoryStore = useInventoryStore()
const isDragging = ref(false)

const fishFoodCount = computed(() => inventoryStore.totalFishFood)

function handleDragStart(event) {
  console.log('🍖 [DRAG] Started dragging fish food')
  isDragging.value = true
  
  // Set data transfer to identify this as fish food
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('itemType', 'fishfood')
  event.dataTransfer.setData('itemId', 'revival_food')
  
  // Optional: Create custom drag image
  const dragImage = document.createElement('div')
  dragImage.textContent = '🍖'
  dragImage.style.fontSize = '48px'
  dragImage.style.position = 'absolute'
  dragImage.style.top = '-1000px'
  document.body.appendChild(dragImage)
  event.dataTransfer.setDragImage(dragImage, 24, 24)
  setTimeout(() => document.body.removeChild(dragImage), 0)
}

function handleDragEnd() {
  console.log('🍖 [DRAG] Stopped dragging fish food')
  isDragging.value = false
}
</script>

<style scoped>
.fish-food-counter {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 16px;
  cursor: grab;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
  user-select: none;
}

.fish-food-counter:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 20px rgba(251, 191, 36, 0.5);
}

.fish-food-counter:active {
  cursor: grabbing;
}

.fish-food-counter.dragging {
  opacity: 0.5;
  cursor: grabbing;
  transform: scale(0.9);
}

.fish-food-icon {
  font-size: 48px;
  line-height: 1;
  margin-bottom: 8px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.fish-food-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  font-weight: bold;
  font-size: 14px;
  min-width: 24px;
  height: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  border: 2px solid white;
}

.fish-food-label {
  font-size: 12px;
  font-weight: 600;
  color: #78350f;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fish-food-tooltip {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 1000;
}

.fish-food-counter:hover .fish-food-tooltip {
  opacity: 1;
}

/* Pulsing effect when you have fish food */
.fish-food-counter::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.4));
  animation: pulse 2s ease-in-out infinite;
  z-index: -1;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .fish-food-counter {
    padding: 10px 14px;
  }
  
  .fish-food-icon {
    font-size: 36px;
  }
  
  .fish-food-count {
    font-size: 12px;
    min-width: 20px;
    height: 20px;
  }
  
  .fish-food-label {
    font-size: 10px;
  }
}
</style>
