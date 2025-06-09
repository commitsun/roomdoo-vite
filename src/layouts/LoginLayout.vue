<template>
  <div class="login-layout">
    <div class="login-container">
      <div class="login-content">
        <div class="login-header">
          <img src="/logos/logo-black-new.svg" alt="Roomdoo Logo" class="logo debug-box" />
        </div>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional setup needed for now
</script>

<style lang="scss" scoped>
.login-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.login-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  height: 40px;
  width: auto;
}
</style>
