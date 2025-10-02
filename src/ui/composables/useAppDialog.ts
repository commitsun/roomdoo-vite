import { markRaw } from 'vue';
import { useDialog } from 'primevue/usedialog';
import { useDynamicDialogsStore } from '@/infrastructure/stores/dynamicDialogs';

const DEFAULT_PROPS = {
  modal: true,
  draggable: false,
  resizable: false,
  pt: {
    header: { class: 'app-dialog__header' },
    content: { class: 'app-dialog__content' },
    root: { class: 'app-dialog__root' },
  },
};

export function useAppDialog() {
  const dialog = useDialog();
  const store = useDynamicDialogsStore();

  const openDialog = (component: any, options: any = {}) => {
    const id = Date.now();
    const { onClose, templates, ...rest } = options;

    const instance = dialog.open(markRaw(component), {
      ...rest,
      props: {
        ...DEFAULT_PROPS,
        ...(rest.props || {}),
      },
      data: rest.data,
      // slots
      templates: templates && {
        header: templates.header && markRaw(templates.header),
        footer: templates.footer && markRaw(templates.footer),
        closeButton: templates.closeButton && markRaw(templates.closeButton),
      },
      onClose: (e: any) => {
        onClose?.(e);
        store.unRegisterDynamicDialog(id);
      },
    });
    store.registerDynamicDialog(id, instance);
    return instance;
  };
  return { openDialog };
}
