<template>
    <Teleport to="body">
    <div class="card shadow position-absolute" :style="{ top: `${top}px`, left: `${left}px`, width: '180px' }">
        <div class="list-group list-group-flush">
            <button 
                class="list-group-item list-group-item-action"
                @click="undo"

                
            >
                Undo
            </button>
            <button 
                class="list-group-item list-group-item-action"
                @click="viewMore"
                
            >
                View More
            </button>
            <button 
                class="list-group-item list-group-item-action text-danger"
                @click="del"
                
            >
                Delete
            </button>
        </div>
    </div>
    </Teleport>

  
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// Props from parent component
const props = defineProps({
  habitId: {
    type: [String,Number],
    required: true
  },
  top: {
    type: Number,
    default: 100
  },
  left: {
    type: Number,
    default: 0
  }
})

// Events to notify parent
const emit = defineEmits(['undo', 'viewMore', 'delete'])

// Wrapper methods that emit events
const undo = () => emit('undo', props.habitId)
const viewMore = () => emit('viewMore', props.habitId)
const del = () => emit('delete', props.habitId)
</script>

<style scoped>


</style>