import { useDialog } from 'primevue/usedialog';

const DEFAULT_PROPS = {
  modal: true,
  draggable: false,
  resizable: false,
  style: { width: 'auto', maxWidth: '100vw' },
  breakpoints: { '960px': '95vw', '640px': '100vw' },
  pt: {
    root: {
      style: {
        maxHeight: '100%',
        borderRadius: '0',
      },
    },
  },
};

export function useAppDialog() {
  const dialog = useDialog();

  function open(component: any, options: any = {}) {
    const merged = {
      ...options,
      props: { ...DEFAULT_PROPS, ...(options.props || {}) },
    };
    return dialog.open(component, merged);
  }

  return { open };
}
