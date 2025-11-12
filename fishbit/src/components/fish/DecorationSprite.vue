<template>
  <div 
    class="decoration-sprite"
    :class="decorationClass"
    :style="decorationStyle"
    @click="onDecorationClick"
  >
    <!-- Seaweed -->
    <svg v-if="decoration.type === 'seaweed'" viewBox="0 0 25 100" preserveAspectRatio="none">
      <path 
        d="M 5 100 Q 8 80, 5 60 Q 2 40, 5 20 Q 8 5, 10 0" 
        fill="none" 
        stroke="#16a34a" 
        stroke-width="8" 
        stroke-linecap="round"
        class="seaweed-sway"
      />
      <path 
        d="M 15 100 Q 12 85, 15 70 Q 18 50, 15 30 Q 12 10, 15 0" 
        fill="none" 
        stroke="#22c55e" 
        stroke-width="6" 
        stroke-linecap="round"
        class="seaweed-sway"
        style="animation-delay: 0.5s"
      />
    </svg>

    <!-- Coral -->
    <svg v-else-if="decoration.type === 'coral'" viewBox="0 0 60 70">
      <ellipse cx="30" cy="60" rx="25" ry="10" fill="#8b5a3c"/>
      <path d="M 20 60 Q 15 45 18 30 Q 20 15 22 10" stroke="#d946ef" stroke-width="4" fill="none"/>
      <path d="M 30 60 Q 28 40 30 20 Q 32 10 30 5" stroke="#ec4899" stroke-width="5" fill="none"/>
      <path d="M 40 60 Q 42 45 40 30 Q 38 15 40 10" stroke="#f472b6" stroke-width="4" fill="none"/>
      <circle cx="22" cy="15" r="6" fill="#f472b6"/>
      <circle cx="30" cy="8" r="7" fill="#ec4899"/>
      <circle cx="40" cy="15" r="6" fill="#d946ef"/>
    </svg>

    <!-- Rock -->
    <svg v-else-if="decoration.type === 'rock'" viewBox="0 0 80 60">
      <ellipse cx="40" cy="55" rx="35" ry="8" fill="#64748b" opacity="0.5"/>
      <ellipse cx="40" cy="35" rx="30" ry="25" fill="#94a3b8"/>
      <ellipse cx="40" cy="30" rx="25" ry="20" fill="#cbd5e1"/>
      <ellipse cx="35" cy="25" rx="15" ry="12" fill="#e2e8f0"/>
    </svg>

    <!-- Kelp (tall seaweed) -->
    <svg v-else-if="decoration.type === 'kelp'" viewBox="0 0 25 150" preserveAspectRatio="none">
      <path 
        d="M 12 150 Q 15 120, 12 90 Q 9 60, 12 30 Q 15 10, 12 0" 
        fill="none" 
        stroke="#15803d" 
        stroke-width="7" 
        stroke-linecap="round"
        class="seaweed-sway"
      />
    </svg>

    <!-- Castle -->
    <svg v-else-if="decoration.type === 'castle'" viewBox="0 0 100 120">
      <rect x="10" y="80" width="80" height="40" fill="#64748b"/>
      <rect x="20" y="50" width="25" height="30" fill="#94a3b8"/>
      <rect x="55" y="50" width="25" height="30" fill="#94a3b8"/>
      <polygon points="32.5,40 20,50 45,50" fill="#475569"/>
      <polygon points="67.5,40 55,50 80,50" fill="#475569"/>
      <rect x="40" y="85" width="20" height="35" fill="#334155"/>
      <circle cx="32.5" cy="65" r="8" fill="#fbbf24"/>
      <circle cx="67.5" cy="65" r="8" fill="#fbbf24"/>
    </svg>

    <!-- Treasure Chest -->
    <svg v-else-if="decoration.type === 'treasure'" viewBox="0 0 70 50">
      <ellipse cx="35" cy="48" rx="30" ry="4" fill="#64748b" opacity="0.3"/>
      <rect x="10" y="25" width="50" height="23" fill="#78350f" rx="2"/>
      <rect x="10" y="25" width="50" height="5" fill="#92400e"/>
      <path d="M 10 25 Q 35 10, 60 25" fill="#92400e"/>
      <rect x="32" y="30" width="6" height="8" fill="#fbbf24" rx="1"/>
      <circle cx="35" cy="34" r="2" fill="#713f12"/>
    </svg>

    <!-- Bubble Stone -->
    <svg v-else-if="decoration.type === 'bubbler'" viewBox="0 0 40 30">
      <ellipse cx="20" cy="28" rx="18" ry="4" fill="#64748b"/>
      <ellipse cx="20" cy="20" rx="15" ry="12" fill="#94a3b8"/>
      <circle cx="15" cy="18" r="3" fill="#cbd5e1"/>
      <circle cx="25" cy="19" r="2.5" fill="#cbd5e1"/>
    </svg>

    <!-- Shipwreck -->
    <svg v-else-if="decoration.type === 'shipwreck'" viewBox="0 0 150 100">
      <ellipse cx="75" cy="98" rx="70" ry="6" fill="#64748b" opacity="0.3"/>
      <path d="M 30 60 L 20 90 L 130 90 L 120 60 Z" fill="#78350f"/>
      <rect x="50" y="30" width="50" height="30" fill="#92400e"/>
      <polygon points="75,10 60,30 90,30" fill="#451a03"/>
      <rect x="30" y="60" width="90" height="8" fill="#92400e"/>
      <rect x="55" y="40" width="8" height="15" fill="#44403c"/>
      <rect x="87" y="40" width="8" height="15" fill="#44403c"/>
    </svg>

    <!-- Default fallback -->
    <div v-else class="decoration-placeholder">
      {{ decoration.type }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAquariumStore } from '../../stores/aquariumStore'

const props = defineProps({
  decoration: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['decoration-clicked'])

const aquariumStore = useAquariumStore()

const decorationClass = computed(() => {
  const classes = [`decoration-${props.decoration.type}`]
  
  // Add animation classes
  if (['seaweed', 'kelp'].includes(props.decoration.type)) {
    classes.push('swaying')
  }
  
  return classes
})

const decorationStyle = computed(() => {
  const decorationType = aquariumStore.decorationTypes[props.decoration.type]
  
  if (!decorationType) {
    return {
      left: props.decoration.x + '%',
      bottom: 'max(0px, 2vh)',
      transform: 'translateX(-50%)'
    }
  }

  // Use viewport-relative sizing with max constraints
  const baseWidth = decorationType.size.width
  const baseHeight = decorationType.size.height
  
  // Calculate responsive size (scales down on smaller screens)
  const widthVw = Math.min(baseWidth / 10, baseWidth) // Use vw for smaller screens
  const heightVw = Math.min(baseHeight / 10, baseHeight)
  
  // Scale bottom position proportionally on smaller screens
  const baseBottom = props.decoration.y || 0
  const responsiveBottom = `max(${baseBottom}px, calc(${baseBottom}px * 0.5))`

  return {
    left: props.decoration.x + '%',
    bottom: baseBottom > 0 ? responsiveBottom : 'max(0px, 2vh)',
    width: `min(${baseWidth}px, ${widthVw}vw)`,
    height: `min(${baseHeight}px, ${heightVw}vw)`,
    transform: 'translateX(-50%)' // Center decoration on its position
  }
})

function onDecorationClick() {
  emit('decoration-clicked', props.decoration)
}
</script>

<style scoped>
.decoration-sprite {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.3s ease, filter 0.3s ease;
  filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.3));
  transform-origin: bottom center;
}

.decoration-sprite:hover {
  transform: translateX(-50%) scale(1.05);
  filter: drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.4));
}

.decoration-sprite svg {
  width: 100%;
  height: 100%;
}

/* Swaying animation for plants */
.swaying {
  animation: sway 4s ease-in-out infinite;
}

.seaweed-sway {
  animation: seaweed-wave 3s ease-in-out infinite;
  transform-origin: bottom center;
}

@keyframes sway {
  0%, 100% { transform: translateX(-50%) rotate(-3deg); }
  50% { transform: translateX(-50%) rotate(3deg); }
}

@keyframes seaweed-wave {
  0%, 100% { 
    transform: skewX(-2deg);
  }
  50% { 
    transform: skewX(2deg);
  }
}

/* Specific decoration styles */
.decoration-seaweed {
  z-index: 1;
}

.decoration-kelp {
  z-index: 1;
}

.decoration-coral {
  z-index: 2;
}

.decoration-rock {
  z-index: 2;
}

.decoration-castle {
  z-index: 2;
}

.decoration-treasure {
  z-index: 2;
}

.decoration-bubbler {
  z-index: 1;
}

.decoration-shipwreck {
  z-index: 1;
}

/* Placeholder for unknown decorations */
.decoration-placeholder {
  background: rgba(255, 255, 255, 0.2);
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  color: white;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .decoration-sprite {
    /* Additional scaling reduction for mobile */
    max-width: 15vw;
    max-height: 15vw;
  }
  
  .decoration-sprite:hover {
    transform: translateX(-50%) scale(1.05);
  }
  
  .swaying:hover {
    animation: sway-hover 4s ease-in-out infinite;
  }
  
  @keyframes sway-hover {
    0%, 100% { transform: translateX(-50%) rotate(-3deg) scale(1.05); }
    50% { transform: translateX(-50%) rotate(3deg) scale(1.05); }
  }
}

@media (max-width: 480px) {
  .decoration-sprite {
    /* Even smaller on very small screens */
    max-width: 12vw;
    max-height: 12vw;
  }
}
</style>