<template>
    <div class="row g-4 mb-4">
        
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <i class="bi bi-check2-square"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Habits Active</p>
              <h3 class="stat-value">{{ activeHabitsCount }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <i class="bi bi-heart"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Fish Owned</p>
              <h3 class="stat-value">{{ fishCount }}</h3>
            </div>
          </div>
        </div>
      </div>

  
</template>

<script>
export default {
    props:['currentStreak','totalPoints']


}
</script>

<style>




</style>