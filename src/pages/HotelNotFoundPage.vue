<template>
  <div class="hotel-not-found-page">
    <div class="text-center">
      <i class="pi pi-building text-6xl text-gray-400 mb-4"></i>
      <h1 class="text-2xl font-semibold mb-4">Hotel Not Found</h1>
      <p class="text-gray-600 mb-6">
        We couldn't find the hotel you're looking for. Please check the URL or contact support if
        you believe this is an error.
      </p>
      <Button
        label="Go Back"
        icon="pi pi-arrow-left"
        class="p-button-outlined"
        @click="router.push('/login')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const router = useRouter();
</script>

<style scoped>
.hotel-not-found-page {
  width: 100%;
  padding: 2rem;
}
</style>
