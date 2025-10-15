import { defineStore } from 'pinia';
import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions';
import { ref } from 'vue';

export const useDynamicDialogsStore = defineStore('dynamicDialogs', () => {
  const dynamicDialogs = ref<{ id: number; dialog: DynamicDialogInstance }[]>([]);

  const registerDynamicDialog = (id: number, dialog: DynamicDialogInstance): void => {
    dynamicDialogs.value.push({ id, dialog });
  };

  const unRegisterDynamicDialog = (id: number): void => {
    const indexDialogToClose = dynamicDialogs.value.findIndex((d) => d.id === id);
    dynamicDialogs.value.splice(indexDialogToClose, 1);
  };

  const closeAndUnregisterAllDynamicDialogs = (): void => {
    dynamicDialogs.value.forEach((d) => d.dialog.close());
    dynamicDialogs.value = [];
  };

  return {
    dynamicDialogs,
    registerDynamicDialog,
    unRegisterDynamicDialog,
    closeAndUnregisterAllDynamicDialogs,
  };
});
