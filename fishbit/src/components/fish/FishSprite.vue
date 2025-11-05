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
      :width="spriteSize *1.4" 
      :height="spriteSize * 1.3"
      viewBox=" -30 -20 110 80"
      class="fish-svg"
      :class="{ 'flipped': currentDirection === 'left' }"
    >
      
      
      <!--Body-->
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

      <FishDecoration
      v-if="decorations.body"
      type="body"
      :decoration="decorations.body"
      :x="40"
      :y="30"
      :fishColor="fish.baseColor"
      />
      
      <!-- Eye (positioned for right-facing fish) -->
      <circle cx="55" cy="26" r="5" fill="white"/>
      <circle cx="55" cy="26" r="3" fill="#000"/>

      <FishDecoration
        v-if="decorations.eye"
        type="eye"
        :decoration="decorations.eye"
        :x="decorations.eye.position?.x || 55"
        :y="decorations.eye.position?.y || 26"
        :time="time"
      />
      
      <!-- Tail (at LEFT side for right-facing fish) -->

      <clipPath id="threeQuarter">
        <path d="
          M 40,30 
          L 40-15,30 
          A 15 12 0 1 1 40,30-12 
          Z
        " />
      </clipPath>
      <clipPath id="cutEllipse">
        
        <rect 
          x="0" y="0" 
          width="80" height="60"
        />
      </clipPath>
      <ellipse 
        cx="12" 
        cy="30" 
        rx="15" 
        ry="12" 
        :fill="fish.baseColor"
        opacity="0.9"
        style="clip-path: url(#cutEllipse);"
      />
      <path 
        d="M 8 20 L 0 30 L 8 40 Q 5 30 8 20" 
        :fill="fish.baseColor"
        opacity="0.7"
      />
      <FishDecoration
      v-if="decorations.trail"
      type="trail"
      :decoration="decorations.trail"
      :time="time"
      :fishColor="fish.baseColor"
      :x="10"
      :y="30"
      :trailHistory="trailHistory"
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
      <FishDecoration
        v-if="decorations.head"
        type="head"
        :decoration="decorations.head"
        :x="decorations.head.position?.x || 55"
        :y="decorations.head.position?.y || 5"
        :time="time"
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
import { ref, computed, onMounted, onUnmounted,watchEffect } from 'vue'
import { shouldPauseOnHover, getEdgeBoundaries, getBobbingSettings, getYBounds } from '../../config/fishBehavior'
import FishDecoration from './FishDecoration.vue'





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
const trailX = ref(0)        // ← DEFINE FIRST
const trailY = ref(0)   

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

const decorations = computed(() => {
  const deco = {
    head: getDecoConfig('head', props.fish.decorations?.head),
    eye: getDecoConfig('eye', props.fish.decorations?.eye),
    body: getDecoConfig('body', props.fish.decorations?.body),
    trail: getDecoConfig('trail', props.fish.decorations?.trail)
  }
  
  // ADD THIS DEBUG LINE:
  console.log('Trail config:', deco.trail, 'Fish decorations:', props.fish.decorations?.trail)
  if (deco.trail) {
    deco.trail.history = trailHistory.value
  }
  
  return deco
})

// Helper function to get decoration configuration
function getDecoConfig(slot, decoId) {
  if (!decoId || decoId === 'none' || decoId === '') return null
  
  const decoData = {
    head: {
      crown: { svg: 'crown', color: '#FFD700', position: { x: 55, y: 12 } },
      topHat: { svg: 'tophat', color: '#1a1a1a', position: { x: 55, y: 8 } },
      bow: { svg: 'bow', color: '#FF69B4', position: { x: 55, y: 14 } }
    },
    eye: {
      sunglasses: { svg: 'sunglasses', color: '#2a2a2a', position: { x: 55, y: 26 } },
      monocle: { svg: 'monocle', color: '#D4AF37', position: { x: 55, y: 26 } },
      starEyes: { svg: 'stareyes', color: '#FFD700', position: { x: 55, y: 26 } }
    },
    body: {
      stripes: { svg: 'stripes', type: 'pattern' },
      spots: { svg: 'spots', type: 'pattern' },
      glitter: { svg: 'glitter', type: 'pattern', animate: true }
    },
    trail: {
      rainbow: { 
        svg: 'rainbow', 
        colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'] 
      },
      bubbles: { svg: 'bubbles', color: '#87CEEB', count: 5 },
      fire: { svg: 'fire', colors: ['#FF4500', '#FF8C00', '#FFD700'] }
    }
  }
  
  return decoData[slot]?.[decoId] || null
}
const trailHistory = ref([])
const maxTrailLength = 15 // Increase this for longer trails (15-30 recommended)

// Smooth trail following the fish with lag
let frameCounter = 0
watchEffect(() => {
  frameCounter++
  
  // Only add to trail every 3 frames to avoid jitter
  if (frameCounter % 3 === 0) {
    trailHistory.value.push({ x: currentX.value, y: currentY.value })
    
    if (trailHistory.value.length > maxTrailLength) {
      trailHistory.value.shift()
    }
  }
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
  trailX.value = props.fish.position.x      // ← ADD THIS
  trailY.value = props.fish.position.y 
  
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
