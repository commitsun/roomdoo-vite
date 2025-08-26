import { defineStore } from 'pinia';
import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions';
import { ref } from 'vue';

export const useDynamicDialogsStore = defineStore('dynamicDialogs', () => {
  const dynamicDialogs = ref<any[]>([]);

  const registerDynamicDialog = (id: number, dialog: DynamicDialogInstance) => {
    dynamicDialogs.value.push({ id, dialog });
  };

  const unRegisterDynamicDialog = (id: number) => {
    const indexDialogToClose = dynamicDialogs.value.findIndex((d) => d.id === id);
    console.log('indexDialogToClose', indexDialogToClose);
    dynamicDialogs.value.splice(indexDialogToClose, 1);
  };

  const closeAndUnregisterAllDynamicDialogs = () => {
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
