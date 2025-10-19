<template>
  <g>
    <!-- HEAD DECORATIONS -->
    <g v-if="type === 'head' && decoration.svg === 'crown'">
      <path 
        :d="`M ${x-8} ${y+5} L ${x-6} ${y} L ${x-3} ${y+4} L ${x} ${y-2} L ${x+3} ${y+4} L ${x+6} ${y} L ${x+8} ${y+5} Z`"
        :fill="decoration.color"
        stroke="#DAA520"
        stroke-width="0.5"
      />
      <circle v-for="i in 3" :key="i" :cx="x + (i-2)*5" :cy="y" r="1.5" fill="#FF0000"/>
    </g>

    <g v-if="type === 'head' && decoration.svg === 'tophat'">
      <!-- Brim -->
      <ellipse 
        :cx="x" 
        :cy="y+8" 
        rx="10" 
        ry="2" 
        :fill="decoration.color"
        stroke="#000"
        stroke-width="0.5"
      />
      <!-- Hat body -->
      <rect 
        :x="x-6" 
        :y="y-4" 
        width="12" 
        height="12" 
        :fill="decoration.color"
        stroke="#000"
        stroke-width="0.5"
        rx="1"
      />
      <!-- Band -->
      <rect 
        :x="x-6" 
        :y="y+4" 
        width="12" 
        height="2" 
        fill="#8B0000"
      />
    </g>

    <g v-if="type === 'head' && decoration.svg === 'bow'">
      <!-- Left loop -->
      <ellipse 
        :cx="x-5" 
        :cy="y+2" 
        rx="4" 
        ry="3" 
        :fill="decoration.color"
        stroke="#FF1493"
        stroke-width="0.5"
      />
      <!-- Right loop -->
      <ellipse 
        :cx="x+5" 
        :cy="y+2" 
        rx="4" 
        ry="3" 
        :fill="decoration.color"
        stroke="#FF1493"
        stroke-width="0.5"
      />
      <!-- Center knot -->
      <circle 
        :cx="x" 
        :cy="y+2" 
        r="2" 
        :fill="decoration.color"
        stroke="#FF1493"
        stroke-width="0.5"
      />
      <!-- Ribbons -->
      <path 
        :d="`M ${x} ${y+4} L ${x-2} ${y+8} L ${x-1} ${y+8}`"
        :stroke="decoration.color"
        stroke-width="1.5"
        fill="none"
        stroke-linecap="round"
      />
      <path 
        :d="`M ${x} ${y+4} L ${x+2} ${y+8} L ${x+1} ${y+8}`"
        :stroke="decoration.color"
        stroke-width="1.5"
        fill="none"
        stroke-linecap="round"
      />
    </g>

    <!-- EYE DECORATIONS -->
    <g v-if="type === 'eye' && decoration.svg === 'sunglasses'">
      <!-- Rectangular lens covering the eye -->
      <rect 
        :x="x-8" 
        :y="y-4" 
        width="16" 
        height="8" 
        :fill="decoration.color"
        opacity="0.95"
        rx="2"
      />
      <!-- Frame -->
      <rect 
        :x="x-8" 
        :y="y-4" 
        width="16" 
        height="8" 
        fill="none"
        :stroke="decoration.color"
        stroke-width="1"
        rx="2"
      />
      <!-- Shine effect -->
      <rect 
        :x="x+2" 
        :y="y-3" 
        width="3" 
        height="2" 
        fill="white" 
        opacity="0.7"
        rx="0.5"
      />
    </g>

    <g v-if="type === 'eye' && decoration.svg === 'monocle'">
      <!-- Rim -->
      <circle 
        :cx="x" 
        :cy="y" 
        r="6" 
        fill="none"
        :stroke="decoration.color"
        stroke-width="1.5"
      />
      <!-- Glass -->
      <circle 
        :cx="x" 
        :cy="y" 
        r="5" 
        fill="white"
        opacity="0.3"
      />
      <!-- Chain attachment -->
      <circle 
        :cx="x+6" 
        :cy="y-3" 
        r="1" 
        :fill="decoration.color"
      />
      <!-- Chain -->
      <path 
        :d="`M ${x+6} ${y-3} Q ${x+10} ${y-5} ${x+12} ${y-3}`"
        fill="none"
        :stroke="decoration.color"
        stroke-width="0.5"
      />
      <!-- Shine -->
      <circle 
        :cx="x-2" 
        :cy="y-2" 
        r="1.5" 
        fill="white"
        opacity="0.6"
      />
    </g>

    <g v-if="type === 'eye' && decoration.svg === 'stareyes'">
      <!-- Star shape over eye -->
      <path 
        :d="`M ${x} ${y-4} L ${x+1.5} ${y-1} L ${x+4} ${y-1} L ${x+2} ${y+1} L ${x+2.5} ${y+4} L ${x} ${y+2} L ${x-2.5} ${y+4} L ${x-2} ${y+1} L ${x-4} ${y-1} L ${x-1.5} ${y-1} Z`"
        :fill="decoration.color"
        stroke="#FFA500"
        stroke-width="0.5"
        opacity="0.9"
      >
        <animateTransform
          v-if="decoration.animate !== false"
          attributeName="transform"
          type="rotate"
          :from="`0 ${x} ${y}`"
          :to="`360 ${x} ${y}`"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
      <!-- Sparkles -->
      <circle :cx="x+6" :cy="y-3" r="0.8" fill="#FFD700" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0;0.7" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle :cx="x-6" :cy="y-3" r="0.8" fill="#FFD700" opacity="0.7">
        <animate attributeName="opacity" values="0;0.7;0" dur="1.5s" repeatCount="indefinite"/>
      </circle>
    </g>

    <!-- BODY PATTERNS -->
    <g v-if="type === 'body' && decoration.svg === 'stripes'">
      <rect :x="20" :y="22" width="3" height="16" :fill="patternColor" opacity="0.6"/>
      <rect :x="28" :y="22" width="3" height="16" :fill="patternColor" opacity="0.6"/>
      <rect :x="36" :y="22" width="3" height="16" :fill="patternColor" opacity="0.6"/>
      <rect :x="44" :y="22" width="3" height="16" :fill="patternColor" opacity="0.6"/>
      <rect :x="52" :y="22" width="3" height="16" :fill="patternColor" opacity="0.6"/>
    </g>

    <g v-if="type === 'body' && decoration.svg === 'spots'">
      <circle cx="25" cy="25" r="3" :fill="patternColor" opacity="0.6"/>
      <circle cx="35" cy="30" r="2.5" :fill="patternColor" opacity="0.6"/>
      <circle cx="45" cy="27" r="3.5" :fill="patternColor" opacity="0.6"/>
      <circle cx="30" cy="35" r="2" :fill="patternColor" opacity="0.6"/>
      <circle cx="50" cy="33" r="2.5" :fill="patternColor" opacity="0.6"/>
    </g>

    <g v-if="type === 'body' && decoration.svg === 'glitter'">
      <circle v-for="(star, i) in 8" :key="i"
        :cx="20 + (i * 7)" 
        :cy="25 + Math.sin(i) * 8" 
        :r="0.8 + Math.random() * 0.5" 
        fill="#FFD700"
        opacity="0.8"
      >
        <animate 
          attributeName="opacity" 
          :values="`0.8;0.3;0.8`"
          :dur="`${1 + Math.random()}s`"
          repeatCount="indefinite"
          :begin="`${i * 0.1}s`"
        />
      </circle>
    </g>

    <!-- TRAIL EFFECTS -->
    <g v-if="type === 'trail' && decoration.svg === 'bubbles'">
      <circle v-for="(bubble, i) in (decoration.count || 5)" :key="i"
        :cx="trailX - (i * 8)"
        :cy="trailY + Math.sin(time + i) * 3"
        :r="2.5 - i * 0.3"
        :fill="decoration.color"
        opacity="0.7"
        stroke="white"
        stroke-width="0.8"
      >
        <animate 
          attributeName="cy"
          :values="`${trailY - 3};${trailY + 3};${trailY - 3}`"
          :dur="`${1.5 + i * 0.2}s`"
          repeatCount="indefinite"
        />
      </circle>
    </g>

    <g v-if="type === 'trail' && decoration.svg === 'rainbow'">
      <path v-for="(color, i) in decoration.colors" :key="i"
        :d="`M ${trailX} ${trailY + (i-3)*2} L ${trailX - 15} ${trailY + (i-3)*2}`"
        :stroke="color"
        stroke-width="2.5"
        :opacity="0.8 - i * 0.08"
        stroke-linecap="round"
      />
    </g>

    <g v-if="type === 'trail' && decoration.svg === 'fire'">
      <g v-for="(color, i) in decoration.colors" :key="i">
        <ellipse 
          :cx="trailX - (i * 4)"
          :cy="trailY"
          :rx="4 - i * 0.5"
          :ry="6 - i * 0.8"
          :fill="color"
          :opacity="0.8 - i * 0.2"
        >
          <animate
            attributeName="ry"
            :values="`${6 - i * 0.8};${7 - i * 0.8};${6 - i * 0.8}`"
            dur="0.4s"
            repeatCount="indefinite"
          />
        </ellipse>
      </g>
    </g>
  </g>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true // 'head', 'eye', 'body', 'trail'
  },
  decoration: {
    type: Object,
    required: true
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  time: {
    type: Number,
    default: 0
  },
  fishColor: {
    type: String,
    default: '#FF6B6B'
  }
})

// For trail positioning
const trailX = computed(() => props.x)
const trailY = computed(() => props.y)

// Pattern color that contrasts with fish body
const patternColor = computed(() => {
  // Simple color contrast logic
  const fishHex = props.fishColor
  const brightness = parseInt(fishHex.slice(1, 3), 16) + 
                     parseInt(fishHex.slice(3, 5), 16) + 
                     parseInt(fishHex.slice(5, 7), 16)
  
  return brightness > 382 ? '#333333' : '#FFFFFF'
})
</script>

<style scoped>
/* SVG animations are handled inline */
</style>