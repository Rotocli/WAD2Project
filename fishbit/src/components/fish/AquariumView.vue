<template>
  <div class="aquarium-container" :style="aquariumStyle">
    <!-- Aquarium Label -->
    <div class="aquarium-label">
      🐟 Your Habit Aquarium - {{ totalFishCount }} Fish ({{ deadFishCount }} 💀)
    </div>

    <!-- Water Surface Effect -->
    <div class="water-surface"></div>

    <!-- Background Layer (Fish and decorations at back) -->
    <div class="layer layer-back">
      <FishSprite
        v-for="fish in backLayerFish"
        :key="fish.id"
        :fish="fish"
        @fish-clicked="onFishClick"
      />
      <DecorationSprite
        v-for="decoration in backDecorations"
        :key="decoration.id"
        :decoration="decoration"
      />
    </div>
    <!-- Mid Layer (Some fish) -->
    <div class="layer layer-mid">
      <FishSprite
        v-for="fish in midLayerFish"
        :key="fish.id"
        :fish="fish"
        @fish-clicked="onFishClick"
      />
    </div>

    <!-- Front Layer (Other fish and front decorations) -->
    <div class="layer layer-front">
      <FishSprite
        v-for="fish in frontLayerFish"
        :key="fish.id"
        :fish="fish"
        @fish-clicked="onFishClick"
      />
      <DecorationSprite
        v-for="decoration in frontDecorations"
        :key="decoration.id"
        :decoration="decoration"
      />
    </div>

    <!-- NEW: Dead Fish Layer (floating at the top) -->
    <div class="layer layer-dead">
      <FishSprite
        v-for="fish in deadFish"
        :key="fish.id"
        :fish="fish"
        @fish-clicked="onFishClick"
        @fish-revived="handleFishRevival"
      />
    </div>

    <!-- Surface Layer (Bubbles) -->
    <div class="layer layer-surface">
      <div 
        v-for="(bubble, index) in bubbles" 
        :key="`bubble-${index}`"
        class="bubble"
        :style="bubbleStyle(index)"
      ></div>
    </div>

    <!-- Substrate (sand/gravel at bottom) -->
    <div class="substrate" :style="substrateStyle"></div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Loading your aquarium...</p>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && totalFishCount === 0" class="empty-state">
      <span class="empty-icon">🐠</span>
      <h3>Your aquarium is empty!</h3>
      <p>Create your first habit to get your first fish</p>
      <router-link to="/habits" class="btn btn-primary">
        Create Habit
      </router-link>
    </div>

    <!-- NEW: Revival Success Modal -->
    <div v-if="showRevivalModal" class="revival-modal">
      <div class="revival-modal-content">
        <div class="revival-icon">🍖✨</div>
        <h3>Fish Revival Scheduled!</h3>
        <p><strong>{{ revivingFishName }}</strong> is being revived!</p>
        <p class="revival-message">Come back soon to see your fish alive!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useFishStore } from '../../stores/fishStore'
import { useAquariumStore } from '../../stores/aquariumStore'
import { useUserStore } from '../../stores/userStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import FishSprite from './FishSprite.vue'
import DecorationSprite from './DecorationSprite.vue'

const fishStore = useFishStore()
const aquariumStore = useAquariumStore()
const userStore = useUserStore()
const inventoryStore = useInventoryStore()

const emit = defineEmits(['fish-clicked'])

const loading = ref(true)
const bubbles = ref([])
const showRevivalModal = ref(false)
const revivingFishName = ref('')

// Emit fish click event to parent
function onFishClick(fish) {
  emit('fish-clicked', fish)
}

// NEW: Handle fish revival with fish food
async function handleFishRevival(fish) {
  console.log('🍖 [REVIVAL] Attempting to revive fish:', fish.customName)
  
  try {
    // Use fish food from inventory
    await inventoryStore.useFishFood(fish.id)
    
    // Mark fish for revival (will happen after page refresh/reload)
    await fishStore.updateFish(fish.id, {
      revivalPending: true,
      revivalScheduledAt: new Date()
    })
    
    // Show success modal
    revivingFishName.value = fish.customName
    showRevivalModal.value = true
    
    console.log(`✅ [REVIVAL] Fish "${fish.customName}" scheduled for revival!`)
    
    // Auto-hide modal after 3 seconds
    setTimeout(() => {
      showRevivalModal.value = false
    }, 3000)
    
  } catch (error) {
    console.error('❌ [REVIVAL] Error reviving fish:', error)
    alert(error.message || 'Failed to revive fish')
  }
}

// Computed properties
const totalFishCount = computed(() => fishStore.fish.length)
const aliveFishCount = computed(() => fishStore.activeFish.length)
const deadFishCount = computed(() => fishStore.fish.filter(f => !f.isAlive).length)

const aquariumStyle = computed(() => ({
  background: aquariumStore.currentLighting.gradient,
  filter: aquariumStore.currentLighting.filter
}))

const substrateStyle = computed(() => ({
  background: `linear-gradient(180deg, 
    ${aquariumStore.currentSubstrate.color}40 0%, 
    ${aquariumStore.currentSubstrate.color}80 50%,
    ${aquariumStore.currentSubstrate.color} 100%)`
}))

// Separate ALIVE fish by layer for depth effect
const backLayerFish = computed(() => {
  const filtered = fishStore.activeFish.filter(f => f.position.layer === 0)
  console.log('🎯 backLayerFish computed:', filtered.map(f => f.customName))
  return filtered
})

const midLayerFish = computed(() => 
  fishStore.activeFish.filter(f => f.position.layer === 1)
)

const frontLayerFish = computed(() => 
  fishStore.activeFish.filter(f => f.position.layer === 2)
)

// NEW: Dead fish (all dead fish float at the top)
const deadFish = computed(() => {
  const dead = fishStore.fish.filter(f => !f.isAlive)
  console.log('💀 deadFish computed:', dead.length, 'dead fish')
  
  // Position dead fish at the top of the aquarium, floating
  return dead.map((fish, index) => {
    return {
      ...fish,
      // Override position to float at top
      position: {
        ...fish.position,
        x: 15 + (index * 20) % 70, // Spread them across the top
        y: 5, // Near the top of the aquarium
        layer: 3 // Above all other fish
      },
      // Mark as dead for styling
      isDead: true
    }
  })
})

// Separate decorations by layer
const backDecorations = computed(() =>
  aquariumStore.settings.decorations.filter(d => d.layer === 0 || !d.layer)
)

const frontDecorations = computed(() =>
  aquariumStore.settings.decorations.filter(d => d.layer === 1)
)

// Bubble animation styles
function bubbleStyle(index) {
  const positions = [10, 25, 40, 55, 70, 85, 15, 60]
  const delays = [0, 2, 4, 1, 3, 5, 1.5, 3.5]
  const sizes = [8, 10, 12, 9, 11, 8, 10, 9]
  
  return {
    left: `${positions[index % positions.length]}%`,
    animationDelay: `${delays[index % delays.length]}s`,
    width: `${sizes[index % sizes.length]}px`,
    height: `${sizes[index % sizes.length]}px`
  }
}

// Initialize bubbles
function createBubbles() {
  bubbles.value = Array(8).fill(null)
}

// Load aquarium data
async function loadAquariumData() {
  const userId = userStore.currentUserId
  console.log('🌊 AquariumView: loadAquariumData called with userId:', userId)
  
  if (!userId) {
    console.warn('⚠️ AquariumView: No userId available, skipping load')
    loading.value = false
    return
  }
  
  loading.value = true
  try {
    console.log('🐠 AquariumView: Fetching fish and aquarium settings...')
    await Promise.all([
      fishStore.fetchFish(userId),
      aquariumStore.fetchSettings(userId)
    ])
    
    console.log('✅ AquariumView: Data loaded. Total fish:', fishStore.fish.length, 'Alive:', fishStore.activeFish.length, 'Dead:', fishStore.fish.filter(f => !f.isAlive).length)
    console.log('🎨 Layer distribution:', {
      back: fishStore.activeFish.filter(f => f.position.layer === 0).map(f => f.customName),
      mid: fishStore.activeFish.filter(f => f.position.layer === 1).map(f => f.customName),
      front: fishStore.activeFish.filter(f => f.position.layer === 2).map(f => f.customName),
      dead: fishStore.fish.filter(f => !f.isAlive).map(f => f.customName)
    })
    createBubbles()
  } catch (error) {
    console.error('❌ AquariumView: Error loading aquarium:', error)
  } finally {
    loading.value = false
  }
}

// Watch for user authentication changes
watch(
  () => userStore.currentUserId,
  (userId, oldUserId) => {
    console.log('👤 AquariumView: User ID changed from', oldUserId, 'to', userId)
    if (userId) {
      loadAquariumData()
    }
  },
  { immediate: true }
)

// Lifecycle - also try to load on mount as a fallback
onMounted(async () => {
  console.log('🎬 AquariumView: Component mounted. User authenticated:', userStore.isAuthenticated, 'User ID:', userStore.currentUserId)
  
  // Small delay to ensure auth state is settled
  await new Promise(resolve => setTimeout(resolve, 100))
  
  if (userStore.currentUserId && fishStore.fish.length === 0) {
    console.log('🔄 AquariumView: Triggering load from onMounted')
    loadAquariumData()
  }
})
</script>

<style scoped>
.aquarium-container {
  position: relative;
  width: 100%;
  height: 450px;
  overflow: hidden;
  border-radius: 15px 15px 0 0;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.2);
  transition: all 0.5s ease;
}

/* Water Surface Effect */
.water-surface {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.3) 0%, 
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 3s ease-in-out infinite;
  z-index: 10;
  pointer-events: none;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.8; }
}

/* Depth Layers */
.layer {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.layer-back { 
  z-index: 1;
  opacity: 0.7;
}

.layer-mid { 
  z-index: 2;
  opacity: 0.9;
}

.layer-front { 
  z-index: 3;
}

/* NEW: Dead fish layer - above everything */
.layer-dead {
  z-index: 4;
  pointer-events: none;
}

.layer-surface { 
  z-index: 5;
}

/* Bubbles */
.bubble {
  position: absolute;
  bottom: -30px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, 
    rgba(255, 255, 255, 0.8), 
    rgba(255, 255, 255, 0.3)
  );
  animation: rise 6s infinite ease-in;
  opacity: 0.6;
  pointer-events: none;
}

@keyframes rise {
  0% {
    bottom: -30px;
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    bottom: 110%;
    opacity: 0;
    transform: translateX(30px);
  }
}

/* Substrate (sand/gravel at bottom) */
.substrate {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  z-index: 0;
  pointer-events: none;
}

/* Aquarium Label */
.aquarium-label {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 10px 25px;
  border-radius: 20px;
  font-weight: bold;
  color: #1e3a8a;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 11;
  backdrop-filter: blur(10px);
  font-size: 14px;
  pointer-events: none;
}

/* Loading State */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 20;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e7ff;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.empty-icon {
  font-size: 80px;
  display: block;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.empty-state h3 {
  font-size: 24px;
  margin-bottom: 10px;
  color: white;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.8);
}

.empty-state .btn {
  background: white;
  color: #667eea;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-weight: bold;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.empty-state .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* NEW: Revival Modal */
.revival-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.revival-modal-content {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  padding: 32px;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.revival-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: revivalPulse 1s ease-in-out infinite;
}

@keyframes revivalPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.revival-modal-content h3 {
  color: #78350f;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
}

.revival-modal-content p {
  color: #92400e;
  font-size: 16px;
  margin-bottom: 8px;
}

.revival-message {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-top: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .aquarium-container {
    height: 300px;
  }
  
  .aquarium-label {
    font-size: 12px;
    padding: 8px 20px;
  }
  
  .empty-icon {
    font-size: 60px;
  }
  
  .empty-state h3 {
    font-size: 20px;
  }
}
</style>
