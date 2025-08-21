<template>
  <Toast @close="consumeNotification" @life-end="consumeNotification" />
  <router-view />
  <!-- start  remove this dialog component when removing legacy folder  -->
  <DialogContainer />
  <!-- end  remove this dialog component when removing legacy folder / -->
  <DynamicDialog />
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
import { useNotificationsStore } from '@/infrastructure/stores/notifications';
import { useToast } from 'primevue/usetoast';
import DynamicDialog from 'primevue/dynamicdialog';

export default defineComponent({
  name: 'App',
  components: {
    DialogContainer,
    ProgressSpinner,
    DynamicDialog,
    Toast,
  },
  setup() {
    const toast = useToast();
    const notificationStore = useNotificationsStore();
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
            summary: notifications.value[0].text,
            severity: notifications.value[0].severity || 'success',
            life: 5000,
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
