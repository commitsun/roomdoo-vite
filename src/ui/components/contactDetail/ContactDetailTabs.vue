<template>
  <div class="contact-detail-tabs">
    <Tabs :value="props.modelValue" @update:value="onUpdateValue" :lazy="true">
      <TabList>
        <Tab v-for="formPart in visibleFormParts" :key="formPart.id" :value="formPart.value">
          {{ t(formPart.labelKey) }}
          <Badge
            v-if="formPart.badgeKey && badges[formPart.badgeKey]"
            :value="badges[formPart.badgeKey]"
            severity="danger"
            size="small"
          />
        </Tab>
      </TabList>

      <TabPanels style="height: 450px !important; overflow-y: scroll">
        <TabPanel v-for="formPart in visibleFormParts" :key="formPart.id" :value="formPart.value">
          <slot name="formPart" :formPart="formPart" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Badge from 'primevue/badge';
import { useI18n } from 'vue-i18n';

type BadgeKey = 'general' | 'documents' | 'billing';

type FormPartConfig = {
  id: 'general' | 'documents' | 'billing' | 'internalNotes';
  value: string;
  icon: unknown;
  labelKey: string;
  show: boolean;
  badgeKey?: BadgeKey;
};

const props = defineProps<{
  modelValue: string;
  formParts: FormPartConfig[];
  badges: Record<BadgeKey, number>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const { t } = useI18n();

const visibleFormParts = computed(() => props.formParts.filter((part) => part.show));

const onUpdateValue = (value: string | number): void => {
  emit('update:modelValue', String(value));
};
</script>
