import { useDialog } from 'primevue/usedialog';
import { useDynamicDialogsStore } from '@/infrastructure/stores/dynamicDialogs';
const DEFAULT_PROPS = {
  modal: true,
  draggable: false,
  resizable: false,

  pt: {
    header: {
      class: 'app-dialog__header',
    },
    content: {
      class: 'app-dialog__content',
    },
    root: {
      class: 'app-dialog__root',
    },
  },
};

export function useAppDialog() {
  const dialog = useDialog();

  const dynamicDialogStore = useDynamicDialogsStore();
  const open = (component: any, options: any = {}) => {
    const newId = Date.now();
    const merged = {
      ...options,
      onClose: () => {
        dynamicDialogStore.unRegisterDynamicDialog(newId);
      },
      props: { ...DEFAULT_PROPS, ...(options.props || {}) },
    };
    const dynamicDialog = dialog.open(component, merged);
    dynamicDialogStore.registerDynamicDialog(newId, dynamicDialog);
    return dynamicDialog;
  };

  return { open };
}
