<template>
  <!-- Developer Mode Banner - Only shows for developer accounts -->
  <div v-if="userStore.isDeveloper" class="dev-mode-banner">
    <div class="banner-content">
      <span class="icon">🔧</span>
      <span class="text">
        <strong>DEVELOPER MODE</strong>
        <small>Special tools enabled</small>
      </span>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
</script>

<style scoped>
.dev-mode-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  z-index: 9999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.banner-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon {
  font-size: 20px;
}

.text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.text strong {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.text small {
  font-size: 11px;
  opacity: 0.9;
  font-weight: 400;
}

/* Responsive */
@media (max-width: 768px) {
  .dev-mode-banner {
    padding: 6px 12px;
  }

  .icon {
    font-size: 16px;
  }

  .text strong {
    font-size: 12px;
  }

  .text small {
    font-size: 10px;
  }
}
</style>
