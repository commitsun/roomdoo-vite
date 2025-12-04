// ContactDetailInternalNotes.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { ref, reactive, defineComponent, type PropType, watch } from 'vue';
import { createTestingPinia } from '@pinia/testing';

// --- i18n mock ---
vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'contacts.notesAndObservations': 'Notes and observations',
    'contacts.internalNotesPlaceholder': 'Write internal notes...',
    'contacts.tags': 'Tags',
    'contacts.select': 'Select...',
  };
  return {
    useI18n: () => ({ t: (k: string) => tMap[k] ?? k }),
    createI18n: vi.fn(() => ({ global, install: () => {} })),
  };
});

const TextareaStub = {
  name: 'Textarea',
  inheritAttrs: false,
  props: ['modelValue', 'rows', 'placeholder', 'style'],
  emits: ['update:modelValue'],
  template: `
    <textarea
      :rows="rows || 3"
      :placeholder="placeholder"
      :value="modelValue ?? ''"
      @input="$emit('update:modelValue', $event.target.value)"
      role="textbox"
    ></textarea>
  `,
};

const MultiSelectStub = defineComponent({
  name: 'MultiSelect',
  props: {
    modelValue: { type: Array as PropType<any[]>, default: () => [] },
    options: { type: Array as PropType<any[]>, default: () => [] },
    optionLabel: { type: String, default: 'name' },
    display: { type: String, default: '' },
    filter: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const selected = ref<any[]>(Array.isArray(props.modelValue) ? [...props.modelValue] : []);

    watch(
      () => props.modelValue,
      (v) => {
        selected.value = Array.isArray(v) ? [...v] : [];
      },
      { immediate: true },
    );

    const isSelected = (opt: any) => selected.value.some((x) => x?.id === opt?.id);

    const toggle = (opt: any) => {
      const idx = selected.value.findIndex((x) => x?.id === opt?.id);
      if (idx >= 0) {
        selected.value.splice(idx, 1);
      } else {
        selected.value.push(opt);
      }
      emit('update:modelValue', [...selected.value]);
    };

    return { selected, isSelected, toggle };
  },
  template: `
    <div class="pv-multiselect">
      <div aria-label="multiselect-options">
        <button
          v-for="(o,i) in (options || [])"
          :key="o?.id ?? i"
          type="button"
          :data-testid="'ms-opt-' + (o?.id ?? i)"
          :aria-pressed="isSelected(o) ? 'true' : 'false'"
          @click="toggle(o)"
        >
          {{ (o && o[optionLabel]) ?? o?.name ?? ('opt-' + i) }}
        </button>
      </div>
      <div aria-label="selected-chips">
        <span v-for="(s,i) in selected" :key="'sel-' + (s?.id ?? i)">{{ s?.name }}</span>
      </div>
    </div>
  `,
});

const ChipStub = { name: 'Chip', template: `<span><slot /></span>` };
const SelectStub = {
  name: 'Select',
  props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'filter', 'placeholder'],
  emits: ['update:modelValue'],
  template: `<div class="pv-select"><slot /></div>`,
};

// --- Store de tags (Pinia) ---
const tagsStoreMock = {
  tags: [
    { id: 1, name: 'VIP' },
    { id: 2, name: 'Repeat' },
    { id: 3, name: 'NoSpam' },
  ],
};

vi.mock('@/infrastructure/stores/tags', () => ({
  useTagsStore: () => tagsStoreMock,
}));

import Component from './ContactDetailInternalNotes.vue';

function renderWithModel(initial: any) {
  const model = ref(initial);

  const utils = render(Component, {
    props: {
      modelValue: model.value,
    },
    global: {
      plugins: [createTestingPinia()],
      components: {
        Textarea: TextareaStub,
        MultiSelect: MultiSelectStub,
        Chip: ChipStub,
        Select: SelectStub,
      },
    },
  });

  const rerender = async () => {
    await utils.rerender({ modelValue: model.value } as any);
  };

  return { ...utils, model, rerender };
}

describe('ContactDetailInternalNotes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders tags and placeholder', () => {
    renderWithModel(
      reactive({
        internalNotes: '',
        tags: [],
      }),
    );

    expect(screen.getByText('Notes and observations')).toBeInTheDocument();
    const ta = screen.getByRole('textbox', { name: '' });
    expect(ta).toHaveAttribute('placeholder', 'Write internal notes...');
    expect(screen.getByText('Tags')).toBeInTheDocument();
  });

  it('v-model of the textarea updates modelValue.internalNotes', async () => {
    const { model, rerender } = renderWithModel(
      reactive({
        internalNotes: '',
        tags: [],
      }),
    );

    const ta = screen.getByRole('textbox');
    await userEvent.type(ta, 'Handle with care');

    await rerender();
    expect(model.value.internalNotes).toBe('Handle with care');
  });

  it('MultiSelect: selects multiple tags and updates modelValue.tags', async () => {
    const { model, rerender } = renderWithModel(
      reactive({
        internalNotes: '',
        tags: [],
      }),
    );

    const optVip = screen.getByTestId('ms-opt-1');
    const optRepeat = screen.getByTestId('ms-opt-2');

    await userEvent.click(optVip);
    await userEvent.click(optRepeat);

    await rerender();

    expect(model.value.tags).toHaveLength(2);
    expect(model.value.tags.map((t: any) => t.name)).toEqual(
      expect.arrayContaining(['VIP', 'Repeat']),
    );
  });

  it('MultiSelect: deselecting removes the tag from the model', async () => {
    const { model, rerender } = renderWithModel(
      reactive({
        internalNotes: '',
        tags: [{ id: 1, name: 'VIP' }],
      }),
    );

    const optVip = screen.getByTestId('ms-opt-1');
    expect(optVip).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(optVip);
    await rerender();

    expect(model.value.tags).toHaveLength(0);
    expect(optVip).toHaveAttribute('aria-pressed', 'false');
  });

  it('displays chips/selected (via stub) when tags are selected', async () => {
    renderWithModel(
      reactive({
        internalNotes: '',
        tags: [{ id: 3, name: 'NoSpam' }],
      }),
    );

    const selectedArea = screen.getByLabelText('selected-chips');
    expect(within(selectedArea).getByText('NoSpam')).toBeInTheDocument();
  });
});
