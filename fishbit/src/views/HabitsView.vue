<template>
  <div class="habits-view" >
    <div class="container-fluid p-4">
      <h2 class="mb-4">My Habits</h2>
      <!-- Add New Habit Form Card -->
      <div class="dashboard-card mb-4">
        <div class="card-header">
          <h4>Add Habit</h4>
        </div>
        <div class="card-body">
          <form @submit.prevent="handleCreate" class="d-flex align-items-center gap-2 flex-wrap">
            <input v-model="newHabit.name" placeholder="Habit name" required class="form-control" style="max-width:250px"/>
            <select v-model="newHabit.frequency" class="form-select" style="max-width:150px;">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
            <input
              v-if="newHabit.frequency === 'custom'"
              v-model="newHabit.customFrequency"
              placeholder="Custom frequency"
              class="form-control"
              style="max-width:200px;"
            />
            <button type="submit" class="btn btn-primary">Add Habit</button>
          </form>
        </div>
      </div>
      <!-- Habits List Card -->
      <div class="dashboard-card">
        <div class="card-header">
          <h4>My Habits</h4>
        </div>
        <div class="card-body">
          <div v-if="store.loading">Loading...</div>
          <div v-else>
            <ul class="habits-list">
              <li v-for="habit in store.habits" :key="habit.id" class="habit-item">
                <template v-if="!editingId || editingId !== habit.id">
                  <div class="habit-info">
                    <span class="fw-bold">{{ habit.name }}</span>
                    <span class="text-muted">
                      ({{ habit.frequency }}
                      <span v-if="habit.frequency === 'custom' && habit.customFrequency">: {{ habit.customFrequency }}</span>
                      )
                    </span>
                  </div>
                  <div>
                    <button @click="startEdit(habit)" class="btn btn-sm btn-outline-secondary me-2">Edit</button>
                    <button @click="store.deleteHabit(habit.id)" class="btn btn-sm btn-outline-danger">Delete</button>
                  </div>
                </template>
                <template v-else>
                  <input v-model="editHabit.name" placeholder="Habit name" class="form-control d-inline-block me-2" style="max-width:150px;"/>
                  <select v-model="editHabit.frequency" class="form-select d-inline-block me-2" style="max-width:100px;">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom</option>
                  </select>
                  <input
                    v-if="editHabit.frequency === 'custom'"
                    v-model="editHabit.customFrequency"
                    placeholder="Custom frequency"
                    class="form-control d-inline-block me-2"
                    style="max-width:140px;"
                  />
                  <button @click="handleUpdate(habit.id)" class="btn btn-sm btn-success me-2">Save</button>
                  <button @click="cancelEdit" class="btn btn-sm btn-outline-secondary">Cancel</button>
                </template>
              </li>
            </ul>
          </div>
          <div v-if="store.error" class="text-danger mt-2">{{ store.error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHabitStore } from '../stores/HabitStore'

const store = useHabitStore()
const newHabit = ref({ name: '', frequency: 'daily', customFrequency: '' })
const editingId = ref(null)
const editHabit = ref({})

onMounted(() => {
  store.fetchHabits()
})

const handleCreate = async () => {
  if (!newHabit.value.name) return
  await store.createHabit({ ...newHabit.value })
  newHabit.value.name = ''
  newHabit.value.frequency = 'daily'
  newHabit.value.customFrequency = ''
}
const startEdit = (habit) => {
  editingId.value = habit.id
  editHabit.value = { ...habit }
}
const handleUpdate = async (id) => {
  await store.updateHabit(id, { ...editHabit.value })
  editingId.value = null
  editHabit.value = {}
}
const cancelEdit = () => {
  editingId.value = null
  editHabit.value = {}
}
</script>

<style scoped>
.habits-view {
  min-height: calc(100vh - 70px);
  background: #f8f9fa;
}
.dashboard-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
  margin-bottom: 1.75rem;
}
.card-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e9ecef;
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
  list-style: none;
  padding-left: 0;
  margin-bottom: 0;
}
.habit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}
.habit-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}
.habit-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>