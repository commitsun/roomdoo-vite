<template>
  <router-view />
  <!-- remove this dialog componente when removing legacy folder  -->
  <DialogContainer />
  <teleport to="body">
    <div v-if="uiStore.isLoading" class="overlay-spinner">
      <ProgressSpinner />
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import DialogContainer from '@/legacy/components/dialogs/DialogContainer.vue';
import { useUIStore } from '@/ui/stores/ui';
import ProgressSpinner from 'primevue/progressspinner';

export default defineComponent({
  name: 'App',
  components: {
    DialogContainer,
    ProgressSpinner,
  },
  setup() {
    const uiStore = useUIStore();
    const simulateLoading = async () => {
      uiStore.startLoading();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      uiStore.stopLoading();
    };
    onMounted(() => {
      uiStore.startLoading();
      setTimeout(() => uiStore.stopLoading(), 3000);
    });

    return {
      uiStore,
      simulateLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
.p-dialog-mask {
  background: rgba(0, 0, 0, 0.5) !important;
}

.overlay-spinner {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
