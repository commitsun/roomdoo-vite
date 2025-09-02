import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/vue';
import '@testing-library/jest-dom/vitest';
import InstanceLayout from '@/ui/layouts/InstanceLayout.vue';
import { createTestingPinia } from '@pinia/testing';
import { ref } from 'vue';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import { useInstanceStore } from '@/infrastructure/stores/instance';

// -----------------------------
// Router mock (minimal & scoped)
// -----------------------------
const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}));

// --------------------------------------------------
// i18n plugin mock (mínimo y autocontenido en el factory)
// --------------------------------------------------
vi.mock('@/infrastructure/plugins/i18n', () => {
  const { reactive } = require('vue'); // OK dentro del factory (hoisted)
  const i18n = { global: { locale: { value: 'en' } } };
  const availableLocales = reactive([{ label: 'English', value: 'en' }]);
  return {
    i18n,
    availableLocales,
    updateI18nLocale: vi.fn((loc: string) => {
      i18n.global.locale.value = loc;
    }),
    updateI18nAvailableLocales: vi.fn((langs?: Array<{ label: string; value: string }>) => {
      availableLocales.splice(0, availableLocales.length, ...(langs ?? []));
    }),
  };
});
// -----------------------------------------
// Stores mocks usados por InstanceLayout.vue
// -----------------------------------------
const languages = ref([
  { label: 'English', value: 'en' },
  { label: 'Español', value: 'es' },
]);

const fetchInstance = vi.fn();

vi.mock('@/infrastructure/stores/instance', () => ({
  useInstanceStore: () => ({
    fetchInstance,
    get instance() {
      return { languages: languages.value };
    },
  }),
}));

// ------------------------------------
// Stubs mínimos
// ------------------------------------
const SelectStub = {
  name: 'Select',
  props: ['modelValue', 'options'],
  emits: ['update:modelValue'],
  template: '<select aria-label="language-select"/>',
};
const RouterViewStub = { template: `<div data-testid="router-view-stub"></div>` };
let utils: ReturnType<typeof render>;

beforeEach(() => {
  vi.clearAllMocks();
  const pinia = createTestingPinia({
    stubActions: true,
    createSpy: vi.fn,
  });

  utils = render(InstanceLayout, {
    global: {
      plugins: [pinia],
      stubs: { Select: SelectStub, 'router-view': RouterViewStub },
    },
  });
});

describe('InstanceLayout', () => {
  it('renders the language select when multiple locales are available', async () => {
    utils.unmount();
    languages.value = [
      { label: 'English', value: 'en' },
      { label: 'Español', value: 'es' },
    ];
    await waitFor(() => expect(fetchInstance).toHaveBeenCalled());
    utils = render(InstanceLayout, {
      global: { stubs: { Select: SelectStub, 'router-view': RouterViewStub } },
    });
    expect(screen.getByRole('combobox', { name: 'language-select' })).toBeInTheDocument();
  });

  it('does not render the language select when only one locale is available', async () => {
    // Re-render con 1 idioma (configurar ANTES del render)
    utils.unmount();
    languages.value = [{ label: 'English', value: 'en' }];

    await waitFor(() => expect(fetchInstance).toHaveBeenCalled());
    utils = render(InstanceLayout, {
      global: { stubs: { Select: SelectStub, 'router-view': RouterViewStub } },
    });
    console.log(useInstanceStore().instance);
    expect(screen.queryByRole('combobox', { name: 'language-select' })).not.toBeInTheDocument();
  });

  it('navigates to "instance-not-found" when fetchInstance fails', async () => {
    // Re-render con error (configurar ANTES del render)
    utils.unmount();
    fetchInstance.mockRejectedValueOnce(new UnauthorizedError('bad'));

    utils = render(InstanceLayout, {
      global: { stubs: { Select: SelectStub, 'router-view': RouterViewStub } },
    });

    await waitFor(() => expect(fetchInstance).toHaveBeenCalled());
    await waitFor(() => expect(push).toHaveBeenCalledWith({ name: 'instance-not-found' }));
  });
});
