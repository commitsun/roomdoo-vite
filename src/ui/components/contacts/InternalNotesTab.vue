<template>
  <section class="internal-notes">
    <Textarea v-model="model.internalNotes" rows="5" />
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import Textarea from 'primevue/textarea';

const props = defineProps<{ form: any }>();
const emit = defineEmits<{ (e: 'update:form', v: any): void }>();

const model = computed({
  get: () => props.form,
  set: (v) => emit('update:form', v),
});
</script>

<style scoped lang="scss">
$bp-desktop: 640px;

.internal-notes {
  margin-inline: auto;
  :deep(.p-textarea) {
    width: 100%;
    resize: none;
  }
}
@media (min-width: $bp-desktop) {
  .internal-notes {
    max-width: none;
    height: 310px;
  }
}
@media (min-width: 1024px) {
  .internal-notes {
    width: 680px !important;
  }
}
</style>
