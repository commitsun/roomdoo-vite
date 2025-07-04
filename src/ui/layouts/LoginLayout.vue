<template>
  <div class="login-layout debug-box">
    <div class="left debug-box">esto solo se muestra en desktop</div>
    <div class="right debug-box">
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
    console.log('000');
    await instanceStore.getInstance();
    console.log('000');
    // await languageStore.getLanguages();
  } catch (error) {
    console.error('Error fetching instance:', error);
    if (error instanceof NotFoundError) {
      console.error('Instance not found, redirecting to hotel not found page');
      router.push({ name: 'hotel-not-found' });
    } else {
      // console.error('Unexpected error:', error);
    }
  }
});
</script>

<style lang="scss" scoped>
.login-layout {
  display: flex;
  height: 100vh;
  .left {
    color: white;
    display: none;
    background: linear-gradient(to bottom left, #2a0a58, #081b2b, #0e96c8);
  }
  .right {
    flex: 1;
  }
  @media (min-width: 1024px) {
    .left {
      width: 33.33%;
      display: block;
    }
    .right {
      width: 66.67%;
    }
  }
}
</style>
