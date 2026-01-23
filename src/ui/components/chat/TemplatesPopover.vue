<template>
  <div class="templates-popover">
    <!-- Header -->
    <div class="templates-popover__header">
      <h3 class="templates-popover__title">{{ t('chat.templates.title') }}</h3>
    </div>

    <!-- Search input -->
    <div class="templates-popover__search">
      <InputText
        v-model="searchQuery"
        :placeholder="t('chat.templates.searchPlaceholder')"
        class="w-full"
      />
    </div>

    <!-- Templates list -->
    <div class="templates-popover__list">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="templates-popover__item"
        @click="selectTemplate(template)"
      >
        <span class="templates-popover__item-name">{{ template.name }}</span>
        <span class="templates-popover__item-meta">
          {{ template.category }} · {{ template.language.toUpperCase() }}
        </span>
      </div>

      <!-- Empty state -->
      <div v-if="filteredTemplates.length === 0" class="templates-popover__empty">
        {{ t('chat.templates.noResults') }}
      </div>
    </div>

    <!-- Footer link -->
    <div class="templates-popover__footer">
      <a href="#" class="templates-popover__link" @click.prevent="$emit('view-more')">
        {{ t('chat.templates.viewMore') }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';

import type { MessageTemplate } from '@/domain/types/ChatTypes';

export default defineComponent({
  name: 'TemplatesPopover',
  components: {
    InputText,
  },
  props: {
    templates: {
      type: Array as PropType<MessageTemplate[]>,
      required: true,
    },
  },
  emits: ['select', 'view-more'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const searchQuery = ref('');

    const filteredTemplates = computed(() => {
      if (searchQuery.value.length === 0) {
        return props.templates;
      }

      const query = searchQuery.value.toLowerCase();
      return props.templates.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.category.toLowerCase().includes(query) ||
          template.language.toLowerCase().includes(query),
      );
    });

    const selectTemplate = (template: MessageTemplate): void => {
      emit('select', template);
    };

    return {
      t,
      searchQuery,
      filteredTemplates,
      selectTemplate,
    };
  },
});
</script>

<style lang="scss" scoped>
.templates-popover {
  width: 320px;
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  padding: 0.5rem;

  &__header {
    padding: 0.5rem 0.5rem 0.5rem;
  }

  &__title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--p-surface-900);
  }

  &__search {
    padding: 0 0.5rem 0.5rem;
  }

  &__list {
    max-height: 280px;
    overflow-y: auto;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: var(--p-surface-50);
    }
  }

  &__item-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--p-surface-900);
  }

  &__item-meta {
    font-size: 0.75rem;
    color: var(--p-surface-500);
  }

  &__empty {
    padding: 1rem 0.5rem;
    text-align: center;
    font-size: 0.875rem;
    color: var(--p-surface-500);
  }

  &__footer {
    padding: 0.5rem;
    border-top: 1px solid var(--p-surface-200);
  }

  &__link {
    font-size: 0.875rem;
    color: var(--p-primary-500);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
