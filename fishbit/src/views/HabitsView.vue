<template>
  <div class="habits-view" >
    <div class="container-fluid p-4">
      <!-- Tabs for Active and Archived -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'" href="#">
            Active Habits ({{ store.activeHabits.length }})
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'archived' }" @click="activeTab = 'archived'" href="#">
            Archived Habits ({{ store.archivedHabits.length }})
          </a>
        </li>
      </ul>

      <!-- Active Habits Tab -->
      <div v-if="activeTab === 'active'">
        <h2 class="habittitle">My Habits</h2>
        <p>View and edit your habits</p>
        <!-- Add New Habit Form Card -->
        <div class="dashboard-card mb-4">
          <div class="card-header">
            <h4>Add Habit</h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleCreate">
              <div class="d-flex align-items-center mb-3">
                <label for="name" class="form-label me-3 ">Habit Name</label>
                <input v-model="newHabit.name" placeholder="" required class="form-control" id="name" style="max-width:250px"/>
              </div>
              <div class="d-flex align-items-center mb-3">
                <label for="repeat" class="form-label me-3 ">Repeat Habit?</label>
                <input v-model="newHabit.repeat" placeholder=""  class="form-checkbox-input" type="checkbox" id="repeat" style="max-width:250px"/>
              </div>
              <div class="d-flex align-items-center mb-3" v-if="newHabit.repeat">
                <label for="frequency" class="form-label me-3">Frequency</label>
                <select v-model="newHabit.frequency" class="form-select me-3" id="frequency" style="max-width:150px;">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
                </select>
                <div class="d-flex align-items-center mx-3" v-if="newHabit.frequency === 'custom'"> 
                  <label for="customFrequency" class="form-label me-1">Every </label>
                  <input
                    type="number"
                    id="customFrequency"
                    v-model="newHabit.customFrequency"
                    placeholder="N"
                    class="form-control"
                    style="max-width:90px;"
                    min="1"
                    required
                  />
                  <label for="customFrequency" class="form-label ms-1">Days</label>
                </div>
              </div>
              <div class="mb-3">
                <label for="habitDescription" class="form-label">Habit Description</label>
                <textarea
                  class="form-control"
                  id="habitDescription"
                  v-model="newHabit.description"
                  rows="3"
                  placeholder="Describe your habit...">
                </textarea>
              </div>
              <button type="submit" class="btn btn-primary">Add Habit</button>
            </form>
          </div>
        </div>

        <!-- Active Habits List Card -->
        <div class="dashboard-card">
          <div class="card-header">
            <h4>Active Habits</h4>
          </div>
          <div class="card-body">
            <div v-if="store.loading">Loading...</div>
            <div v-else>
              <ul class="habits-list">
                <li v-for="habit in store.activeHabits" :key="habit.id" class="habit-item ">
                  <template v-if="!editingId || editingId !== habit.id">
                    <div class="habit-info">
                      <span class="fw-bold">{{ habit.name }}</span>
                      <span v-if="habit.repeat===false" class="text-muted" >No repeat</span>
                      <span v-else-if="habit.repeat===true" class="text-muted">
                        ({{ habit.frequency }}
                        <span v-if="habit.frequency === 'custom' && habit.customFrequency">: Every {{ habit.customFrequency }} Days</span>
                        )
                      </span>
                    </div>
                    <div>
                      <button @click="startEdit(habit)" class="btn btn-sm btn-outline-secondary me-2">Edit</button>
                      <button @click="handleArchive(habit.id)" class="btn btn-sm btn-outline-warning me-2">Archive</button>
                      <button @click="confirmDelete(habit.id)" class="btn btn-sm btn-outline-danger">Delete</button>
                    </div>
                  </template>
                  <template v-else>
                    <input v-model="editHabit.name" placeholder="Habit name" class="form-control d-inline-block me-2" style="max-width:150px;"/>
                    <div class="d-flex align-items-center">
                      <label for="repeat" class="form-label me-3 ">Repeat Habit?</label>
                      <input v-model="editHabit.repeat" placeholder=""  class="form-checkbox-input" type="checkbox" id="repeat" style="max-width:250px"/>
                    </div>

                    <select v-if='editHabit.repeat' v-model="editHabit.frequency" class="form-select d-inline-block me-2" style="max-width:100px;">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="custom">Custom</option>
                    </select>

                    <div class="d-flex align-items-center " v-if="editHabit.frequency === 'custom'"> 
                      <label for="customFrequency" class="form-label me-1">Every </label>
                      <input
                        type="number"
                        id="customFrequency"
                        v-model="editHabit.customFrequency"
                        placeholder="N"
                        class="form-control"
                        style="max-width:90px;"
                        min="1"
                        required key=""
                      />
                      <label for="customFrequency" class="form-label ms-1">Days</label>
                    </div>
                    <div>
                      <button @click="handleUpdate(habit.id)" class="btn btn-sm btn-primary me-2">Save</button>
                      <button @click="cancelEdit" class="btn btn-sm btn-secondary">Cancel</button>
                    </div>
                  </template>
                </li>
              </ul>
            </div>
            <div v-if="store.error" class="text-danger mt-2">{{ store.error }}</div>
          </div>
        </div>
      </div>

      <!-- Archived Habits Tab -->
      <div v-if="activeTab === 'archived'">
        <h2 class="mb-4 habittitle">Archived Habits</h2>
        <div class="dashboard-card">
          <div class="card-header">
            <h4>Archived Habits</h4>
          </div>
          <div class="card-body">
            <div v-if="store.loading">Loading...</div>
            <div v-else-if="store.archivedHabits.length === 0">
              <p class="text-muted">No archived habits yet.</p>
            </div>
            <div v-else>
              <ul class="habits-list">
                <li v-for="habit in store.archivedHabits" :key="habit.id" class="habit-item">
                  <div class="habit-info">
                    <span class="badge bg-secondary">Archived</span>
                    <span class="fw-bold">{{ habit.name }}</span>
                    <span v-if="habit.repeat===false" class="text-muted" >No repeat</span>
                    <span v-else-if="habit.repeat===true" class="text-muted">
                      ({{ habit.frequency }}
                      <span v-if="habit.frequency === 'custom' && habit.customFrequency">: Every {{ habit.customFrequency }} Days</span>
                      )
                    </span>
                  </div>
                  <div>
                    <button @click="handleUnarchive(habit.id)" class="btn btn-sm btn-success me-2">Restore</button>
                    <button @click="confirmDelete(habit.id)" class="btn btn-sm btn-danger">Delete</button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHabitStore } from '../stores/habitStore'
import { useUserStore } from '../stores/userStore'
import { promptSwal } from '../services/alert'

const store = useHabitStore()
const userStore = useUserStore()
const activeTab = ref('active')

const newHabit = ref({
  name: '',
  frequency: 'daily',
  customFrequency: null,
  repeat: false,
  description: ''
})

const editingId = ref(null)
const editHabit = ref({})

async function handleCreate() {
  try {
    await store.createHabit({
      name: newHabit.value.name,
      frequency: newHabit.value.frequency,
      customFrequency: newHabit.value.customFrequency,
      repeat: newHabit.value.repeat,
      description: newHabit.value.description
    })
    newHabit.value = {
      name: '',
      frequency: 'daily',
      customFrequency: null,
      repeat: false,
      description: ''
    }
  } catch (err) {
  }
}

function startEdit(habit) {
  editingId.value = habit.id
  editHabit.value = {
    name: habit.name,
    frequency: habit.frequency,
    customFrequency: habit.customFrequency,
    repeat: habit.repeat,
    description: habit.description || ''
  }
}

function cancelEdit() {
  editingId.value = null
  editHabit.value = {}
}

async function handleUpdate(habitId) {
  try {
    await store.updateHabit(habitId, editHabit.value)
    editingId.value = null
    editHabit.value = {}
  } catch (err) {
  }
}

async function handleArchive(habitId) {
  if (await promptSwal('Archive this habit? Fish will still be visible but habit won\'t appear in your active list.')) {
    try {
      await store.archiveHabit(habitId)
    } catch (err) {
    }
  }
}

async function handleUnarchive(habitId) {
  try {
    await store.unarchiveHabit(habitId)
  } catch (err) {
  }
}

async function confirmDelete(habitId) {
  if ( await promptSwal('Permanently delete this habit? This will also delete the associated fish.')) {
    try {
      await store.deleteHabit(habitId)
    } catch (err) {
    }
  }
}

onMounted(async () => {
  if (userStore.currentUserId) {
    await store.fetchHabits()
  }
})
</script>

<style scoped>
p{
  color: white;
}
.habits-view {
  padding: 2rem;
  min-height: calc(100vh - 70px);
  background: #547da7;
}

.habittitle {
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.dashboard-card {
  background: rgb(255, 255, 255, 0.9);
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
  margin-bottom: 20px;
}

.btn-primary {
  background-color: #68b08f;
  border: none;
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
  list-style: none;
  padding: 0;
}

.habit-item {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  transition: background 0.2s;
  border-radius: 15px;
  gap: 10px;
}

.habit-item:hover {
  background: #f8f9fa;
}

.habit-info {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 200px;
}

.habit-item > div:last-child {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.nav-tabs .nav-link {
  cursor: pointer;
  color: white;
}

.nav-tabs .nav-link.active {
  font-weight: 600;
  color: #3d5976;
}

/* Responsive button wrapping */
@media (max-width: 768px) {
  .habit-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .habit-item > div:last-child {
    width: 100%;
    justify-content: flex-start;
    margin-top: 8px;
  }
  
  .habit-info {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .habit-item > div:last-child button {
    flex: 1 1 auto;
    min-width: calc(50% - 4px);
  }
}
</style>
