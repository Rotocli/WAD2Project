<template>
    <div class="col-lg-8">
          <div class="dashboard-card">
            <div class="card-header">
              <h4>Today's Habits</h4>
              <router-link to="/habits" class="view-all btn btn-sm btn-outline-primary">
                View All
              </router-link>
            </div>
            <div class="card-body">
              <div v-if="todaysHabits.length > 0" class="habits-list">
                <div
                  v-for="habit in todaysHabits" 
                  :key="habit.id"
                  class="habit-item"
                  @click="togglePopup(habit.id,$event)"
                >
                  <div class="habit-info">
                  
                    <div class="habit-check">
                      <input
                        type="checkbox"
                        :id="'habit-' + habit.id"
                        :checked="completedHabits.has(habit.id)"
                        @click.stop="toggleHabit(habit.id)"
                        class="form-check-input"
                      >
                    </div>
                    <div>
                      <h6 class="mb-1">{{ habit.name }}</h6>
                      <!-- <small class="text-muted">{{ habit.description }}</small> -->
                    </div>
                  </div>
                  <div class="habit-streak">
                    <i class="bi bi-fire"></i> {{ habit.currentStreak || 0 }}
                  </div>
                  
                  <PopupPanel 
                    v-if="activeHabitId === habit.id"
                    :habitId="habit.id" 
                    :top="popupTop"
                    :left="popupLeft"
                    @undo="undoHabit"
                    @viewMore="viewMoreHabit"
                    @delete="deleteHabit"
                    @click.stop
                    >
                  </PopupPanel>
                  <Teleport to="body"> 
                    <fishModal
                      v-if="modalId === habit.id"
                      :habit="habit"
                      :fishList="fishStore.getFishByHabitId(habit.id)"
                      :fishSpecies="fishStore.fishSpecies"
                      @close="modalId = null"
                    />
                  </Teleport>

                 
                  
                </div>

              </div>
              <div v-else class="text-center py-5">
                <p class="text-muted">No habits for today!</p>
                <router-link to="/habits" class="btn btn-primary">
                  Add Your First Habit
                </router-link>
              </div>
            </div>
          </div>
        </div>
  
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '../../stores/userStore'
import { useHabitStore } from '../../stores/habitStore'
import PopupPanel from '../common/PopupPanel.vue'
import fishModal from '../common/fishModal.vue'
import {useFishStore} from '../../stores/fishStore'


const fishStore=useFishStore()
const userStore = useUserStore()
const habitStore = useHabitStore()
const completedHabits = ref(new Set())
const loading = ref(false)
const error = ref(null)
const activeHabitId = ref(null)  // keeps track of which habit's popup is open
const popupWidth=180
const modalId=ref(null)

const popupTop=ref(0)
const popupLeft=ref(0)
const props = defineProps({
  todaysHabits: Array
})

const handleClickOutside = (event) => {
  if (activeHabitId.value !== null) {
    activeHabitId.value = null
  }
}

onMounted(() => {
  fetchComplete()
  document.addEventListener('click', handleClickOutside)
  console.log('Initial completedHabits:', completedHabits.value) // This will show empty
  // But in template it will update reactively when data loads!
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

function openModal(habitId){
  modalId.value=habitId


}
function closeModal() {
  modalId.value = null
}


async function deleteHabit(habitId) {
  if (confirm('Permanently delete this habit? This will also delete the associated fish.')) {
    try {
      await habitStore.deleteHabit(habitId)
      activeHabitId.value = null
    } catch (err) {
      console.error('Error deleting habit:', err)
    }
  }
}
function viewMoreHabit(habitId){
  console.log(habitId.description)
  activeHabitId.value = null
  openModal(habitId)
}

const undoHabit = async (habitId) => {
  try {
    await habitStore.undoHabit(habitId)
    // update completedHabits if needed
    completedHabits.value.delete(habitId)
    activeHabitId.value = null
  } catch (err) {
    console.error(err)
  }
}



const togglePopup = (habitId, event) => {
  event.stopPropagation()
  if (activeHabitId.value === habitId) {
    activeHabitId.value = null
  } else {
    activeHabitId.value = habitId
    const rect = event.currentTarget.getBoundingClientRect()
    popupTop.value = rect.bottom + window.scrollY
    popupLeft.value = rect.right + window.scrollX - popupWidth
  }
}

async function toggleHabit(habitId) {
  try {
    if (completedHabits.value.has(habitId)) {
      // Undo completion
      completedHabits.value.delete(habitId)
      await habitStore.undoHabit(habitId)
      console.log('Habit undone:', habitId)
    } else {
      // Complete habit
      completedHabits.value.add(habitId)
      await habitStore.completeHabit(habitId)
      console.log('Habit completed:', habitId)
    }
  } catch (err) {
    console.error('Error toggling habit:', err)
    error.value = err
  }
}

const completeHabit = async (habitId) => {
  try {
    await habitStore.completeHabit(habitId)
    await fetchComplete()
    activeHabitId.value = null // Refresh the completed list
  } catch (err) {
    console.error('Error completing habit:', err)
    error.value = err
  }
}

const fetchComplete = async () => {
  loading.value = true
  error.value = null
  try {
    const completedArray = await habitStore.getCompleted()
    completedHabits.value = new Set(completedArray.map(p => p.habitId))
    console.log('Completed habits:', completedHabits.value)
  } catch (err) {
    console.error('Error fetching completed habits:', err)
    error.value = err
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dashboard-card {
  background: hsla(0, 0%, 100%, 0.55); ;
  border-radius: 15px;
  color: black;
  overflow: hidden;
}

.card-header {
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4 {
  margin: 0;
  font-size: 1.25rem;
}

.card-body {
  padding: 1.25rem;
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.habit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #ffffff;;
  border-radius: 10px;
  transition: all 0.3s ease;
  position:relative;
 
}

.habit-item:hover {
  background:  #ffffff;
  transform: translateX(5px);
}

.habit-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.habit-check .form-check-input {
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
}

.habit-check .form-check-input:checked {
  background-color: #b6ec7b;
  border-color: #70e45f;
}

.habit-streak {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #f68432;
  font-weight: bold;
}

.view-all {
  color: #57a4f1;
  font-weight: 600;
  border: 1.5px solid #57a4f1;
}

.view-all:hover {
  background: #57a4f1;
  color: white;
  text-decoration: none;
}

.btn-primary {
  background-color: #547da7;
}
</style>