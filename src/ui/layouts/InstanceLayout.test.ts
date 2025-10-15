import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/vue';
import '@testing-library/jest-dom/vitest';
import { createTestingPinia, type TestingPinia } from '@pinia/testing';

import InstanceLayout from '@/ui/layouts/InstanceLayout.vue';
import { useInstanceStore } from '@/infrastructure/stores/instance';

const push = vi.fn();

vi.mock('vue-router', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual, useRouter: () => ({ push }) };
});

const SelectStub = {
  name: 'Select',
  props: ['modelValue', 'options'],
  emits: ['update:modelValue'],
  template: '<select aria-label="language-select"/>',
};
const RouterViewStub = { template: `<div data-testid="router-view-stub"></div>` };

let testPinia: TestingPinia;

const renderInstanceLayout = (pinia: any) => {
  return render(InstanceLayout, {
    global: {
      plugins: [pinia],
      stubs: { Select: SelectStub, 'router-view': RouterViewStub },
    },
  });
};

beforeEach(() => {
  testPinia = createTestingPinia({
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
  it('renders select when there are several locales', async () => {
    const store = useInstanceStore();
    vi.spyOn(store, 'instance', 'get').mockReturnValue({
      name: 'Roomdoo Cloud',
      languages: [
        { name: 'English', code: 'en' },
        { name: 'Spanish', code: 'es' },
      ],
    });

    renderInstanceLayout(testPinia);

    expect(screen.getByRole('combobox', { name: 'language-select' })).toBeInTheDocument();
  });

  it("doesn't render select when there's only one locale", async () => {
    const store = useInstanceStore();
    vi.spyOn(store, 'instance', 'get').mockReturnValue({
      name: 'Roomdoo Cloud',
      languages: [{ name: 'English', code: 'en' }],
    });

    renderInstanceLayout(testPinia);

    expect(screen.queryByRole('combobox', { name: 'language-select' })).not.toBeInTheDocument();
  });

  it("renders select with default locales and redirects to hotel not found page whene there's no instance", async () => {
    const store = useInstanceStore();
    vi.spyOn(store, 'fetchInstance').mockRejectedValueOnce(new Error('bad'));

    renderInstanceLayout(testPinia);

    expect(await screen.findByRole('combobox', { name: 'language-select' })).toBeInTheDocument();
    expect(push).toHaveBeenCalledWith({ name: 'instance-not-found' });
  });
});
