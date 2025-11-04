<template>
    <div class="row mb-4">
        <div class="welcome-card col-12">
          <div class="row">
            <div class=" col-6">
            <h2>Welcome back, {{ username }}! 👋</h2>
            <p class="text-muted mb-0">{{ motivationalQuote }}</p>
            </div>
            <div class="col-6">
              <div class="row">
              <div class="col-md-6">
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
              <div class="col-md-6  ">
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
            </div>
            

          </div>
          
          
          
        </div>
      </div>
  
</template>

<script>
export default {
    props:['username','motivationalQuote','activeHabitsCount','fishCount']

}
</script>

<style scoped>
.welcome-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  margin-right: 1rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #212529;
  margin: 0;
}

</style>