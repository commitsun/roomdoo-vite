<template>
  <Toast @close="consumeNotification" @life-end="consumeNotification" />
  <router-view />
  <!-- start  remove this dialog component when removing legacy folder  -->
  <DialogContainer />
  <!-- end  remove this dialog component when removing legacy folder / -->
  <DynamicDialog />
  <teleport to="body">
    <div v-if="uiStore.isLoading" class="overlay-spinner">
      <ProgressSpinner class="one-color-spinner" />
    </div>
  </teleport>
  <Dialog
    v-if="firstMessage"
    :key="firstMessage.id"
    :header="firstMessage.title"
    modal
    v-model:visible="dialogVisible"
    @hide="onHide"
  >
    {{ firstMessage.text }}
    <template #footer>
      <Button type="button" label="Aceptar" @click="onAccept"></Button>
    </template>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import Toast from 'primevue/toast';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import DynamicDialog from 'primevue/dynamicdialog';
import Dialog from 'primevue/dialog';

import { useTextMessagesStore } from '@/infrastructure/stores/textMessages';
import { useNotificationsStore } from '@/infrastructure/stores/notifications';
import { useUIStore } from '@/infrastructure/stores/ui';
import DialogContainer from '@/_legacy/components/dialogs/DialogContainer.vue';

export default defineComponent({
  name: 'App',
  components: {
    DialogContainer,
    ProgressSpinner,
    DynamicDialog,
    Toast,
    Dialog,
    Button,
  },
  setup() {
    const toast = useToast();
    const { remove: consumeNotification } = useNotificationsStore();
    const { removeTextMessage } = useTextMessagesStore();
    const notificationStore = useNotificationsStore();
    const useTextMessageStore = useTextMessagesStore();
    const uiStore = useUIStore();

    const notifications = computed(() => notificationStore.messages);
    const textMessages = computed(() => useTextMessageStore.messages);

    const firstMessage = computed(() => textMessages.value[0] ?? null);

    const dialogVisible = ref(false);
    watch(
      firstMessage,
      (msg) => {
        dialogVisible.value = Boolean(msg);
      },
      { immediate: true },
    );

    const onHide = (): void => {
      removeTextMessage();
    };

    const onAccept = (): void => {
      dialogVisible.value = false;
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
      },
    );

    return {
      uiStore,
      notifications,
      textMessages,
      firstMessage,
      dialogVisible,
      onHide,
      onAccept,
      consumeNotification,
      removeTextMessage,
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

:deep(.one-color-spinner .p-progress-spinner-circle),
:deep(.one-color-spinner .p-progressspinner-circle),
:deep(.one-color-spinner [data-pc-section='circle']),
:deep(.one-color-spinner circle) {
  stroke: #3b82f6 !important;
}
</style>
