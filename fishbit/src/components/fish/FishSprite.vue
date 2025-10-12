<template>
  <div 
    class="fish-sprite"
    :class="[`fish-${fish.species}`, `facing-${currentDirection}`, { 'paused': isPaused }]"
    :style="fishStyle"
    @click="onFishClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    :title="fish.customName"
  >
    <!-- SVG-based fish that can be customized -->
    <svg 
      :width="spriteSize" 
      :height="spriteSize * 0.75" 
      viewBox="0 0 80 60"
      class="fish-svg"
      :class="{ 'flipped': currentDirection === 'left' }"
    >
      <!-- Body -->
      <ellipse 
        cx="40" 
        cy="30" 
        rx="30" 
        ry="18" 
        :fill="fish.baseColor"
        class="fish-body"
      />
      
      <!-- Stripes/Pattern (if applicable) -->
      <g v-if="fish.pattern === 'stripes' || fish.pattern === 'default'">
        <ellipse cx="25" cy="30" rx="8" ry="12" :fill="fish.stripeColor" opacity="0.8"/>
        <ellipse cx="45" cy="30" rx="8" ry="12" :fill="fish.stripeColor" opacity="0.8"/>
      </g>
      
      <!-- Eye (positioned for right-facing fish) -->
      <circle cx="55" cy="26" r="5" fill="white"/>
      <circle cx="55" cy="26" r="3" fill="#000"/>
      
      <!-- Tail (at LEFT side for right-facing fish) -->
      <ellipse 
        cx="12" 
        cy="30" 
        rx="15" 
        ry="12" 
        :fill="fish.baseColor"
        opacity="0.9"
      />
      <path 
        d="M 8 20 L 0 30 L 8 40 Q 5 30 8 20" 
        :fill="fish.baseColor"
        opacity="0.7"
      />
      
      <!-- Top Fin -->
      <ellipse 
        cx="40" 
        cy="12" 
        rx="15" 
        ry="6" 
        :fill="fish.stripeColor"
        opacity="0.7"
      />
      
      <!-- Bottom Fin -->
      <ellipse 
        cx="40" 
        cy="48" 
        rx="15" 
        ry="6" 
        :fill="fish.stripeColor"
        opacity="0.7"
      />
      
      <!-- Mouth (at RIGHT side for right-facing fish) -->
      <path 
        d="M 75 30 L 78 28 L 75 26" 
        stroke="#000" 
        stroke-width="1" 
        fill="none"
        opacity="0.5"
      />
    </svg>

    <!-- Health/Status Indicator (optional, can be toggled) -->
    <div v-if="showHealthBar" class="health-indicator">
      <div class="health-bar">
        <div 
          class="health-fill" 
          :style="{ width: `${fish.health}%` }"
          :class="healthColorClass"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { shouldPauseOnHover, getEdgeBoundaries, getBobbingSettings, getYBounds } from '../../config/fishBehavior'

const props = defineProps({
  fish: {
    type: Object,
    required: true
  },
  showHealthBar: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['fish-clicked'])

// Import behavior config
const edgeBoundaries = getEdgeBoundaries()
const bobbingSettings = getBobbingSettings()
const yBounds = getYBounds()

// State for dynamic swimming
const currentX = ref(props.fish.position.x)
const currentY = ref(props.fish.position.y)
const currentDirection = ref(props.fish.swimDirection || 'right')
const animationFrameId = ref(null)
const time = ref(0)
const isPaused = ref(false) // NEW: Pause state for hover

// Fish size based on age/growth
const spriteSize = computed(() => {
  const baseSize = 80
  return baseSize * (props.fish.currentSize || 0.8)
})

// Calculate speed with some randomness
const baseSpeed = computed(() => {
  const speedMap = {
    slow: 0.08,
    medium: 0.12,
    fast: 0.18
  }
  const speed = speedMap[props.fish.swimSpeed] || 0.12
  // Add 20% variation to speed
  const variation = 0.8 + Math.random() * 0.4
  return speed * variation
})

// Position and style
const fishStyle = computed(() => {
  return {
    left: currentX.value + '%',
    top: currentY.value + '%',
    width: spriteSize.value + 'px',
    height: (spriteSize.value * 0.75) + 'px',
    transition: currentDirection.value !== props.fish.swimDirection ? 'transform 0.5s ease' : 'none'
  }
})

// Health indicator color
const healthColorClass = computed(() => {
  if (props.fish.health > 70) return 'health-good'
  if (props.fish.health > 40) return 'health-medium'
  return 'health-low'
})

// Animation loop
function animate() {
  time.value += 0.016 // ~60fps

  // Skip movement if paused (configurable behavior)
  if (!isPaused.value) {
    // Horizontal movement
    if (currentDirection.value === 'right') {
      currentX.value += baseSpeed.value
      
      // Turn around at right edge (from config)
      if (currentX.value >= edgeBoundaries.right) {
        currentDirection.value = 'left'
      }
    } else {
      currentX.value -= baseSpeed.value
      
      // Turn around at left edge (from config)
      if (currentX.value <= edgeBoundaries.left) {
        currentDirection.value = 'right'
      }
    }

    // Vertical bobbing (wavy swimming pattern) - configurable
    if (bobbingSettings.enabled) {
      const bobOffset = Math.sin(time.value * bobbingSettings.speed) * bobbingSettings.amount
      
      // Base Y position with bobbing
      const baseY = props.fish.position.y
      currentY.value = baseY + bobOffset

      // Keep within bounds (from config)
      currentY.value = Math.max(yBounds.min, Math.min(yBounds.max, currentY.value))
    }
  }

  animationFrameId.value = requestAnimationFrame(animate)
}

function onFishClick() {
  emit('fish-clicked', props.fish)
}

// NEW: Pause/Resume handlers (configurable)
function onMouseEnter() {
  if (shouldPauseOnHover()) {
    isPaused.value = true
  }
}

function onMouseLeave() {
  if (shouldPauseOnHover()) {
    isPaused.value = false
  }
}

onMounted(() => {
  // Initialize position
  currentX.value = props.fish.position.x
  currentY.value = props.fish.position.y
  currentDirection.value = props.fish.swimDirection || 'right'
  
  // Start animation
  animate()
})

onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
})
</script>

<style scoped>
.fish-sprite {
  position: absolute;
  cursor: pointer;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  pointer-events: auto;
  will-change: left, top;
  transition: filter 0.2s ease; /* Smooth filter transition only */
}

/* Paused state - visual feedback */
.fish-sprite.paused {
  filter: drop-shadow(0 0 10px rgba(102, 126, 234, 0.6)) 
          drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

/* Simplified hover - no scale transform to reduce lag */
.fish-sprite:hover {
  filter: drop-shadow(0 0 10px rgba(102, 126, 234, 0.6)) 
          drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.4));
  z-index: 100; /* Bring to front */
}

/* Fish SVG - Default facing RIGHT (mouth on right, tail on left) */
.fish-svg {
  display: block;
  transition: transform 0.5s ease;
}

/* When facing LEFT, flip the SVG horizontally */
.fish-svg.flipped {
  transform: scaleX(-1);
}

/* Smooth direction changes */
.fish-sprite.facing-right .fish-svg {
  transform: scaleX(1);
}

.fish-sprite.facing-left .fish-svg {
  transform: scaleX(-1);
}

/* Fish body animation (subtle breathing) */
.fish-svg .fish-body {
  animation: breathe 2s ease-in-out infinite;
  transform-origin: center;
}

@keyframes breathe {
  0%, 100% { 
    transform: scale(1);
  }
  50% { 
    transform: scale(1.05);
  }
}

/* Health Indicator */
.health-indicator {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.fish-sprite:hover .health-indicator {
  opacity: 1;
}

.health-bar {
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.health-fill {
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 2px;
}

.health-good {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.health-medium {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.health-low {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

/* Responsive */
@media (max-width: 768px) {
  .fish-sprite {
    /* Already optimized - no additional transforms */
  }
}

/* Performance optimization: Use transform3d for GPU acceleration */
.fish-sprite,
.fish-svg {
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}
</style>
