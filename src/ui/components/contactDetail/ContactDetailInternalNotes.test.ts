import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { ref, reactive, defineComponent, type PropType, watch } from 'vue';
import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';

import Component from './ContactDetailInternalNotes.vue';

// --- i18n mock ---
vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'contacts.notesAndObservations': 'Notes and observations',
    'contacts.internalNotesPlaceholder': 'Write internal notes...',
    'contacts.tags': 'Tags',
    'contacts.select': 'Select...',
    'contacts.tagsSelected': '{count} tags selected',
  };
  return {
    useI18n: () => ({
      t: (k: string, vars?: any) => {
        if (k === 'contacts.tagsSelected') {
          return `${vars?.count} tags selected`;
        }
        return tMap[k] ?? k;
      },
    }),
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
      <div aria-label="value-slot">
        <!-- aquí conectamos el #value del componente -->
        <slot name="value" :value="selected" />
      </div>
    </div>
  `,
});

const ChipStub = {
  name: 'Chip',
  props: {
    label: { type: String, required: true },
    removable: { type: Boolean, default: false },
  },
  emits: ['remove'],
  template: `
    <span class="chip">
      <span class="chip-label">{{ label }}</span>
      <button
        v-if="removable"
        type="button"
        :aria-label="'remove-tag-' + label"
        @click="$emit('remove')"
      >
        x
      </button>
    </span>
  `,
};

const SelectStub = {
  name: 'Select',
  props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'filter', 'placeholder'],
  emits: ['update:modelValue'],
  template: `<div class="pv-select"><slot /></div>`,
};

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

  it('renders labels and textarea placeholder', () => {
    renderWithModel(
      reactive({
        internalNotes: '',
        tags: [],
      }),
    );

    expect(screen.getByText('Notes and observations')).toBeInTheDocument();
    const ta = screen.getByRole('textbox');
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

  it('shows chips below the multiselect when modelValue.tags has items and clicking remove removes them', async () => {
    const { model, rerender } = renderWithModel(
      reactive({
        internalNotes: '',
        tags: [
          { id: 1, name: 'VIP' },
          { id: 3, name: 'NoSpam' },
        ],
      }),
    );

    const vipTexts = screen.getAllByText('VIP');
    const nospamTexts = screen.getAllByText('NoSpam');

    expect(vipTexts.length).toBeGreaterThan(0);
    expect(nospamTexts.length).toBeGreaterThan(0);

    const removeVipButtons = screen.getAllByLabelText('remove-tag-VIP');
    await userEvent.click(removeVipButtons[0]);
    await rerender();

    expect(model.value.tags).toHaveLength(1);
    expect(model.value.tags[0].name).toBe('NoSpam');
  });

  it('renders value slot message "N tags selected" when there are selected tags', async () => {
    const { rerender } = renderWithModel(
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

    expect(screen.getByText('2 tags selected')).toBeInTheDocument();
  });
});

describe('ContactDetailInternalNotes – removeTag internal branches', () => {
  it('early return when modelValue.tags is not an array', () => {
    const model = {
      internalNotes: '',
      tags: null as any,
      name: 'John Doe',
      id: 123,
    };

    const wrapper = mount(Component, {
      props: { modelValue: model },
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

    (wrapper.vm as any).removeTag({ id: 1, name: 'VIP' });

    expect(model.tags).toBeNull();
  });

  it('does nothing when tag is not found in the array (index === -1)', () => {
    const model = {
      internalNotes: '',
      tags: [{ id: 1, name: 'VIP' }],
      name: 'John Doe',
      id: 123,
    };

    const wrapper = mount(Component, {
      props: { modelValue: model },
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

    const spliceSpy = vi.spyOn(model.tags, 'splice');

    (wrapper.vm as any).removeTag({ id: 999, name: 'Unknown' });

    expect(spliceSpy).not.toHaveBeenCalled();
    expect(model.tags).toHaveLength(1);
  });
});
