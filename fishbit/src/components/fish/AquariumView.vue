<template>
  <div class="aquarium-container" :style="aquariumStyle">
    <!-- Aquarium Label -->
    <div class="aquarium-label">
      Your Habit Aquarium - {{ fishCount }} Fish
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
    <div v-if="!loading && fishCount === 0" class="empty-state">
      <span class="empty-icon">
        <img src="@/assets/image.png" alt="FishBit Logo" width="50" height="50"/>
      </span>
      <h3>Your aquarium is empty!</h3>
      <p>Create your first habit to get your first fish</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useFishStore } from '../../stores/fishStore'
import { useAquariumStore } from '../../stores/aquariumStore'
import { useUserStore } from '../../stores/userStore'
import FishSprite from './FishSprite.vue'
import DecorationSprite from './DecorationSprite.vue'

const fishStore = useFishStore()
const aquariumStore = useAquariumStore()
const userStore = useUserStore()

const emit = defineEmits(['fish-clicked'])

const loading = ref(true)
const bubbles = ref([])

// Emit fish click event to parent
function onFishClick(fish) {
  emit('fish-clicked', fish)
}

// Computed properties
const fishCount = computed(() => fishStore.activeFish.length)

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

// Separate fish by layer for depth effect
const backLayerFish = computed(() =>
  fishStore.activeFish.filter(f => f.position.layer === 0)
)

const midLayerFish = computed(() => 
  fishStore.activeFish.filter(f => f.position.layer === 1)
)

const frontLayerFish = computed(() => 
  fishStore.activeFish.filter(f => f.position.layer === 2)
)

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

async function loadAquariumData() {
  const userId = userStore.currentUserId

  if (!userId) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    await Promise.all([
      fishStore.fetchFish(userId),
      aquariumStore.fetchSettings(userId)
    ])

    createBubbles()
  } catch (error) {
    // Error handling
  } finally {
    loading.value = false
  }
}

watch(
  () => userStore.currentUserId,
  (userId) => {
    if (userId) {
      loadAquariumData()
    }
  },
  { immediate: true }
)

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 100))

  if (userStore.currentUserId && fishStore.fish.length === 0) {
    loadAquariumData()
  }
})
</script>

<style scoped>
.aquarium-container {
  position: relative;
  width: 100vw;
  left: 50%;
  transform: translateX(-50%);
  height: 50vh;
  overflow: hidden;
}

@media (max-width: 600px) {
  .aquarium-container {
    height: 35vh;
  }
}

/* Water Surface Effect */
.water-surface {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  animation: shimmer 3s ease-in-out infinite;
  z-index: 10;
  pointer-events: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1rem; /* adds vertical space */
  margin-top: 2rem; /* pushes everything down */
}


.empty-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem; /* space between icon and text */
  transform: translateY(10px); /* nudges the icon slightly downward */
}

.empty-icon img {
  width: 70px;
  height: 70px;
  object-fit: contain;
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

.layer-surface { 
  z-index: 4;
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
  background: transparent;
  padding: 10px 25px;
  border-radius: 20px;
  font-weight: 400;
  color: white;
  z-index: 11;
  backdrop-filter: blur(10px);
  font-size: 15px;
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
  margin-bottom: 5px;
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

/* Responsive */
@media (max-width: 768px) {
  .aquarium-container {
    height: 300px;
  }
  
  .aquarium-label {
    font-size: 12px;
  }
  
  .empty-icon {
    font-size: 60px;
  }
  
  .empty-state h3 {
    font-size: 20px;
  }
}
</style>