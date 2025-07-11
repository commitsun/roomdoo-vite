<template>
  <Toast @close="consumeNotification" @life-end="consumeNotification" />
  <router-view />
  <!-- start  remove this dialog component when removing legacy folder  -->
  <DialogContainer />
  <!-- end  remove this dialog component when removing legacy folder / -->
  <teleport to="body">
    <div v-if="uiStore.isLoading" class="overlay-spinner">
      <ProgressSpinner />
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from 'vue';
import DialogContainer from '@/_legacy/components/dialogs/DialogContainer.vue';
import Toast from 'primevue/toast';
import { useUIStore } from '@/infrastructure/stores/ui';
import ProgressSpinner from 'primevue/progressspinner';
import { useNotificationStore } from '@/infrastructure/stores/notification';
import { useToast } from 'primevue/usetoast';

export default defineComponent({
  name: 'App',
  components: {
    DialogContainer,
    ProgressSpinner,
    Toast,
  },
  setup() {
    const toast = useToast();
    const notificationStore = useNotificationStore();
    const uiStore = useUIStore();
    const notifications = computed(() => notificationStore.messages);
    const consumeNotification = () => {
      notificationStore.remove();
    };

    watch(
      () => notifications.value.length,
      (newLength, oldLength) => {
        if (newLength > oldLength && newLength > 0) {
          toast.add({
            severity: 'error',
            summary: 'Info',
            detail: notifications.value[0].text,
            life: 3000,
          });
        }
      }
    );

    return {
      uiStore,
      notifications,
      consumeNotification,
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
