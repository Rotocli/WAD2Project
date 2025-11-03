<template>
  <div 
    class="fish-sprite"
    :class="[
      `fish-${fish.species}`, 
      `facing-${currentDirection}`, 
      { 'paused': isPaused },
      { 'dead': fish.isDead || !fish.isAlive },
      { 'drop-target': isDropTarget && isDead }
    ]"
    :style="fishStyle"
    @click="onFishClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    :title="fishTitle"
  >
    <!-- SVG-based fish that can be customized -->
    <svg 
      :width="spriteSize" 
      :height="spriteSize * 0.75" 
      viewBox="0 0 80 60"
      class="fish-svg"
      :class="{ 
        'flipped': currentDirection === 'left',
        'dead-fish': fish.isDead || !fish.isAlive
      }"
    >
      <!-- Body -->
      <ellipse 
        cx="40" 
        cy="30" 
        rx="30" 
        ry="18" 
        :fill="fish.baseColor"
        class="fish-body"
        :class="{ 'dead-body': fish.isDead || !fish.isAlive }"
      />
      
      <!-- Stripes/Pattern (if applicable) -->
      <g v-if="fish.pattern === 'stripes' || fish.pattern === 'default'">
        <ellipse cx="25" cy="30" rx="8" ry="12" :fill="fish.stripeColor" opacity="0.8"/>
        <ellipse cx="45" cy="30" rx="8" ry="12" :fill="fish.stripeColor" opacity="0.8"/>
      </g>

      <FishDecoration
        v-if="decorations.body && !isDead"
        type="body"
        :decoration="decorations.body"
        :x="40"
        :y="30"
        :fishColor="fish.baseColor"
      />
      
      <!-- Eye - NORMAL or DEAD (X) -->
      <g v-if="!isDead">
        <!-- Normal eye -->
        <circle cx="55" cy="26" r="5" fill="white"/>
        <circle cx="55" cy="26" r="3" fill="#000"/>
      </g>
      <g v-else>
        <!-- Dead eye - X marks -->
        <line x1="52" y1="23" x2="58" y2="29" stroke="#000" stroke-width="2" stroke-linecap="round"/>
        <line x1="58" y1="23" x2="52" y2="29" stroke="#000" stroke-width="2" stroke-linecap="round"/>
      </g>

      <FishDecoration
        v-if="decorations.eye && !isDead"
        type="eye"
        :decoration="decorations.eye"
        :x="decorations.eye.position?.x || 55"
        :y="decorations.eye.position?.y || 26"
        :time="time"
      />
      
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
      <FishDecoration
        v-if="decorations.trail && !isDead"
        type="trail"
        :decoration="decorations.trail"
        :time="time"
        :fishColor="fish.baseColor"
        :x="10"
        :y="30"
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
        v-if="decorations.head && !isDead"
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
    <div v-if="showHealthBar && !isDead" class="health-indicator">
      <div class="health-bar">
        <div 
          class="health-fill" 
          :style="{ width: `${fish.health}%` }"
          :class="healthColorClass"
        ></div>
      </div>
    </div>

    <!-- NEW: Dead Status Indicator -->
    <div v-if="isDead" class="death-indicator">
      💀 RIP
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue'
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

const emit = defineEmits(['fish-clicked', 'fish-revived'])

// Import behavior config
const edgeBoundaries = getEdgeBoundaries()
const bobbingSettings = getBobbingSettings()
const yBounds = getYBounds()
const trailX = ref(0)
const trailY = ref(0)

// Drag and drop state
const isDropTarget = ref(false)
const showRevivalModal = ref(false)

// Check if fish is dead
const isDead = computed(() => props.fish.isDead || !props.fish.isAlive)

// Fish title with death status
const fishTitle = computed(() => {
  if (isDead.value) {
    return `${props.fish.customName} 💀 (Died from neglect)`
  }
  return props.fish.customName
})

// State for dynamic swimming
const currentX = ref(props.fish.position.x)
const currentY = ref(props.fish.position.y)
const currentDirection = ref(props.fish.swimDirection || 'right')
const animationFrameId = ref(null)
const time = ref(0)
const isPaused = ref(false)

// Fish size based on age/growth
const spriteSize = computed(() => {
  const baseSize = 80
  return baseSize * (props.fish.currentSize || 0.8)
})

// Calculate speed with some randomness (dead fish don't move horizontally, just bob)
const baseSpeed = computed(() => {
  if (isDead.value) return 0 // Dead fish don't swim
  
  const speedMap = {
    slow: 0.08,
    medium: 0.12,
    fast: 0.18
  }
  const speed = speedMap[props.fish.swimSpeed] || 0.12
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
const maxTrailLength = 15

// Smooth trail following the fish with lag
let frameCounter = 0
watchEffect(() => {
  if (isDead.value) return // Dead fish don't leave trails
  
  frameCounter++
  
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

  // Dead fish behavior: gentle floating/bobbing at the surface
  if (isDead.value) {
    // Slow gentle bobbing motion for dead fish
    const deadBobSpeed = 0.5 // Slower than normal
    const deadBobAmount = 1.5 // Gentle up/down movement
    const bobOffset = Math.sin(time.value * deadBobSpeed) * deadBobAmount
    currentY.value = props.fish.position.y + bobOffset
    
    // Dead fish stay at their assigned X position (no horizontal movement)
    currentX.value = props.fish.position.x
  } 
  // Normal fish behavior
  else if (!isPaused.value) {
    // Horizontal movement
    if (currentDirection.value === 'right') {
      currentX.value += baseSpeed.value
      
      if (currentX.value >= edgeBoundaries.right) {
        currentDirection.value = 'left'
      }
    } else {
      currentX.value -= baseSpeed.value
      
      if (currentX.value <= edgeBoundaries.left) {
        currentDirection.value = 'right'
      }
    }

    // Vertical bobbing (wavy swimming pattern)
    if (bobbingSettings.enabled) {
      const bobOffset = Math.sin(time.value * bobbingSettings.speed) * bobbingSettings.amount
      const baseY = props.fish.position.y
      currentY.value = baseY + bobOffset
      currentY.value = Math.max(yBounds.min, Math.min(yBounds.max, currentY.value))
    }
  }

  animationFrameId.value = requestAnimationFrame(animate)
}

function onFishClick() {
  emit('fish-clicked', props.fish)
}

function onMouseEnter() {
  if (!isDead.value && shouldPauseOnHover()) {
    isPaused.value = true
  }
}

function onMouseLeave() {
  if (shouldPauseOnHover()) {
    isPaused.value = false
  }
}

// NEW: Drag and drop handlers for fish food revival
function handleDragOver(event) {
  // Only accept drops on dead fish
  if (!isDead.value) return
  
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
  isDropTarget.value = true
  console.log('🎯 [DROP TARGET] Fish ready to receive fish food')
}

function handleDragLeave(event) {
  isDropTarget.value = false
}

async function handleDrop(event) {
  event.preventDefault()
  isDropTarget.value = false
  
  // Only accept drops on dead fish
  if (!isDead.value) {
    console.warn('⚠️ [DROP] Cannot use fish food on alive fish')
    return
  }
  
  const itemType = event.dataTransfer.getData('itemType')
  const itemId = event.dataTransfer.getData('itemId')
  
  console.log('🍖 [DROP] Received drop:', { itemType, itemId })
  
  if (itemType === 'fishfood' && itemId === 'revival_food') {
    console.log('✅ [DROP] Valid fish food dropped on dead fish!')
    emit('fish-revived', props.fish)
  } else {
    console.warn('⚠️ [DROP] Invalid item dropped')
  }
}

onMounted(() => {
  console.log('🐠 FishSprite mounted:', props.fish.customName, 'isAlive:', props.fish.isAlive, 'isDead:', isDead.value)
  
  // Initialize position
  currentX.value = props.fish.position.x
  currentY.value = props.fish.position.y
  currentDirection.value = props.fish.swimDirection || 'right'
  trailX.value = props.fish.position.x
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
  transition: filter 0.2s ease;
}

/* NEW: Dead fish styling */
.fish-sprite.dead {
  opacity: 0.7;
  filter: grayscale(50%) drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
}

.fish-sprite.dead:hover {
  opacity: 0.9;
  filter: grayscale(50%) drop-shadow(0 0 10px rgba(255, 0, 0, 0.4));
}

/* Paused state - visual feedback */
.fish-sprite.paused {
  filter: drop-shadow(0 0 10px rgba(102, 126, 234, 0.6)) 
          drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

/* Hover effect for alive fish */
.fish-sprite:not(.dead):hover {
  filter: drop-shadow(0 0 10px rgba(102, 126, 234, 0.6)) 
          drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.4));
  z-index: 100;
}

/* Fish SVG - Default facing RIGHT */
.fish-svg {
  display: block;
  transition: transform 0.5s ease;
}

/* When facing LEFT, flip horizontally */
.fish-svg.flipped {
  transform: scaleX(-1);
}

/* NEW: Dead fish - flip upside down AND maintain left/right orientation */
.fish-svg.dead-fish {
  transform: scaleY(-1) rotate(180deg);
  animation: deadFloat 3s ease-in-out infinite;
}

.fish-svg.dead-fish.flipped {
  transform: scaleY(-1) scaleX(-1) rotate(180deg);
}

@keyframes deadFloat {
  0%, 100% { 
    transform: scaleY(-1) rotate(180deg) translateY(0); 
  }
  50% { 
    transform: scaleY(-1) rotate(180deg) translateY(-3px); 
  }
}

.fish-svg.dead-fish.flipped {
  animation: deadFloatFlipped 3s ease-in-out infinite;
}

@keyframes deadFloatFlipped {
  0%, 100% { 
    transform: scaleY(-1) scaleX(-1) rotate(180deg) translateY(0); 
  }
  50% { 
    transform: scaleY(-1) scaleX(-1) rotate(180deg) translateY(-3px); 
  }
}

/* Smooth direction changes for alive fish */
.fish-sprite:not(.dead).facing-right .fish-svg {
  transform: scaleX(1);
}

.fish-sprite:not(.dead).facing-left .fish-svg {
  transform: scaleX(-1);
}

/* Fish body animation (subtle breathing) - disabled for dead fish */
.fish-svg:not(.dead-fish) .fish-body {
  animation: breathe 2s ease-in-out infinite;
  transform-origin: center;
}

/* Dead fish body - no breathing animation, desaturated */
.fish-body.dead-body {
  animation: none;
  opacity: 0.8;
}

/* NEW: Drop target styling when dragging fish food over dead fish */
.fish-sprite.drop-target {
  outline: 3px dashed #fbbf24;
  outline-offset: 8px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%);
  animation: dropTargetPulse 1s ease-in-out infinite;
}

@keyframes dropTargetPulse {
  0%, 100% {
    outline-color: #fbbf24;
    transform: scale(1);
  }
  50% {
    outline-color: #f59e0b;
    transform: scale(1.05);
  }
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

/* NEW: Death Indicator */
.death-indicator {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 10;
}

.fish-sprite.dead:hover .death-indicator {
  opacity: 1;
}

/* Performance optimization */
.fish-sprite,
.fish-svg {
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Responsive */
@media (max-width: 768px) {
  .death-indicator {
    font-size: 9px;
    padding: 2px 6px;
  }
}
</style>
