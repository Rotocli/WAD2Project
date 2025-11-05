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
      <circle  :cx="x -6" :cy="y" r="1.5" fill="#FF0000"/>
      <circle :cx="x+ 0" :cy="y-2" r="1.5" fill="#FF0000"/>
      <circle  :cx="x +6" :cy="y" r="1.5" fill="#FF0000"/>
    </g>

    <g v-if="type === 'head' && decoration.svg === 'tophat'">
      
      
      
      <rect 
        :x="x-6" 
        :y="y-4" 
        width="12" 
        height="14" 
        :fill="decoration.color"
        stroke="#000"
        stroke-width="0.5"
        rx="1"
      />
      <rect 
        :x="x-6" 
        :y="y+4" 
        width="12" 
        height="2" 
        fill="#8B0000"
      />
      <ellipse 
        :cx="x" 
        :cy="y+10" 
        rx="10" 
        ry="2" 
        :fill="decoration.color"
        stroke="#000"
        stroke-width="0.5"
      />
    </g>

    <g v-if="type === 'head' && decoration.svg === 'bow'">
      <ellipse 
        :cx="x-5" 
        :cy="y+2" 
        rx="4" 
        ry="3" 
        :fill="decoration.color"
        stroke="#FF1493"
        stroke-width="0.5"
      />
      <ellipse 
        :cx="x+5" 
        :cy="y+2" 
        rx="4" 
        ry="3" 
        :fill="decoration.color"
        stroke="#FF1493"
        stroke-width="0.5"
      />
      <circle 
        :cx="x" 
        :cy="y+2" 
        r="2" 
        :fill="decoration.color"
        stroke="#FF1493"
        stroke-width="0.5"
      />
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
      <rect 
        :x="x-8" 
        :y="y-4" 
        width="16" 
        height="8" 
        :fill="decoration.color"
        opacity="0.95"
        rx="2"
      />
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
      <circle 
        :cx="x" 
        :cy="y" 
        r="6" 
        fill="none"
        :stroke="decoration.color"
        stroke-width="1.5"
      />
      <circle 
        :cx="x" 
        :cy="y" 
        r="5" 
        fill="white"
        opacity="0.3"
      />
      <circle 
        :cx="x+6" 
        :cy="y-3" 
        r="1" 
        :fill="decoration.color"
      />
      <path 
        :d="`M ${x+6} ${y-3} Q ${x+10} ${y-5} ${x+12} ${y-3}`"
        fill="none"
        :stroke="decoration.color"
        stroke-width="0.5"
      />
      <circle 
        :cx="x-2" 
        :cy="y-2" 
        r="1.5" 
        fill="white"
        opacity="0.6"
      />
    </g>

    <g v-if="type === 'eye' && decoration.svg === 'stareyes'">
      <path 
        :d="`M ${x} ${y-6} 
        L ${x+2.25} ${y-1.5} 
        L ${x+6} ${y-1.5} 
        L ${x+3} ${y+1.5} 
        L ${x+3.75} ${y+6} 
        L ${x} ${y+3} 
        L ${x-3.75} ${y+6} 
        L ${x-3} ${y+1.5} 
        L ${x-6} ${y-1.5} 
        L ${x-2.25} ${y-1.5} Z`"
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

    <!-- TRAIL EFFECTS - Using converted viewBox coordinates -->
    <!-- TRAIL EFFECTS -->
<g v-if="type === 'trail' && decoration.svg === 'bubbles'">

  <g>


  <circle 
    :cx="x-10" 
    :cy="y" 
    r="4" 
    fill="lightblue">
    <animateTransform
      attributeName="transform"
      type="translate"
      :values="`0,0; -25,0`"
      dur="2s"
      repeatCount="indefinite"
    />
    <animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite" />
  </circle>
  <circle 
    :cx="x-10" 
    :cy="y+5" 
    r="4" 
    fill="lightblue">
    <animateTransform
      attributeName="transform"
      type="translate"
      :values="`0,0; -25,+4`"
      dur="2s"
      repeatCount="indefinite"
    />
    <animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite" />
  </circle>
  <circle 
    :cx="x-10" 
    :cy="y-5" 
    r="4" 
    fill="lightblue">
    <animateTransform
      attributeName="transform"
      type="translate"
      :values="`0,0; -25,-4`"
      dur="2s"
      repeatCount="indefinite"
    />
    <animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite" />
  </circle>
    
  </g>
</g>

<g v-if="type === 'trail' && decoration.svg === 'rainbow'">
  <path v-for="(color, i) in decoration.colors" :key="i"
    :d="`
      M ${x-10} ${y + (i - 3) * 2} 
      L ${x - 25} ${y + (i - 3) * 2}
    `"
    :stroke="color"
    stroke-width="2"
    :opacity="0.8 - i * 0.08"
    fill="none"
    stroke-linecap="round"
  >
    <animate
      attributeName="ry"
      :values="`${5 - i * 0.6};${6 - i * 0.6};${5 - i * 0.6}`"
      dur="0.4s"
      repeatCount="indefinite"
    />
  </path>
</g>

<g v-if="type === 'trail' && decoration.svg === 'fire'">
  
  
  <g >
    <g v-for="(color, i) in decoration.colors" :key="i">
      <ellipse 
        :cx="x - (i * 3)-15"
        :cy="y"
        :rx="4 - i * 0.4"
        :ry="6 - i * 0.6"
        :fill="color"
        :opacity="0.8 - i * 0.2"
      >
        <animate
          attributeName="ry"
          :values="`${5 - i * 0.6};${6 - i * 0.6};${5 - i * 0.6}`"
          dur="0.4s"
          repeatCount="indefinite"
        />
      </ellipse>
    </g>
  </g>
</g>
  </g>
</template>

<script setup>
import { computed } from 'vue'



const props = defineProps({
  type: {
    type: String,
    required: true
  },
  decoration: {
    type: Object,
    required: true
  },
  x: {
    type: Number,
    default: 40
  },
  y: {
    type: Number,
    default: 30
  },
  time: {
    type: Number,
    default: 0
  },
  fishColor: {
    type: String,
    default: '#FF6B6B'
  },
  trailHistory: {  // ADD THIS
    type: Array,
    default: () => []
  }

})

function getRainbowPath(pos, index) {
  const waveOffset = Math.sin((index + props.time) * 0.5) * 2
  const length = 8 + index * 1.5
  
  return `M ${pos.x * 0.8} ${pos.y * 0.75 + waveOffset} 
          Q ${pos.x * 0.8 - length/3} ${pos.y * 0.75 + waveOffset - 2} 
            ${pos.x * 0.8 - length/2} ${pos.y * 0.75 + waveOffset} 
          Q ${pos.x * 0.8 - length*2/3} ${pos.y * 0.75 + waveOffset + 2} 
            ${pos.x * 0.8 - length} ${pos.y * 0.75 + waveOffset}`
}

const patternColor = computed(() => {
  const fishHex = props.fishColor
  const brightness = parseInt(fishHex.slice(1, 3), 16) + 
                     parseInt(fishHex.slice(3, 5), 16) + 
                     parseInt(fishHex.slice(5, 7), 16)
  
  return brightness > 382 ? '#333333' : '#FFFFFF'
})

// Convert page percentage coordinates to SVG viewBox coordinates

</script>

<style scoped>
/* SVG animations handled inline */
</style>