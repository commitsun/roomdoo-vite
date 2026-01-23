<template>
  <div class="whatsapp-preview">
    <!-- Message bubble -->
    <div class="whatsapp-preview__bubble">
      <!-- Header -->
      <div v-if="header" class="whatsapp-preview__header">
        {{ headerText }}
      </div>

      <!-- Body -->
      <div v-if="body" class="whatsapp-preview__body">
        {{ bodyText }}
      </div>

      <!-- Footer -->
      <div v-if="footer" class="whatsapp-preview__footer">
        {{ footer.text }}
      </div>

      <!-- Timestamp -->
      <div class="whatsapp-preview__timestamp">
        {{ currentTime }}
      </div>
    </div>

    <!-- Buttons (outside bubble in WhatsApp style) -->
    <div v-if="buttons && buttons.buttons.length > 0" class="whatsapp-preview__buttons">
      <button
        v-for="(button, index) in buttons.buttons"
        :key="index"
        class="whatsapp-preview__button"
        :class="{
          'whatsapp-preview__button--url': button.type === 'URL',
          'whatsapp-preview__button--phone': button.type === 'PHONE_NUMBER',
        }"
      >
        <ExternalLink v-if="button.type === 'URL'" :size="14" />
        <Phone v-if="button.type === 'PHONE_NUMBER'" :size="14" />
        {{ button.text }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { ExternalLink, Phone } from 'lucide-vue-next';

import type {
  MessageTemplate,
  TemplateHeader,
  TemplateBody,
  TemplateFooter,
  TemplateButtons,
} from '@/domain/types/ChatTypes';

export default defineComponent({
  name: 'WhatsAppTemplatePreview',
  components: {
    ExternalLink,
    Phone,
  },
  props: {
    template: {
      type: Object as PropType<MessageTemplate>,
      required: true,
    },
  },
  setup(props) {
    // Extract components from template
    const header = computed(
      () =>
        props.template.components.find((c) => c.type === 'HEADER') as TemplateHeader | undefined,
    );

    const body = computed(
      () => props.template.components.find((c) => c.type === 'BODY') as TemplateBody | undefined,
    );

    const footer = computed(
      () =>
        props.template.components.find((c) => c.type === 'FOOTER') as TemplateFooter | undefined,
    );

    const buttons = computed(
      () =>
        props.template.components.find((c) => c.type === 'BUTTONS') as TemplateButtons | undefined,
    );

    // Get header text with example values
    const headerText = computed(() => {
      if (header.value === undefined || header.value.format !== 'TEXT') {
        return '';
      }
      return header.value.text ?? '';
    });

    // Get body text with example values replacing placeholders
    const bodyText = computed(() => {
      if (body.value === undefined) {
        return '';
      }
      let text = body.value.text;

      // Replace placeholders with example values
      if (body.value.example?.body_text?.[0]) {
        const examples = body.value.example.body_text[0];
        examples.forEach((example, index) => {
          text = text.replace(`{{${index + 1}}}`, example);
        });
      }

      return text;
    });

    // Current time for timestamp
    const currentTime = computed(() => {
      const now = new Date();
      return now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    });

    return {
      header,
      body,
      footer,
      buttons,
      headerText,
      bodyText,
      currentTime,
    };
  },
});
</script>

<style lang="scss" scoped>
.whatsapp-preview {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 100%;

  &__bubble {
    background-color: #dcf8c6;
    border-radius: 0.5rem;
    border-top-right-radius: 0;
    padding: 0.5rem 0.625rem;
    position: relative;
    box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
  }

  &__header {
    font-weight: 600;
    font-size: 0.875rem;
    color: #000;
    margin-bottom: 0.25rem;
  }

  &__body {
    font-size: 0.875rem;
    line-height: 1.4;
    color: #000;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__footer {
    font-size: 0.75rem;
    color: rgba(0, 0, 0, 0.45);
    margin-top: 0.25rem;
  }

  &__timestamp {
    font-size: 0.6875rem;
    color: rgba(0, 0, 0, 0.45);
    text-align: right;
    margin-top: 0.125rem;
  }

  &__buttons {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    background-color: white;
    border: none;
    border-radius: 0.5rem;
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #00a884;
    cursor: default;
    box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);

    &--url,
    &--phone {
      color: #00a884;
    }
  }
}
</style>
