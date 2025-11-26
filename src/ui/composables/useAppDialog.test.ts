import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const dialogOpenSpy = vi.fn();
const fakeInstance = { close: vi.fn(), foo: 'bar' };

vi.mock('primevue/usedialog', () => ({
  useDialog: () => ({
    open: dialogOpenSpy,
  }),
}));

export const registerDynamicDialogSpy = vi.fn();
export const unRegisterDynamicDialogSpy = vi.fn();

vi.mock('@/infrastructure/stores/dynamicDialogs', () => ({
  useDynamicDialogsStore: () => ({
    registerDynamicDialog: registerDynamicDialogSpy,
    unRegisterDynamicDialog: unRegisterDynamicDialogSpy,
  }),
}));

import { useAppDialog } from './useAppDialog';

describe('useAppDialog', () => {
  let dateNowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(123456789);
    dialogOpenSpy.mockReturnValue(fakeInstance);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  it('openDialog() calls dialog.open with component checked, mixes DEFAULT_PROPS with props and passes data', () => {
    const { openDialog } = useAppDialog();

    const Comp = { name: 'AnyComponent' };
    const onCloseSpy = vi.fn();

    const result = openDialog(Comp, {
      props: { modal: false, customProp: 1 },
      data: { foo: 'baz' },
      onClose: onCloseSpy,
    });

    expect(result).toBe(fakeInstance);

    expect(dialogOpenSpy).toHaveBeenCalledTimes(1);
    const [passedComp, passedOpts] = dialogOpenSpy.mock.calls[0];

    expect(passedComp).toBe(Comp);

    expect(passedOpts.props).toMatchObject({
      modal: false,
      draggable: false,
      resizable: false,
      pt: {
        header: { class: 'app-dialog__header' },
        content: { class: 'app-dialog__content' },
        root: { class: 'app-dialog__root' },
      },
      customProp: 1, // extra
    });

    expect(passedOpts.data).toEqual({ foo: 'baz' });

    expect(registerDynamicDialogSpy).toHaveBeenCalledWith(123456789, fakeInstance);

    expect(typeof passedOpts.onClose).toBe('function');
    passedOpts.onClose('evt');

    expect(onCloseSpy).toHaveBeenCalledWith('evt');
    expect(unRegisterDynamicDialogSpy).toHaveBeenCalledWith(123456789);
  });

  it('openDialog() without onClose: it does not fail and deregisters in the wrapper', () => {
    const { openDialog } = useAppDialog();

    openDialog({ name: 'C' }, { props: { draggable: true } });
    const [, opts] = dialogOpenSpy.mock.calls[0];

    expect(() => opts.onClose('evt')).not.toThrow();
    expect(unRegisterDynamicDialogSpy).toHaveBeenCalledWith(123456789);
  });

  it('openDialog() maintains DEFAULT_PROPS when no overrides are passed', () => {
    const { openDialog } = useAppDialog();

    openDialog({ name: 'C' });
    const [, opts] = dialogOpenSpy.mock.calls[0];

    expect(opts.props).toMatchObject({
      modal: true,
      draggable: false,
      resizable: false,
      pt: {
        header: { class: 'app-dialog__header' },
        content: { class: 'app-dialog__content' },
        root: { class: 'app-dialog__root' },
      },
    });
  });
});
