<template>
    <div class="row mb-4">
        <div class="col-12">
          <div class="welcome-card">
            <h2>Welcome back, {{ username }}! 👋</h2>
            <p class="text-muted mb-0">{{ motivationalQuote }}</p>
          </div>
        </div>
      </div>
  
</template>

<script>
export default {
    props:['username','motivationalQuote']

}
</script>

<style scoped>
.welcome-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

</style>