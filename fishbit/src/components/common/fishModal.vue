<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">&times;</button>

      <!-- Habit Info -->
      <h5 class="mb-2">{{ habit.name }}</h5>
      <p class="text-muted" v-if="habit.description !=''">Description: {{ habit.description }}</p>
      <p v-if="habit.repeat && habit.frequency=='custom'">
        Frequency: Every {{ habit.customFrequency }} days
      </p>
      <p v-else-if="!habit.repeat">No repeat</p>
      <p v-else>Frequency: {{ habit.frequency }}</p>


      <!-- Fish Section -->
      <div v-if="fish" class="fish-section mt-4">
        
        <div
          class="fish-preview mt-3"
          :style="{
            background: `white`
          }"
        >
          <!-- Add this section in fishModal.vue template where you want the fish to appear -->
          <div class="fish-display" v-if="fish">

            <div class="fish-content">
              <div class="fish-img">
                <svg 
                  width="80" 
                  height="60" 
                  viewBox="0 0 80 60"
                  class="fish-svg-static"
                >
                  <ellipse 
                    cx="40" 
                    cy="30" 
                    rx="30" 
                    ry="18" 
                    :fill="fish.baseColor"
                  />
                  <g v-if="fish.pattern === 'stripes' || fish.pattern === 'default'">
                    <ellipse cx="25" cy="30" rx="8" ry="12" :fill="fish.stripeColor || fish.baseColor" opacity="0.8"/>
                    <ellipse cx="45" cy="30" rx="8" ry="12" :fill="fish.stripeColor || fish.baseColor" opacity="0.8"/>
                  </g>
                  <circle cx="55" cy="26" r="5" fill="white"/>
                  <circle cx="55" cy="26" r="3" fill="#000"/>
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
                  <ellipse 
                    cx="40" 
                    cy="12" 
                    rx="15" 
                    ry="6" 
                    :fill="fish.stripeColor || fish.baseColor"
                    opacity="0.7"
                  />
                  <ellipse 
                    cx="40" 
                    cy="48" 
                    rx="15" 
                    ry="6" 
                    :fill="fish.stripeColor || fish.baseColor"
                    opacity="0.7"
                  />
                  <path 
                    d="M 75 30 L 78 28 L 75 26" 
                    stroke="#000" 
                    stroke-width="1" 
                    fill="none"
                    opacity="0.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center mt-4">
        <p class="text-muted">No fish linked to this habit yet 🐚</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from "vue"

const props = defineProps({
  habit: Object, // habit info
  fishSpecies: Object, // full fish species map
  fishList: Array // list returned from getFishByHabitId()
})
const emit = defineEmits(["close"])

function closeModal() {
  emit("close")
}

const fish = computed(() => props.fishList?.[0] || null)
const speciesInfo = computed(() =>
  fish.value ? props.fishSpecies[fish.value.species] || {} : {}
)

const formattedLastFed = computed(() => {
  if (!fish.value?.lastFed) return "N/A"
  const date = fish.value.lastFed.toDate ? fish.value.lastFed.toDate() : new Date(fish.value.lastFed)
  return date.toLocaleString()
})


onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap');

/* Base Styling */
* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
  overflow: hidden;
}

.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 2.5rem;
  width: 480px;
  max-width: 90%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12),
              0 0 1px rgba(0, 0, 0, 0.05);
  animation: slideUp 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

/* Close Button */
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  border: none;
  background: rgba(100, 116, 139, 0.1);
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  background: rgba(100, 116, 139, 0.2);
  color: #475569;
  transform: scale(1.05);
}

/* Habit Title */
h5 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1rem 0;
  letter-spacing: -0.5px;
}

/* Description and Frequency Text */
.text-muted {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0.75rem 0;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0.75rem 0;
}

/* Fish Section */
.fish-section {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  margin-top: 1.5rem !important;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  animation: slideUp 0.3s ease 0.1s both;
}

h6 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1.25rem 0 !important;
  letter-spacing: -0.3px;
}

.fish-section p {
  margin: 0.75rem 0;
  font-size: 0.95rem;
}

.fish-section p strong {
  color: #0f172a;
  font-weight: 600;
}

/* Fish Preview Circle */
.fish-preview {
  width: 200px !important;
  height: 150px !important;
  border-radius: 50%;
  margin: 1.5rem auto 0 !important;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
}

.fish-emoji {
  font-size: 3.5rem !important;
  animation: float 3s ease-in-out infinite;
}

/* Empty State */
.text-center {
  text-align: center;
  margin-top: 1.5rem !important;
  animation: fadeIn 0.4s ease;
}

.text-center p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0.75rem 0;
}

.text-center p:first-child {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
}

.text-center p:last-child {
  color: #cbd5e1;
  font-size: 0.85rem;
}

/* Margin Utilities */
.mb-2 {
  margin-bottom: 0.75rem !important;
}

.mt-3 {
  margin-top: 1rem !important;
}

.mt-4 {
  margin-top: 1.5rem !important;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .modal-content {
    padding: 1.75rem;
    width: 100%;
  }

  h5 {
    font-size: 1.25rem;
  }

  .fish-preview {
    width: 120px !important;
    height: 120px !important;
  }

  .fish-emoji {
    font-size: 2.75rem !important;
  }
}
</style>