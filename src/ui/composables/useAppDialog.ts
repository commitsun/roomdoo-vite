// useAppDialog.ts
import { defineComponent, h, inject, markRaw } from 'vue';
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
const Bridge = defineComponent({
  name: 'DialogContentBridge',
  setup() {
    const dialogRef = inject<any>('dialogRef');
    return () => {
      const C = dialogRef?.value?.data?.component;
      const p = dialogRef?.value?.data?.props ?? {};
      return C ? h(C, p) : null;
    };
  },
});

export function useAppDialog() {
  const dialog = useDialog();
  const dynamicDialogStore = useDynamicDialogsStore();

  const open = (component: any, options: any = {}) => {
    const newId = Date.now();
    const { contentProps, ...rest } = options;

    // 👇 Evita que Vue haga reactivo al componente
    const RawComponent = markRaw(component);

    const merged = {
      ...rest,
      onClose: (e: any) => {
        rest.onClose?.(e);
        dynamicDialogStore.unRegisterDynamicDialog(newId);
      },
      props: { ...DEFAULT_PROPS, ...(rest.props || {}) },
      data: {
        ...(rest.data || {}),
        component: RawComponent,
        props: { ...(rest.data?.props || {}), ...(contentProps || {}) },
      },
    };

    const instance = dialog.open(Bridge, merged);
    dynamicDialogStore.registerDynamicDialog(newId, instance);
    return instance;
  };

  return { open };
}
