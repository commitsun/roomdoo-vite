<template>
  <Accordion :value="props.modelValue" @update:value="onUpdateValue" :lazy="true">
    <AccordionPanel v-for="formPart in visibleFormParts" :key="formPart.id" :value="formPart.value">
      <AccordionHeader>
        <div
          class="flex items-center gap-2"
          :style="{ color: props.modelValue === formPart.value ? 'var(--p-primary-color)' : '' }"
        >
          <component :is="formPart.icon" :size="15" />
          <span>{{ t(formPart.labelKey) }}</span>
          <Badge
            v-if="formPart.badgeKey && badges[formPart.badgeKey]"
            :value="badges[formPart.badgeKey]"
            severity="danger"
            size="small"
          />
        </div>
      </AccordionHeader>
      <AccordionContent>
        <slot name="formPart" :formPart="formPart" />
      </AccordionContent>
    </AccordionPanel>
  </Accordion>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Badge from 'primevue/badge';
import { useI18n } from 'vue-i18n';

type BadgeKey = 'general' | 'documents';

type FormPartConfig = {
  id: 'general' | 'documents' | 'billing' | 'internalNotes';
  value: string;
  icon: unknown;
  labelKey: string;
  show: boolean;
  badgeKey?: BadgeKey;
};

const props = defineProps<{
  modelValue: string | null;
  formParts: FormPartConfig[];
  badges: Record<BadgeKey, number>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
}>();

const { t } = useI18n();

const visibleFormParts = computed(() => props.formParts.filter((part) => part.show));

const onUpdateValue = (value: string | string[] | null | undefined): void => {
  emit('update:modelValue', typeof value === 'string' ? value : null);
};
</script>
