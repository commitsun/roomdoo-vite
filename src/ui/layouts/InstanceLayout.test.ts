import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/vue';
import '@testing-library/jest-dom/vitest';
import InstanceLayout from '@/ui/layouts/InstanceLayout.vue';
import { createTestingPinia } from '@pinia/testing';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { ref } from 'vue';
import { renderHeadToString } from '@vueuse/head';

const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}));

const SelectStub = {
  name: 'Select',
  props: ['modelValue', 'options'],
  emits: ['update:modelValue'],
  template: '<select aria-label="language-select"/>',
};
const RouterViewStub = { template: `<div data-testid="router-view-stub"></div>` };

const languages = ref([
  { name: 'English', code: 'en' },
  { name: 'Spanish', code: 'es' },
]);

const pinia = createTestingPinia({
  stubActions: true,
  createSpy: vi.fn,
});

const renderInstanceLayout = (pinia: any) => {
  return render(InstanceLayout, {
    global: {
      plugins: [pinia],
      stubs: { Select: SelectStub, 'router-view': RouterViewStub },
    },
  });
};

beforeEach(() => {
  // @ts-ignore
  global.__TEST_PINIA__ = createTestingPinia({
    stubActions: true,
    createSpy: vi.fn,
  });

  vi.restoreAllMocks();
  push.mockReset();
});

afterEach(() => {
  cleanup();
});

describe('InstanceLayout', () => {
  it('renderiza el select cuando hay varios locales', async () => {
    const store = useInstanceStore();
    vi.spyOn(store, 'instance', 'get').mockReturnValue({
      name: 'Roomdoo Cloud',
      languages: [
        { name: 'English', code: 'en' },
        { name: 'Spanish', code: 'es' },
      ],
    });
    // @ts-ignore
    renderInstanceLayout(global.__TEST_PINIA__);

    expect(screen.getByRole('combobox', { name: 'language-select' })).toBeInTheDocument();
  });

  it('NO renderiza el select cuando solo hay un locale', async () => {
    const store = useInstanceStore();
    vi.spyOn(store, 'instance', 'get').mockReturnValue({
      name: 'Roomdoo Cloud',
      languages: [{ name: 'English', code: 'en' }],
    });

    // @ts-ignore
    renderInstanceLayout(global.__TEST_PINIA__);

    expect(screen.queryByRole('combobox', { name: 'language-select' })).not.toBeInTheDocument();
  });

  it('renderiza el select con idiomas por defecto cuando falla fetchInstance', async () => {
    const store = useInstanceStore();
    vi.spyOn(store, 'fetchInstance').mockRejectedValueOnce(new Error('bad'));

    // @ts-ignore
    renderInstanceLayout(global.__TEST_PINIA__);

    const combo = await screen.findByRole('combobox', { name: 'language-select' });
    expect(combo).toBeInTheDocument();
    expect(push).toHaveBeenCalledWith({ name: 'instance-not-found' });
  });
});
