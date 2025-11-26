import { defineStore } from 'pinia';
import { ref } from 'vue';

type SimpleDynamicDialogInstance = {
  close: () => void;
};

type DynamicDialogItem = {
  id: number;
  dialog: SimpleDynamicDialogInstance;
};

export const useDynamicDialogsStore = defineStore('dynamicDialogs', () => {
  const dynamicDialogs = ref<DynamicDialogItem[]>([]);

  const registerDynamicDialog = (id: number, dialog: SimpleDynamicDialogInstance): void => {
    dynamicDialogs.value.push({ id, dialog });
  };

  const unRegisterDynamicDialog = (id: number): void => {
    const indexDialogToClose = dynamicDialogs.value.findIndex((d) => d.id === id);
    if (indexDialogToClose !== -1) {
      dynamicDialogs.value.splice(indexDialogToClose, 1);
    }
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
