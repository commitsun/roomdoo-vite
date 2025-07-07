<template>
  <div class="login-layout-container">
    <div class="image-container">
      <!-- <img src="/app-images/property-white.svg" /> -->
    </div>
    <div class="form-container">
      <router-view />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { NotFoundError } from '@/application/errors';
import { useRouter } from 'vue-router';

const instanceStore = useInstanceStore();
const router = useRouter();

onMounted(async () => {
  try {
    await instanceStore.fetchInstance();
    // await languageStore.getLanguages();
  } catch (error) {
    console.error('Error fetching instance:', error);
    if (error instanceof NotFoundError) {
      router.push({ name: 'hotel-not-found' });
    } else {
      // console.error('Unexpected error:', error);
    }
  }
});
</script>

<style lang="scss" scoped>
.login-layout-container {
  height: 100svh;
  background-color: #eeeeee;
  display: flex;
  .image-container {
    display: none;
  }
  .form-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    background-color: #f9fafb;
  }
}
@media (min-width: 1024px) {
  .login-layout-container {
    .image-container {
      display: flex;
      width: 33.3%;
      height: 100%;
      background: linear-gradient(to bottom left, #2a0a58, #081b2b, #0e96c8);
    }
    .form-container {
      width: 66.6%;
    }
  }
}
</style>
