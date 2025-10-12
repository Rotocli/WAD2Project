<template>
    <div class="col-lg-8">
          <div class="dashboard-card">
            <div class="card-header">
              <h4>Today's Habits</h4>
              <router-link to="/habits" class="btn btn-sm btn-outline-primary">
                View All
              </router-link>
            </div>
            <div class="card-body">
              <div v-if="todaysHabits.length > 0" class="habits-list">
                <div 
                  v-for="habit in todaysHabits" 
                  :key="habit.id"
                  class="habit-item"
                >
                  <div class="habit-info">
                    <div class="habit-check">
                      <input 
                        type="checkbox"
                        :id="'habit-' + habit.id"
                        :checked="habit.completedToday"
                        @change="completeHabit(habit.id)"
                        class="form-check-input"
                      >
                    </div>
                    <div>
                      <h6 class="mb-1">{{ habit.name }}</h6>
                      <small class="text-muted">{{ habit.description }}</small>
                    </div>
                  </div>
                  <div class="habit-streak">
                    <i class="bi bi-fire"></i> {{ habit.currentStreak || 0 }}
                  </div>
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

<script>
import { useUserStore } from '../../stores/userStore'
import { useHabitStore } from '../../stores/habitStore'
const userStore = useUserStore()
const habitStore = useHabitStore()

export default {
    props:['todaysHabits'],
    methods: {
        async completeHabit(habitId) {
            try {
            await habitStore.completeHabit(habitId)
            // Show success message or animation
            } catch (error) {
            console.error('Error completing habit:', error)
            }
        }
}}
</script>

<style scoped>
.dashboard-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
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

.habit-check .form-check-input {
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
}

.habit-check .form-check-input:checked {
  background-color: #28a745;
  border-color: #28a745;
}

.habit-streak {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #ff6b6b;
  font-weight: bold;
}


</style>