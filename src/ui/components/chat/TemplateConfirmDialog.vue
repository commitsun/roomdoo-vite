<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :header="t('chat.templateConfirm.title')"
    :style="{ width: '400px' }"
    :draggable="false"
    :closable="true"
    class="template-confirm-dialog"
  >
    <!-- Confirmation text -->
    <div class="template-confirm-dialog__content">
      <p class="template-confirm-dialog__text">
        {{ t('chat.templateConfirm.confirmMessage') }}
        <strong>{{ template?.name }}</strong>
        ({{ template?.language.toUpperCase() }})
      </p>

      <!-- WhatsApp preview container -->
      <div class="template-confirm-dialog__preview">
        <WhatsAppTemplatePreview v-if="template" :template="template" />
      </div>

      <!-- Manage template link -->
      <a href="#" class="template-confirm-dialog__link" @click.prevent="handleManageTemplate">
        {{ t('chat.templateConfirm.manageTemplate') }}
      </a>
    </div>

    <!-- Footer with buttons -->
    <template #footer>
      <div class="template-confirm-dialog__footer">
        <Button :label="t('common.cancel')" severity="secondary" outlined @click="handleCancel" />
        <Button
          :label="t('chat.templateConfirm.confirmSend')"
          severity="primary"
          @click="handleConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

import WhatsAppTemplatePreview from './WhatsAppTemplatePreview.vue';

import type { MessageTemplate } from '@/domain/types/ChatTypes';

export default defineComponent({
  name: 'TemplateConfirmDialog',
  components: {
    Dialog,
    Button,
    WhatsAppTemplatePreview,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    template: {
      type: Object as PropType<MessageTemplate | null>,
      default: null,
    },
  },
  emits: ['update:visible', 'confirm', 'cancel', 'manage-template'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const dialogVisible = computed({
      get: () => props.visible,
      set: (value) => emit('update:visible', value),
    });

    const handleConfirm = (): void => {
      emit('confirm', props.template);
      dialogVisible.value = false;
    };

    const handleCancel = (): void => {
      emit('cancel');
      dialogVisible.value = false;
    };

    const handleManageTemplate = (): void => {
      emit('manage-template', props.template);
    };

    return {
      t,
      dialogVisible,
      handleConfirm,
      handleCancel,
      handleManageTemplate,
    };
  },
});
</script>

<style lang="scss" scoped>
.template-confirm-dialog {
  &__content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__text {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--p-surface-700);

    strong {
      color: var(--p-surface-900);
    }
  }

  &__preview {
    background-color: #e5ddd5;
    background-image: url('/app-images/internal-chat-bg.jpg');
    background-size: cover;
    background-position: center;
    border-radius: 0.5rem;
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
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

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}
</style>

<style lang="scss">
// Global styles for dialog (not scoped)
.template-confirm-dialog {
  .p-dialog-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--p-surface-200);
  }

  .p-dialog-content {
    padding: 1.25rem;
  }

  .p-dialog-footer {
    padding: 0.75rem 1.25rem;
    border-top: 1px solid var(--p-surface-200);
  }
}
</style>
